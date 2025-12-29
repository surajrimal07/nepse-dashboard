import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export function createGoogleProvider(
	apiKey: string,
	model: string,
): LanguageModel {
	const gemini = createGoogleGenerativeAI({ apiKey });
	return gemini(model);
}
