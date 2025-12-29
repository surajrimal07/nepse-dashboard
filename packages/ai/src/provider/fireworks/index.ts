import { createFireworks } from "@ai-sdk/fireworks";

export function createFireworksProvider(apiKey: string) {
	return createFireworks({ apiKey });
}
