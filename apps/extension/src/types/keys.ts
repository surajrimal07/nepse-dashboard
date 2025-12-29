// export type tasks = "title" | "news" | "chat" | "general";

// export type aiProviders =
// 	| "gemini"
// 	| "openai"
// 	| "anthropic"
// 	| "deepseek"
// 	| "grok"
// 	| "deepinfra"
// 	| "fireworks"
// 	| "perplexity"
// 	| "mistral"
// 	| "openrouter";

// export interface LLMModel {
// 	id: string;
// 	errored?: boolean;
// 	lastError?: string;
// }

// export interface LLMApiKey {
// 	key: string;
// 	errored: boolean;
// 	lastError?: string;
// 	lastUsedAt?: number;
// }

// export interface LLMProvider {
// 	provider: aiProviders;

// 	apiKey?: LLMApiKey;

// 	/* modelId → model */
// 	models: Record<string, LLMModel>;

// 	/* per-task default model */
// 	defaults: Partial<Record<tasks, string>>;
// }

// export interface LLMConfig {
// 	provider: Partial<Record<tasks, LLMProvider>>;
// }
