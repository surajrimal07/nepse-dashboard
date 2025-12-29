import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { predictions } from "./utils/types";

export const get = query({
	handler: async (ctx) => {
		return await ctx.db.query("nepsePredictions").unique();
	},
});

export const patch = mutation({
	args: {
		prediction: predictions,
		strength: v.number(),
		version: v.string(),
		topCompanies: v.array(
			v.object({
				ticker: v.string(),
				name: v.string(),
				impact: v.number(),
				ltp: v.union(v.number(), v.null()),
				pointchange: v.union(v.number(), v.null()),
				percentchange: v.union(v.number(), v.null()),
				volume: v.optional(v.union(v.number(), v.null())),
			}),
		),
	},
	handler: async (ctx, args) => {
		// Get the existing prediction entry
		const existing = await ctx.db.query("nepsePredictions").unique();
		const now = Date.now();

		if (existing) {
			// Update the existing prediction entry
			await ctx.db.patch(existing._id, {
				...args,
				updatedAt: now,
			});
		} else {
			// Create a new prediction entry
			await ctx.db.insert("nepsePredictions", {
				...args,
				updatedAt: now,
			});
		}
	},
});
