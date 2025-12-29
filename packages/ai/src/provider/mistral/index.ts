import { createMistral } from "@ai-sdk/mistral";

export function createMistralProvider(apiKey: string) {
	return createMistral({ apiKey });
}
