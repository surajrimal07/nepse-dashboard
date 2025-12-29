import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { aiProviders } from "./utils/types";

export const addSuggestion = mutation({
	args: {
		userId: v.string(),
		url: v.string(),
		suggestions: v.array(v.string()),
		summary: v.object({
			summary: v.string(),
			content: v.string(),
			title: v.string(),
			generated_model: v.optional(v.string()),
			generated_provider: v.optional(aiProviders),
		}),
	},
	handler: async (ctx, { userId, url, suggestions, summary }) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", userId))
			.unique();

		if (!user) {
			return;
		}

		await ctx.db.insert("webSuggestions", {
			userId: user._id,
			url,
			suggestions,
			createdAt: Date.now(),
		});

		await ctx.db.insert("articleSummaries", {
			url,
			summary: summary.summary,
			content: summary.content,
			title: summary.title,
			generated_model: summary.generated_model,
			generated_provider: summary.generated_provider,
			userId: user._id,
		});
	},
});

export const getSuggestion = query({
	args: {
		url: v.string(),
	},
	handler: async (ctx, { url }) => {
		const result = await ctx.db
			.query("webSuggestions")
			.withIndex("by_url", (q) => q.eq("url", url))
			.first();

		return result?.suggestions || [];
	},
});
