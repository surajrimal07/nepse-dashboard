import { v } from "convex/values";
import { query } from "./_generated/server";

const N0_SUMMARY =
	"No summary available. Say the user that article has some issues that its body is empty.";

const NO_BODY = "No content available for this article.";

export const get = query({
	args: {
		url: v.string(),
	},
	handler: async (ctx, args) => {
		const news = await ctx.db
			.query("articleSummaries")
			.withIndex("by_url", (q) => q.eq("url", args.url))
			.first(); //to avoid race conditions

		return {
			summary: news?.summary ?? N0_SUMMARY,
			title: news?.title ?? "No title",
			url: news?.url ?? args.url,
		};
	},
});

export const getBody = query({
	args: {
		chatId: v.id("chats"),
	},
	handler: async (ctx, { chatId }) => {
		const chat = await ctx.db.get(chatId);

		if (!chat) return null;

		const linkedArticleUrl = chat?.linkedArticleUrl;

		if (!linkedArticleUrl) return null;

		const article = await ctx.db
			.query("articleSummaries")
			.withIndex("by_url", (q) => q.eq("url", linkedArticleUrl))
			.first();

		return article?.content ?? NO_BODY;
	},
});

export const getArticleIfAvailable = query({
	args: {
		chatId: v.id("chats"),
	},
	handler: async (ctx, { chatId }) => {
		const chat = await ctx.db.get(chatId);

		if (!chat) return null;

		const linkedArticleUrl = chat?.linkedArticleUrl;

		if (!linkedArticleUrl) return null;

		const article = await ctx.db
			.query("articleSummaries")
			.withIndex("by_url", (q) => q.eq("url", linkedArticleUrl))
			.first();

		return {
			summary: article?.summary ?? N0_SUMMARY,
			title: article?.title ?? "No title",
			url: article?.url ?? linkedArticleUrl,
		};
	},
});
