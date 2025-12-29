import { AI_CODES } from "@nepse-dashboard/ai/types";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "./_generated/server";
import { rateLimiter } from "./ratelimit";
import {
	ModelUsagePurpose,
	modelTypes,
	newsLanguages,
	newsSentiment,
} from "./utils/types";

export const get = query({
	args: {
		url: v.string(),
	},
	handler: async (ctx, args) => {
		const news = await ctx.db
			.query("news")
			.withIndex("by_url", (q) => q.eq("url", args.url))
			.first(); //to avoid race conditions

		if (!news) {
			return null;
		}
		return news;
	},
});

export const getFeedback = query({
	args: {
		newsId: v.id("news"),
		emailId: v.string(),
	},
	handler: async (ctx, args) => {
		const feedback = await ctx.db
			.query("newsFeedback")
			.withIndex("by_newsId_emailId", (q) =>
				q.eq("newsId", args.newsId).eq("emailId", args.emailId),
			)
			.unique();

		return feedback?.value ?? 0;
	},
});

export const getAllFeedback = query({
	args: {
		newsId: v.id("news"),
	},
	handler: async (ctx, args) => {
		const allFeedback = await ctx.db
			.query("newsFeedback")
			.withIndex("by_newsId", (q) => q.eq("newsId", args.newsId))
			.collect();

		return allFeedback;
	},
});

export const hasCache = mutation({
	args: {
		url: v.string(),
	},
	handler: async (ctx, args) => {
		console.log("hasCache called with URL:", args.url);

		const existingSummary = await ctx.db
			.query("news")
			.withIndex("by_url", (q) => q.eq("url", args.url))
			.first();

		if (existingSummary) {
			await ctx.db.patch(existingSummary._id, {
				readCount: (existingSummary.readCount || 0) + 1,
			});

			return { success: true, data: existingSummary };
		}

		return { success: false };
	},
});

// export async function hasCache(ctx: MutationCtx, args: { url: string }) {
// 	const existingSummary = await ctx.db
// 		.query("news")
// 		.withIndex("by_url", (q) => q.eq("url", args.url))
// 		.first();

// 	if (existingSummary) {
// 		await ctx.db.patch(existingSummary._id, {
// 			readCount: (existingSummary.readCount || 0) + 1,
// 		});

// 		return { success: true, data: existingSummary };
// 	}

// 	return { success: false };
// }

// unused //bugged error
// export const increaseView = mutation({
// 	args: {
// 		newsId: v.id("news"),
// 	},
// 	handler: async (ctx, args) => {
// 		const allFeedback = await ctx.db
// 			.query("newsFeedback")
// 			.withIndex("by_newsId", (q) => q.eq("newsId", args.newsId))
// 			.collect();

// 		return allFeedback;
// 	},
// });

export const generateSummary = mutation({
	args: {
		title: v.string(),
		content: v.string(),
		url: v.string(),
		lang: newsLanguages,
		randomId: v.string(),
		emailId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const email = args.emailId;
		const randomId = args.randomId;

		if (!email && !randomId) {
			return {
				success: false,
				message: AI_CODES.AUTH_ERROR,
			};
		}

		if (args.content.length > 10_000) {
			return {
				success: false,
				message: AI_CODES.TOO_MUCH_CONTENT,
			};
		}

		// Parallelize independent operations for better efficiency
		const [user, globalLimit, userLimit, model] = await Promise.all([
			ctx.db
				.query("users")
				.withIndex("by_randomId", (q) => q.eq("randomId", randomId))
				.unique(),

			rateLimiter.limit(ctx, "newsSummaryGlobal", {
				key: "global",
			}),

			rateLimiter.limit(ctx, "newsSummary", {
				key: args.randomId,
			}),

			ctx.runQuery(internal.news.getDefaultModelForTask, {
				task: "News",
			}),
		]);

		if (!user || (email && user.email !== email)) {
			return {
				success: false,
				message: AI_CODES.AUTH_ERROR,
			};
		}

		if (!globalLimit.ok) {
			return {
				success: false,
				message: AI_CODES.GLOBAL_RATE_LIMIT_EXCEEDED,
			};
		}

		if (!userLimit.ok) {
			return {
				success: false,
				message: AI_CODES.USER_RATE_LIMIT_EXCEEDED,
			};
		}

		await ctx.scheduler.runAfter(0, internal.ai.generateSummaryInternal, {
			userId: user._id,
			title: args.title,
			content: args.content,
			url: args.url,
			lang: args.lang,
			model_id: model._id,
			modelId: model.id,
			provider: model.provider,
			key: model.apiKey,
			inputCostPerMillionTokens: model.inputCostPerMillionTokens,
			outputCostPerMillionTokens: model.outputCostPerMillionTokens,
		});

		return {
			success: true,
		};
	},
});

