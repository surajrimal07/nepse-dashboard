import { createPerplexity } from "@ai-sdk/perplexity";

export function createPerplexityProvider(apiKey: string) {
	return createPerplexity({ apiKey });
}
