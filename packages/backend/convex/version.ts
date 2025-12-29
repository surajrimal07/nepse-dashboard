import { v } from "convex/values";
import { query } from "./_generated/server";

export const isAvailable = query({
	args: { version: v.string() },
	handler: async (ctx, args) => {
		const lastVersion = await ctx.db.query("versions").first();

		//is there new version for this user?
		if (lastVersion && lastVersion.version !== args.version) {
			return true;
		}

		return false;
	},
});

export const getLastVersion = query({
	handler: async (ctx) => {
		return await ctx.db.query("versions").order("desc").first();
	},
});

export const get = query({
	args: { version: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("versions")
			.withIndex("by_version", (q) => q.eq("version", args.version))
			.unique();
	},
});