export const getDefaultModelForTask = internalQuery({
	args: { task: modelTypes },
	handler: async (ctx, args) => {
		const defaultModel = await ctx.db
			.query("models")
			.withIndex("by_task_type_default", (q) =>
				q.eq("task_type", args.task).eq("is_default_for_task", true),
			)
			.unique();

		if (!defaultModel) {
			throw new Error(AI_CODES.MODEL_ERROR);
		}

		return defaultModel;
	},
});

export const modelUsageLogs = internalMutation({
	args: {
		inputTokens: v.number(),
		outputTokens: v.number(),
		purpose: ModelUsagePurpose,
		model_id: v.id("models"),
		userId: v.id("users"),
		url: v.string(),
	},
	handler: async (ctx, args) => {
		// find the news_id by url
		const news = await ctx.db
			.query("news")
			.withIndex("by_url", (q) => q.eq("url", args.url))
			.first();

		if (!news) {
			throw new Error("News summary not found for logging usage.");
		}

		const now = Date.now();
		await ctx.db.insert("modelUsageLogs", {
			inputTokens: args.inputTokens,
			outputTokens: args.outputTokens,
			purpose: args.purpose,
			model_id: args.model_id,
			userId: args.userId,
			news: news._id,
			created_at: now,
		});
	},
});

export const userTokenUsage = internalMutation({
	args: {
		userId: v.id("users"),
		tokens_used: v.number(),
	},
	handler: async (ctx, args) => {
		// see if this user has an entry already
		const hasExisting = await ctx.db
			.query("user_tokens_uses")
			.withIndex("by_userId", (q) => q.eq("userId", args.userId))
			.unique();

		const now = Date.now();
		if (hasExisting) {
			await ctx.db.patch(hasExisting._id, {
				tokens_used: (hasExisting.tokens_used || 0) + args.tokens_used,
				updated_at: now,
			});
			return;
		}

		await ctx.db.insert("user_tokens_uses", {
			userId: args.userId,
			tokens_used: args.tokens_used,
			created_at: now,
			updated_at: now,
		});
	},
});

export const tokenUsage = internalMutation({
	args: {
		model: v.id("models"),
		inputTokenCost: v.number(),
		outputTokenCost: v.number(),
		totalCost: v.number(),
		inputTokens: v.number(),
		outputTokens: v.number(),
	},
	handler: async (ctx, args) => {
		// see if this this model has an entry already
		const hasExisting = await ctx.db
			.query("tokenUsage")
			.withIndex("by_model_id", (q) => q.eq("modelId", args.model))
			.unique();

		const now = Date.now();
		if (hasExisting) {
			await ctx.db.patch(hasExisting._id, {
				inputTokenCost: (hasExisting.inputTokenCost || 0) + args.inputTokenCost,
				outputTokenCost:
					(hasExisting.outputTokenCost || 0) + args.outputTokenCost,
				totalCost: (hasExisting.totalCost || 0) + args.totalCost,
				inputTokens: (hasExisting.inputTokens || 0) + args.inputTokens,
				outputTokens: (hasExisting.outputTokens || 0) + args.outputTokens,
				updated_at: now,
			});
			return;
		}

		await ctx.db.insert("tokenUsage", {
			modelId: args.model,
			inputTokenCost: args.inputTokenCost,
			outputTokenCost: args.outputTokenCost,
			totalCost: args.totalCost,
			inputTokens: args.inputTokens,
			outputTokens: args.outputTokens,
			created_at: now,
			updated_at: now,
		});
	},
});

export const saveSummary = mutation({
	args: {
		userId: v.union(v.id("users"), v.string()), //orginal user who generated summary of this news
		model: v.union(v.id("models"), v.string()), //model used to generate this summary
		title: v.object({
			nepali: v.string(),
			english: v.string(),
		}),
		url: v.string(), //unique
		summary: v.object({
			nepali: v.string(),
			english: v.string(),
		}),
		themes: v.array(v.string()),
		bias: v.object({
			sentiment: newsSentiment,
			score: v.number(),
		}),
		originalLanguage: newsLanguages,
		createdAt: v.number(),
		readCount: v.number(),
		positiveCount: v.number(),
		negativeCount: v.number(),
	},
	handler: async (ctx, args) => {
		const result = await ctx.db.insert("news", args);
		return result;
	},
});

