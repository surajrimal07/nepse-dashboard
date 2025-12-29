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
import type { LanguageModel } from "ai";

const mistralBaseURL = process.env.NEXT_MISTRAL_BASE_URL;

if (!mistralBaseURL) {
	throw new Error("Mistral base URL is not defined in environment variables");
}

export function getModelFactory(
	provider: string,
): (modelId: string, key: string) => LanguageModel {
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
				createMistral({
					apiKey: key,
					baseURL: mistralBaseURL,
				})(id);
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
			throw new Error("Incorrect provider");
	}
	return modelFactory;
}
