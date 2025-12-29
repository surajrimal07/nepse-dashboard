import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const addScreenshot = internalMutation({
	args: { url: v.string(), randId: v.string() },
	handler: async (ctx, args) => {
		await ctx.db.insert("screenshot", {
			randId: args.randId,
			imageUrl: args.url,
		});
	},
});