export const savenewsError = mutation({
	args: {
		model: v.union(v.id("models"), v.string()), //model used to generate this summary
		url: v.string(), //unique
		error: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("newsSummaryErrors", args);
	},
});

export const getNewsSummaryErrors = query({
	args: {
		url: v.string(),
	},
	handler: async (ctx, args) => {
		const errors = await ctx.db
			.query("newsSummaryErrors")
			.withIndex("by_url", (q) => q.eq("url", args.url))
			.first();

		return errors?.error || AI_CODES.MODEL_ERROR;
	},
});

export const submitFeedback = mutation({
	args: {
		newsId: v.id("news"),
		emailId: v.string(),
		value: v.number(), // 1 = upvote, -1 = downvote, 0 = neutral
	},
	handler: async (ctx, args) => {
		const { newsId, emailId, value } = args;

		if (![1, 0, -1].includes(value)) {
			throw new Error("Invalid feedback value. Must be -1, 0, or 1.");
		}

		const news = await ctx.db.get(newsId);
		if (!news) throw new Error("News not found");

		const existing = await ctx.db
			.query("newsFeedback")
			.withIndex("by_newsId_emailId", (q) =>
				q.eq("newsId", newsId).eq("emailId", emailId),
			)
			.unique();

		const oldValue = existing?.value ?? 0;

		// No change → nothing to do
		if (oldValue === value) {
			return {
				success: true,
				positiveCount: news.positiveCount,
				negativeCount: news.negativeCount,
				value,
			};
		}

		let positive = news.positiveCount;
		let negative = news.negativeCount;

		// Remove old value contribution
		if (oldValue === 1) positive--;
		if (oldValue === -1) negative--;

		// Add new value contribution
		if (value === 1) positive++;
		if (value === -1) negative++;

		// Either update existing row or create a new one
		if (existing) {
			await ctx.db.patch(existing._id, {
				value: value as -1 | 0 | 1,
				updatedAt: Date.now(),
			});
		} else {
			await ctx.db.insert("newsFeedback", {
				newsId,
				emailId,
				value: value as -1 | 0 | 1,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});
		}

		await ctx.db.patch(newsId, {
			positiveCount: positive,
			negativeCount: negative,
		});

		return {
			success: true,
			positiveCount: positive,
			negativeCount: negative,
			value,
		};
	},
});

// export const bulkInsertModels = mutation({
// 	args: {},
// 	handler: async (ctx) => {
// 		const data = [
// 			{
// 				id: "gemini-2.5-flash",
// 				provider: "gemini" as const,
// 				is_active: true,
// 				apiKey: "",
// 				createdAt: 1755528350000,
// 				updated_at: 1755528349000,
// 				inputCostPerMillionTokens: 0.3,
// 				outputCostPerMillionTokens: 2.5,
// 				task_type: "General" as const,
// 				is_default_for_task: false,
// 			},
// 			{
// 				id: "gemini-2.0-flash-lite",
// 				provider: "gemini" as const,
// 				is_active: true,
// 				apiKey: "",
// 				createdAt: 1755528350000,
// 				updated_at: 1755528349000,
// 				inputCostPerMillionTokens: 0.075,
// 				outputCostPerMillionTokens: 0.3,
// 				task_type: "News" as const,
// 				is_default_for_task: true,
// 			},
// 			{
// 				id: "gemini-2.5-pro",
// 				provider: "gemini" as const,
// 				is_active: true,
// 				apiKey: "",
// 				createdAt: 1755528350000,
// 				updated_at: 1755528349000,
// 				inputCostPerMillionTokens: 1.5,
// 				outputCostPerMillionTokens: 10,
// 				task_type: "Chat" as const,
// 				is_default_for_task: false,
// 			},
// 			{
// 				id: "gemini-2.0-flash",
// 				provider: "gemini" as const,
// 				is_active: true,
// 				apiKey: "",
// 				createdAt: 1755528350000,
// 				updated_at: 1755528349000,
// 				inputCostPerMillionTokens: 0.1,
// 				outputCostPerMillionTokens: 0.4,
// 				task_type: "General" as const,
// 				is_default_for_task: true,
// 			},
// 		];

// 		const insertedIds: string[] = [];

// 		for (const item of data) {
// 			const docId = await ctx.db.insert("models", item);
// 			insertedIds.push(docId);
// 		}

// 		return insertedIds;
// 	},
// });
