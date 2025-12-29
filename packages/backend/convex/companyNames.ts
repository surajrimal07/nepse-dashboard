import { ConvexError, v } from "convex/values";
import { internalAction, mutation, query } from "./_generated/server";

const baseUrl = process.env.BACKEND_URL;
const authToken = process.env.BACKEND_TOKEN;

export const fetchCompanyList = internalAction({
	args: {},
	handler: async (_): Promise<void> => {
		if (!baseUrl || !authToken) {
			throw new ConvexError("BACKEND_URL or BACKEND_TOKEN is not set");
		}

		const url = `${baseUrl}/api/v1/fetchStockList`;

		await fetch(url, {
			method: "GET",
			headers: {
				Authorization: authToken,
			},
		});
	},
});

export const fetchHighCaps = internalAction({
	args: {},
	handler: async (_): Promise<void> => {
		if (!baseUrl || !authToken) {
			throw new ConvexError("BACKEND_URL or BACKEND_TOKEN is not set");
		}

		const url = `${baseUrl}/api/v1/high-caps`;

		await fetch(url, {
			method: "GET",
			headers: {
				Authorization: authToken,
			},
		});
	},
});

export const addHighCaps = mutation({
	args: {
		high_cap_stocks: v.array(
			v.object({
				symbol: v.string(),
				core_capital: v.number(),
				public_shares: v.number(),
				date: v.string(),
				float_cap: v.number(),
				close: v.number(),
				volume: v.number(),
			}),
		),
	},
	handler: async (ctx, args) => {
		for (const stock of args.high_cap_stocks) {
			const existing = await ctx.db
				.query("highcaps")
				.withIndex("by_symbol", (q) => q.eq("symbol", stock.symbol))
				.unique();

			if (existing) {
				await ctx.db.patch(existing._id, stock);
			} else {
				await ctx.db.insert("highcaps", stock);
			}
		}
	},
});

export const getHighCaps = query({
	handler: async (ctx) => {
		return await ctx.db.query("highcaps").take(50);
	},
});

export const getAllStockNames = query({
	handler: async (ctx) => {
		return await ctx.db
			.query("stockNames")
			.withIndex("by_status_instrumentType", (q) =>
				q.eq("status", "A").eq("instrumentType", "Equity"),
			)
			.collect();
	},
});

export const searchStock = query({
	args: {
		search: v.string(),
	},
	handler: async (ctx, args) => {
		const nameResult = await ctx.db
			.query("stockNames")
			.withSearchIndex("search_companies_name", (q) =>
				q
					.search("securityName", args.search)
					.eq("status", "A")
					.eq("instrumentType", "Equity"),
			)
			.collect();

		const symbolResult = await ctx.db
			.query("stockNames")
			.withSearchIndex("search_companies_symbol", (q) =>
				q
					.search("symbol", args.search)
					.eq("status", "A")
					.eq("instrumentType", "Equity"),
			)
			.collect();

		const uniqueResults = [...nameResult, ...symbolResult].filter(
			(stock, index, self) =>
				index === self.findIndex((s) => s._id === stock._id),
		);

		return uniqueResults;
	},
});
