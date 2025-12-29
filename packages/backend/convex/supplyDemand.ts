import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

export const get = query({
	handler: async (ctx) => {
		return await ctx.db.query("supplyDemand").order("desc").first();
	},
});

//todo
export const fetch = action({
	handler: async (ctx) => {
		// Placeholder for any server-side fetching logic if needed in the future
		return { success: true, message: "Fetched successfully" };
	},
});

export const patch = mutation({
	args: {
		highestQuantityperOrder: v.array(
			v.object({
				symbol: v.string(),
				totalBuyOrder: v.optional(v.number()),
				totalBuyQuantity: v.optional(v.number()),
				totalSellOrder: v.optional(v.number()),
				totalSellQuantity: v.optional(v.number()),
				buyQuantityPerOrder: v.optional(v.number()),
				sellQuantityPerOrder: v.optional(v.number()),
				buyToSellOrderRatio: v.optional(v.number()),
				buyToSellQuantityRatio: v.optional(v.number()),
			}),
		),

		highestSupply: v.array(
			v.object({
				symbol: v.string(),
				totalOrder: v.number(),
				totalQuantity: v.number(),
				quantityPerOrder: v.optional(v.number()),
				orderSide: v.optional(v.string()),
			}),
		),

		highestDemand: v.array(
			v.object({
				symbol: v.string(),
				totalOrder: v.number(),
				totalQuantity: v.number(),
				quantityPerOrder: v.optional(v.number()),
				orderSide: v.optional(v.string()),
			}),
		),

		version: v.string(),
		time: v.string(), // ISO date string
		date: v.string(), // ISO date string
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("supplyDemand", args);

		// pathing fails in replay mode, it need to set new data each time
		// const existing = await ctx.db.query("supplyDemand").first();

		// if (existing) {
		// 	return await ctx.db.patch(existing._id, {
		// 		...args,
		// 	});
		// } else {
		// 	await ctx.db.insert("supplyDemand", {
		// 		...args,
		// 	});
		// }
	},
});
