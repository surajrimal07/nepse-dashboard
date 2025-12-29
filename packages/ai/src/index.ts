import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepInfra } from "@ai-sdk/deepinfra";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createFireworks } from "@ai-sdk/fireworks";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { createPerplexity } from "@ai-sdk/perplexity";
import { createXai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
	generateObject,
	type LanguageModel,
	NoObjectGeneratedError,
	RetryError,
} from "ai";
import { z } from "zod";
import { prompt } from "./prompt.js";
import type { newsSummaryType } from "./schema/news.js";
import { AI_CODES, type GenerateSummaryParams } from "./types/index.js";

export interface GenerateSummaryResult {
	summary: newsSummaryType;
	usage: {
		inputTokens: number | undefined;
		outputTokens: number | undefined;
		totalTokens: number | undefined;
	};
}

export async function generateSummary({
	modelId,
	provider,
	key,
	data,
}: GenerateSummaryParams): Promise<GenerateSummaryResult> {
	if (!modelId || !provider || !key) {
		throw new Error(AI_CODES.MISSING_PARAMS);
	}

	let modelFactory: (modelId: string, key: string) => LanguageModel;

	switch (provider) {
		case "openai":
			modelFactory = (id: string, key: string) =>
				createOpenAI({ apiKey: key })(id);
			break;

		case "gemini":
			modelFactory = (id: string, key: string) =>
				createGoogleGenerativeAI({ apiKey: key })(id);
			break;

		case "anthropic":
			modelFactory = (id: string, key: string) =>
				createAnthropic({ apiKey: key })(id);
			break;

		case "deepinfra":
			modelFactory = (id: string, key: string) =>
				createDeepInfra({ apiKey: key })(id);
			break;
		case "fireworks":
			modelFactory = (id: string, key: string) =>
				createFireworks({ apiKey: key })(id);
			break;
		case "grok":
			modelFactory = (id: string, key: string) =>
				createXai({ apiKey: key })(id);
			break;
		case "mistral":
			modelFactory = (id: string, key: string) =>
				createMistral({ apiKey: key })(id);
			break;
		case "deepseek":
			modelFactory = (id: string, key: string) =>
				createDeepSeek({ apiKey: key })(id);
			break;
		case "perplexity":
			modelFactory = (id: string, key: string) =>
				createPerplexity({ apiKey: key })(id);
			break;
		case "openrouter":
			modelFactory = (id: string, key: string) =>
				createOpenRouter({ apiKey: key })(id);
			break;

		default:
			throw new Error(AI_CODES.INCORRECT_PROVIDER);
	}

	const userMessage = `${prompt}
		Article Details:
		Title: ${data.title || "N/A"}
		Content: ${data.content}
		URL: ${data.url || "N/A"}
		Original Language: ${data.lang}`;

	try {
		const result = await generateObject({
			model: modelFactory(modelId, key),
			prompt: userMessage,
			schema: z.object({
				title: z
					.object({
						english: z
							.string()
							.min(1)
							.describe("Article title translated to English"),
						nepali: z
							.string()
							.min(1)
							.describe(
								"Article title translated to Nepali (Devanagari script)",
							),
					})
					.describe("Title in both English and Nepali"),
				summary: z
					.object({
						english: z
							.string()
							.min(1)
							.describe(
								"Comprehensive 2-3 sentence summary in English covering key financial points",
							),
						nepali: z
							.string()
							.min(1)
							.describe(
								"Comprehensive 2-3 sentence summary in Nepali (Devanagari script) covering key financial points",
							),
					})
					.describe("Summary in both English and Nepali"),
				themes: z
					.array(z.string().min(1))
					.min(2)
					.max(4)
					.describe(
						"2-4 themes relevant to Nepal's financial market (e.g., 'Profit Growth', 'Banking Sector')",
					),
				bias: z
					.object({
						sentiment: z
							.enum(["Positive", "Negative", "Neutral"])
							.describe(
								"Overall market sentiment of the article: Positive, Negative, or Neutral",
							),
						score: z
							.number()
							.min(0)
							.max(100)
							.describe(
								"Numerical sentiment score where 0=very negative, 50=neutral, 100=very positive",
							),
					})
					.describe("Bias and sentiment analysis"),
				originalLanguage: z
					.enum(["eng", "npi"])
					.describe(
						"Language code of the original article: 'eng' for English or 'npi' for Nepali",
					),
			}),
		});

		return {
			summary: result.object,
			usage: {
				inputTokens: result.usage.inputTokens,
				outputTokens: result.usage.outputTokens,
				totalTokens: result.usage.totalTokens,
			},
		};

		//AI_RetryError
	} catch (error) {
		if (NoObjectGeneratedError.isInstance(error)) {
			throw new Error(AI_CODES.MODEL_ERROR);
		}

		if (RetryError.isInstance(error)) {
			throw new Error(AI_CODES.PROVIDER_EXHAUSTED);
		}

		throw error;
	}
}
