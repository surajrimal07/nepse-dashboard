import { ConvexError, v } from "convex/values";
import { api, internal } from "./_generated/api";
import {
	action,
	internalAction,
	internalQuery,
	type MutationCtx,
	mutation,
	query,
} from "./_generated/server";
import { instrumentType, internalSector, securityStatus } from "./utils/types";

const baseUrl = process.env.BACKEND_URL;
const authToken = process.env.BACKEND_TOKEN;

export const getCompaniesDetailsIfRequired = internalAction({
	args: {},
	handler: async (ctx) => {
		const symbolsToFetch: string[] = await ctx.runQuery(
			internal.company.getAllCompaniesWithoutFullDetails,
		);

		for (const symbol of symbolsToFetch) {
			await ctx.scheduler.runAfter(0, api.company.fetchCompanyDetails, {
				symbol,
			});

			await new Promise((resolve) => setTimeout(resolve, 5000));
		}
		return { success: true, count: symbolsToFetch.length };
	},
});

export const fetchCompanyDetails = action({
	args: {
		symbol: v.string(),
	},
	handler: async (
		_,
		args,
	): Promise<{ success: boolean; message: string; response?: Response }> => {
		if (!baseUrl || !authToken) {
			return { success: false, message: "Configuration error" };
		}

		const url = `${baseUrl}/api/v1/fetchStock?name=${args.symbol}`;

		const response = await fetch(url, {
			method: "GET",
			headers: {
				Authorization: authToken,
			},
		});

		if (!response.ok) {
			return {
				success: false,
				message: `Failed refresh, please try again later`,
			};
		}

		return response.json();
	},
});

export const patchSymbolNames = mutation({
	args: {
		data: v.array(
			v.object({
				securityName: v.string(),
				symbol: v.string(),
				status: securityStatus,
				instrumentType: instrumentType,
			}),
		),
	},
	handler: async (ctx, args) => {
		if (args.data.length === 0) {
			throw new ConvexError("No data provided to patch symbol names");
		}

		const existingSymbols = await ctx.db.query("stockNames").collect();
		const now = Date.now();

		for (const item of args.data) {
			const existingSymbol = existingSymbols.find(
				(s) => s.symbol === item.symbol,
			);
			if (existingSymbol) {
				await ctx.db.patch(existingSymbol._id, item);
			} else {
				await ctx.db.insert("stockNames", {
					...item,
					created_at: now,
					updated_at: now,
				});
			}
		}
	},
});

export const getSymbolsNames = query({
	handler: async (ctx) => {
		return await ctx.db
			.query("stockNames")
			.withIndex("by_status_instrumentType", (q) =>
				q.eq("status", "A").eq("instrumentType", "Equity"),
			)
			.collect();
	},
});

export const getMutualFundsNames = query({
	handler: async (ctx) => {
		return await ctx.db
			.query("stockNames")
			.withIndex("by_status_instrumentType", (q) =>
				q.eq("status", "A").eq("instrumentType", "Mutual Funds"),
			)
			.collect();
	},
});

//also serves as a company intraday data
export const getSingleCompany = query({
	args: {
		symbol: v.string(),
	},

	handler: async (ctx, args) => {
		return await ctx.db
			.query("company")
			.withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
			.unique();
	},
});

export const getAllCompanies = query({
	handler: async (ctx) => {
		return await ctx.db.query("company").collect();
	},
});

export const getChart = query({
	args: {
		symbol: v.string(),
		timeframe: v.union(v.literal("1m"), v.literal("1d")),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("companyCharts")
			.withIndex("by_symbol_timeframe", (q) =>
				q.eq("symbol", args.symbol).eq("timeframe", args.timeframe),
			)
			.unique();
	},
});

export const getLastTimestamp = query({
	args: {
		symbol: v.string(),
		timeframe: v.union(v.literal("1m"), v.literal("1d")),
	},
	handler: async (ctx, args) => {
		const chart = await ctx.db
			.query("companyCharts")
			.withIndex("by_symbol_timeframe", (q) =>
				q.eq("symbol", args.symbol).eq("timeframe", args.timeframe),
			)
			.unique();

		if (!chart || !chart.data || chart.data.length === 0) {
			return {
				lastTimestamp: null,
				version: null,
			};
		}

		// Get the last timestamp from the data array
		// Data is in format [[timestamp, price], [timestamp, price], ...]
		const lastDataPoint = chart.data[chart.data.length - 1];
		return {
			lastTimestamp: lastDataPoint[0], // Return the timestamp
			version: chart.version, // Return the current version
		};
	},
});

async function appendChart(
	ctx: MutationCtx,
	symbol: string,
	data: number[][],
	version: string,
	timeframe: "1m" | "1d",
) {
	const existing = await ctx.db
		.query("companyCharts")
		.withIndex("by_symbol_timeframe", (q) =>
			q.eq("symbol", symbol).eq("timeframe", timeframe),
		)
		.unique();

	if (existing) {
		// Append new data to existing data
		const updatedData = [...existing.data, ...data];

		// Sort by timestamp to maintain chronological order
		updatedData.sort((a, b) => a[0] - b[0]);

		await ctx.db.patch(existing._id, {
			data: updatedData,
			version: version,
		});
	} else {
		// Create new record if none exists
		await ctx.db.insert("companyCharts", {
			symbol: symbol,
			data: data,
			version: version,
			timeframe: timeframe,
		});
	}
}

