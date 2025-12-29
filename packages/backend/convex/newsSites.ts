import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addSite = mutation({
	args: {
		siteName: v.string(),
	},
	handler: async (ctx, args) => {
		//find if there existing same site entry
		const siteEntry = await ctx.db
			.query("newsSiteRequested")
			.withIndex("by_siteName", (q) => q.eq("siteName", args.siteName))
			.unique();

		if (siteEntry) {
			//update existing entry
			await ctx.db.patch(siteEntry._id, {
				requestCount: siteEntry.requestCount + 1,
				lastRequestedAt: Date.now(),
			});
		} else {
			//create new entry
			await ctx.db.insert("newsSiteRequested", {
				siteName: args.siteName,
				requestCount: 1,
				lastRequestedAt: Date.now(),
			});
		}

		return {
			success: true,
			message:
				"Site request recorded, We will review and add the site on the platform shortly. Thank you for your suggestion!",
		};
	},
});

export const getRequestedSites = query({
	args: {},
	handler: async (ctx) => {
		const sites = await ctx.db
			.query("newsSiteRequested")
			.order("desc")
			.collect();
		return sites;
	},
});
