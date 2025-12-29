"use node";
import { generateSummary } from "@nepse-dashboard/ai";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { aiProviders, newsLanguages } from "./utils/types";

// Internal action that performs the actual summary generation
export const generateSummaryInternal = internalAction({
	args: {
		userId: v.id("users"),
		title: v.string(),
		content: v.string(),
		url: v.string(),
		lang: newsLanguages,
		model_id: v.id("models"),
		modelId: v.string(),
		provider: aiProviders,
		key: v.string(),
		inputCostPerMillionTokens: v.number(),
		outputCostPerMillionTokens: v.number(),
	},
	handler: async (ctx, args) => {
		try {
			const { summary, usage } = await generateSummary({
				modelId: args.modelId,
				provider: args.provider,
				key: args.key,
				data: {
					title: args.title,
					content: args.content,
					url: args.url,
					lang: args.lang,
				},
			});

			await ctx.runMutation(api.news.saveSummary, {
				userId: args.userId,
				model: args.model_id,
				url: args.url,
				createdAt: Date.now(),
				readCount: 1,
				positiveCount: 0,
				negativeCount: 0,
				...summary,
			});

			const inputTokens = usage.inputTokens || 0;
			const outputTokens = usage.outputTokens || 0;
			const totalTokenCount = inputTokens + outputTokens;
			const inputTokenPricing =
				args.inputCostPerMillionTokens * (inputTokens / 1_000_000);
			const outputTokenPricing =
				args.outputCostPerMillionTokens * (outputTokens / 1_000_000);
			(usage.outputTokens || 0) / 1_000_000;

			await Promise.all([
				ctx.runMutation(internal.news.modelUsageLogs, {
					inputTokens: inputTokens,
					outputTokens: outputTokens,
					purpose: "News",
					model_id: args.model_id,
					userId: args.userId,
					url: args.url,
				}),
				ctx.runMutation(internal.news.tokenUsage, {
					model: args.model_id,
					inputTokenCost: inputTokenPricing,
					outputTokenCost: outputTokenPricing,
					totalCost: inputTokenPricing + outputTokenPricing,
					inputTokens: inputTokens,
					outputTokens: outputTokens,
				}),

				ctx.runMutation(internal.news.userTokenUsage, {
					userId: args.userId,
					tokens_used: totalTokenCount,
				}),
			]);
		} catch (error) {
			await ctx.runMutation(api.news.savenewsError, {
				model: args.model_id,
				url: args.url,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	},
});