export const patchChartInBulk = mutation({
	args: {
		items: v.array(
			v.object({
				symbol: v.string(),
				data: v.array(v.array(v.number())),
				version: v.string(),
				timeframe: v.union(v.literal("1m"), v.literal("1d")),
			}),
		),
	},
	handler: async (ctx, args) => {
		for (const item of args.items) {
			appendChart(ctx, item.symbol, item.data, item.version, item.timeframe);
		}
	},
});

export const patchChart = mutation({
	args: {
		symbol: v.string(),
		data: v.array(v.array(v.number())),
		version: v.string(),
		timeframe: v.union(v.literal("1m"), v.literal("1d")),
	},
	handler: async (ctx, args) => {
		appendChart(ctx, args.symbol, args.data, args.version, args.timeframe);
	},
});

export const patchCompany = mutation({
	args: {
		companies: v.array(
			v.object({
				time: v.string(),
				symbol: v.string(),
				openPrice: v.number(),
				highPrice: v.number(),
				lowPrice: v.number(),
				closePrice: v.number(),
				turnover: v.number(),
				previousClose: v.number(),
				change: v.number(),
				percentageChange: v.number(),
				totalTradedShared: v.number(),
				securityName: v.string(),
				sectorName: v.string(),
				internalSector: internalSector,
				color: v.string(),
				version: v.string(),
			}),
		),
	},
	handler: async (ctx, args) => {
		for (const c of args.companies) {
			const existing = await ctx.db
				.query("company")
				.withIndex("by_symbol", (q) => q.eq("symbol", c.symbol))
				.unique();

			if (existing) {
				// Check version before patching
				if (existing.version === c.version) {
					// If version matches, skip patching
					continue;
				}

				await ctx.db.patch(existing._id, c);
			} else {
				await ctx.db.insert("company", c);
			}
		}
	},
});

export const patchdailyCompanyData = mutation({
	args: {
		companies: v.array(
			v.object({
				symbol: v.string(),
				percentage_change_monthly: v.optional(v.number()),
				point_change_monthly: v.optional(v.number()),
				close: v.number(),
			}),
		),
	},
	handler: async (ctx, args) => {
		for (const c of args.companies) {
			const existing = await ctx.db
				.query("company")
				.withIndex("by_symbol", (q) => q.eq("symbol", c.symbol))
				.unique();

			if (existing) {
				await ctx.db.patch(existing._id, {
					percentage_change_monthly: c.percentage_change_monthly,
					point_change_monthly: c.point_change_monthly,
					closePrice: c.close,
				});
			}
		}
	},
});

export const patchCompanyFull = mutation({
	args: {
		symbol: v.string(),
		totalTrades: v.optional(v.number()),
		totalTradeQuantity: v.optional(v.number()),
		lastTradedPrice: v.optional(v.number()),
		fiftyTwoWeekHigh: v.optional(v.number()),
		fiftyTwoWeekLow: v.optional(v.number()),
		lastUpdatedDateTime: v.optional(v.string()),
		listingDate: v.optional(v.string()),
		companyName: v.optional(v.string()),
		email: v.optional(v.string()),
		companyWebsite: v.optional(v.string()),
		companyContactPerson: v.optional(v.string()),
		stockListedShares: v.optional(v.string()),
		paidUpCapital: v.optional(v.string()),
		issuedCapital: v.optional(v.string()),
		marketCapitalization: v.optional(v.string()),
		publicShares: v.optional(v.string()),
		publicPercentage: v.optional(v.number()),
		promoterShares: v.optional(v.string()),
		promoterPercentage: v.optional(v.number()),
		faceValue: v.optional(v.number()),
		tradingStartDate: v.optional(v.string()),
		version: v.string(),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("company")
			.withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
			.unique();

		if (existing?.version === args.version) {
			return;
		}

		if (existing) {
			await ctx.db.patch(existing._id, args);
		}
	},
});

export const getCompanyVersion = query({
	args: {
		symbol: v.string(),
	},
	handler: async (ctx, args) => {
		const data = await ctx.db
			.query("company")
			.withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
			.unique();

		if (!data || !data.version) {
			return null;
		}

		return data.version;
	},
});

export const getAllCompaniesWithoutFullDetails = internalQuery({
	handler: async (ctx) => {
		// Get all companies
		const companies = await ctx.db.query("company").collect();

		// Filter and return only the symbol of companies missing fiftyTwoWeekHigh or fiftyTwoWeekLow
		return companies
			.filter((c) => c.fiftyTwoWeekHigh == null || c.fiftyTwoWeekLow == null)
			.map((c) => c.symbol);
	},
});
