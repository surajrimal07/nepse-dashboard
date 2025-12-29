import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { createNotification } from "./notification";

export const getAll = query({
	handler: async (ctx) => {
		return await ctx.db
			.query("companyNews")
			.withIndex("by_id")
			.order("desc")
			.collect();
	},
});

export const addCompanyNews = mutation({
	args: {
		items: v.array(
			v.object({
				id: v.number(),
				newsHeadline: v.string(),
				newsBody: v.string(), // plain text
				newsSource: v.string(),
				addedDate: v.string(),
				modifiedDate: v.string(),
				applicationDocumentDetailsList: v.array(
					v.object({
						id: v.number(),
						activeStatus: v.string(),
						submittedDate: v.string(),
						filePath: v.string(),
						encryptedId: v.string(),
					}),
				),
			}),
		),
	},
	handler: async (ctx, args) => {
		for (const exchangeMessages of args.items) {
			// no check, just insert, check is done by the backend already
			await ctx.db.insert("companyNews", exchangeMessages);

			await createNotification(ctx, {
				title: "New Company News",
				body: exchangeMessages.newsHeadline,
				variant: "info",
			});
		}
	},
});
