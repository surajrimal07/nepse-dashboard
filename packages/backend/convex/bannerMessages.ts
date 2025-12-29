import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
	handler: async (ctx) => {
		return await ctx.db
			.query("bannerInfoMessages")
			.withIndex("by_isActive", (q) => q.eq("isActive", true))
			.collect();
	},
});

export const add = mutation({
	args: {
		id: v.number(),
		messageTitle: v.string(),
		messageBody: v.string(),
		messageType: v.union(
			v.literal("info"),
			v.literal("warning"),
			v.literal("error"),
		),
		link: v.optional(v.string()),
		isActive: v.boolean(),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("bannerInfoMessages", args);
	},
});
