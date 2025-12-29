import { ConvexError, v } from "convex/values";
import { api } from "./_generated/api";
import { action, internalQuery, mutation, query } from "./_generated/server";
import { indexKeys } from "./utils/types";

const baseUrl = process.env.BACKEND_URL;
const authToken = process.env.BACKEND_TOKEN;

if (!baseUrl || !authToken) {
	throw new ConvexError("BACKEND_URL or BACKEND_TOKEN is not set");
}

export const validIndexes = internalQuery({
	handler: async (ctx) => {
		return await ctx.db.query("indexNames").collect();
	},
});

export const fetchChart = action({
	args: {
		symbol: v.string(),
		type: v.union(v.literal("index"), v.literal("stock")),
		timeframe: v.union(v.literal("1m"), v.literal("1d")),
	},
	returns: v.object({
		success: v.boolean(),
		message: v.string(),
	}),
	handler: async (
		ctx,
		args,
	): Promise<{ success: boolean; message: string }> => {
		// Validate symbol is not empty

		const [stockNames, indexNames] = await Promise.all([
			ctx.runQuery(api.companyNames.getAllStockNames),
			ctx.runQuery(api.indexNames.getAllIndexNames),
		]);

		if (!args.symbol || args.symbol.trim() === "") {
			return { success: false, message: "Symbol cannot be empty" };
		}

		if (args.type === "index") {
			const isValidIndex = indexNames.some(
				(index) => index.index === args.symbol,
			);
			if (!isValidIndex) {
				return { success: false, message: "Invalid index symbol" };
			}
		} else if (args.type === "stock") {
			const isValidStock = stockNames.some(
				(stock) => stock.symbol === args.symbol,
			);
			if (!isValidStock) {
				return { success: false, message: "Invalid stock symbol" };
			}
		} else {
			return { success: false, message: "Invalid type" };
		}

		// Check if the timeframe is missing from database to avoid unnecessary API calls
		let existing = null;

		try {
			if (args.type === "index") {
				existing = await ctx.runQuery(api.indexChart.getChart, {
					index: args.symbol as indexKeys,
					timeframe: args.timeframe,
				});
			} else if (args.type === "stock") {
				existing = await ctx.runQuery(api.company.getChart, {
					symbol: args.symbol,
					timeframe: args.timeframe,
				});
			}
		} catch (_error) {
			return {
				success: false,
				message: "An error occurred while checking existing data",
			};
		}

		// If the timeframe already exists, return success
		if (existing) {
			return {
				success: true,
				message: "Data is already up to date",
			};
		}

		// Fetch the timeframe with proper error handling
		const query = new URLSearchParams({
			type: args.type,
			name: args.symbol,
			timeframe: args.timeframe,
		}).toString();

		const url = `${baseUrl}/api/v1/fetchChart?${query}`;

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

			const response = await fetch(url, {
				method: "GET",
				headers: {
					Authorization: authToken,
				},
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			// Check HTTP status
			if (!response.ok) {
				return {
					success: false,
					message: "An error occurred while fetching the chart",
				};
			}

			const result = await response.json();

			if (!result.success) {
				return {
					success: false,
					message: result.error || "Failed to fetch chart",
				};
			}

			return result;
		} catch (_error) {
			return {
				success: false,
				message: "An error occurred while fetching the chart",
			};
		}
	},
});

export const getChart = query({
	args: {
		index: indexKeys,
		timeframe: v.union(v.literal("1m"), v.literal("1d")),
	},
	handler: async (ctx, args) => {
		const data = await ctx.db
			.query("indexCharts")
			.withIndex("by_index_timeframe", (q) =>
				q.eq("index", args.index).eq("timeframe", args.timeframe),
			)
			.unique();
		return data;
	},
});

export const getLastTimestamp = query({
	args: {
		index: indexKeys,
		timeframe: v.union(v.literal("1m"), v.literal("1d")),
	},
	handler: async (ctx, args) => {
		const chart = await ctx.db
			.query("indexCharts")
			.withIndex("by_index_timeframe", (q) =>
				q.eq("index", args.index).eq("timeframe", args.timeframe),
			)
			.unique();

		if (!chart || !chart.data || chart.data.length === 0) {
			return {
				lastTimestamp: null,
				version: null,
			};
		}

		// Get the last timestamp from the data array
		// Data is in format [[timestamp, value], [timestamp, value], ...]
		const lastDataPoint = chart.data[chart.data.length - 1];
		return {
			lastTimestamp: lastDataPoint[0], // Return the timestamp
			version: chart.version, // Return the current version
		};
	},
});

export const patchChart = mutation({
	args: {
		index: indexKeys,
		data: v.array(v.array(v.number())),
		version: v.string(),
		timeframe: v.union(v.literal("1m"), v.literal("1d")),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("indexCharts")
			.withIndex("by_index_timeframe", (q) =>
				q.eq("index", args.index).eq("timeframe", args.timeframe),
			)
			.unique();

		if (args.timeframe === "1m" && args.data.length > 0) {
			if (existing) {
				return await ctx.db.replace(existing._id, {
					index: args.index,
					data: args.data,
					version: args.version,
					timeframe: args.timeframe,
				});
			}
			// Create new record if none exists
			return await ctx.db.insert("indexCharts", {
				index: args.index,
				data: args.data,
				version: args.version,
				timeframe: args.timeframe,
			});
		}

		if (args.timeframe === "1d" && args.data.length > 0) {
			if (existing) {
				const updatedData = [...existing.data, ...args.data];

				// Sort by timestamp to maintain chronological order
				updatedData.sort((a, b) => a[0] - b[0]);

				return await ctx.db.patch(existing._id, {
					data: updatedData,
					version: args.version,
				});
			} else {
				// Create new record if none exists
				await ctx.db.insert("indexCharts", {
					index: args.index,
					data: args.data,
					version: args.version,
					timeframe: args.timeframe,
				});
			}
		}
	},
});
