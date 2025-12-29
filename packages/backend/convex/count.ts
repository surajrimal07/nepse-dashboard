import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { updateLastActive } from "./users";
import { countType } from "./utils/types";

export const setCount = mutation({
	args: {
		countType: countType,
		randomId: v.string(),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("loginCount")
			.withIndex("by_randomId", (q) => q.eq("randomId", args.randomId))
			.unique();

		if (existing) {
			const updatedCount = (existing[args.countType] || 0) + 1;
			await ctx.db.patch(existing._id, { [args.countType]: updatedCount });
		} else {
			await ctx.db.insert("loginCount", {
				randomId: args.randomId,
				[args.countType]: 1,
			});
		}
	},
});

export const setActivationCount = mutation({
	args: {
		randomId: v.string(),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("activateCount")
			.withIndex("by_randomId", (q) => q.eq("randomId", args.randomId))
			.unique();

		if (existing) {
			const updatedCount = existing.count + 1;
			await ctx.db.patch(existing._id, { count: updatedCount });
		} else {
			await ctx.db.insert("activateCount", {
				randomId: args.randomId,
				count: 1,
			});
		}

		await updateLastActive(ctx, { randomId: args.randomId });
	},
});
