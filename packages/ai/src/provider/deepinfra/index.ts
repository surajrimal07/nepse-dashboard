import { createDeepInfra } from "@ai-sdk/deepinfra";

export function createDeepInfraProvider(apiKey: string) {
	return createDeepInfra({ apiKey });
}
