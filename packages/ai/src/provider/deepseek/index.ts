import { createDeepSeek } from "@ai-sdk/deepseek";

export function createDeepSeekProvider(apiKey: string) {
	return createDeepSeek({ apiKey });
}
