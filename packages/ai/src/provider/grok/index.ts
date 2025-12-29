import { createXai } from "@ai-sdk/xai";

export function createGrokProvider(apiKey: string) {
	return createXai({ apiKey });
}
