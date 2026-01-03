import { ConvexError, v } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";

const baseUrl = process.env.BACKEND_URL;
const authToken = process.env.BACKEND_TOKEN;

export const get = query({
	args: {
		symbol: v.optional(v.string()),
	},
	handler: async (ctx, { symbol }) => {
		if (!symbol) return null;

		return await ctx.db
			.query("marketDepth")
			.withIndex("by_symbol", (q) => q.eq("symbol", symbol))
			.order("desc")
			.first();
	},
});

export const clearMarketDepth = internalMutation({
	handler: async (ctx) => {
		const allData = await ctx.db.query("marketDepth").collect();

		for (const data of allData) {
			await ctx.db.delete(data._id);
		}

		return true;
	},
});

export const getAll = query({
	args: {
		symbol: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("marketDepth")
			.withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
			.order("asc")
			.collect();
	},
});

// export const setDefaultValue = migrations.define({
// 	table: "marketStatus",
// 	migrateOne: async (ctx) => {
// 		const data = await ctx.db.query("marketStatus").first();

// 		if (data === undefined || data === null) {
// 			await ctx.db.insert("marketStatus", {
// 				state: "Close",
// 				isOpen: false,
// 				asOf: new Date().toISOString(), // Store current date as ISO string
// 				version: 0,
// 			});
// 		}
// 	},
// });

export const fetchMarketDepth = action({
	args: {
		symbol: v.string(),
	},
	handler: async (_, args): Promise<void> => {
		if (!baseUrl || !authToken) {
			throw new ConvexError("BACKEND_URL or BACKEND_TOKEN is not set");
		}

		const url = `${baseUrl}/api/v1/market-depth?symbol=${args.symbol}`;

		await fetch(url, {
			method: "GET",
			headers: {
				Authorization: authToken,
			},
		});
	},
});

export const update = mutation({
	args: {
		symbol: v.string(),
		totalBuyQty: v.number(),
		totalSellQty: v.number(),
		version: v.string(),
		timeStamp: v.number(),
		marketDepth: v.object({
			buyMarketDepthList: v.array(
				v.object({
					stockId: v.number(),
					orderBookOrderPrice: v.number(),
					quantity: v.number(),
					orderCount: v.number(),
					isBuy: v.union(v.literal(1), v.literal(2)),
					buy: v.boolean(),
					sell: v.boolean(),
				}),
			),
			sellMarketDepthList: v.array(
				v.object({
					stockId: v.number(),
					orderBookOrderPrice: v.number(),
					quantity: v.number(),
					orderCount: v.number(),
					isBuy: v.union(v.literal(1), v.literal(2)),
					buy: v.boolean(),
					sell: v.boolean(),
				}),
			),
		}),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("marketDepth", args);
	},
});
