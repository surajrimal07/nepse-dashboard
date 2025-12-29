export const AI_CODES = {
	MISSING_PARAMS: "missingParams",
	INCORRECT_PROVIDER: "incorrectProvider",
	AUTH_ERROR: "authError",
	TOO_MUCH_CONTENT: "tooMuchContent",
	UNABLE_TO_EXTRACT: "unableToExtract",
	UNSUPPORTED_LANGUAGE: "unsupportedLanguage",
	MODEL_ERROR: "modelError",
	UNKNOWN_ERROR: "unknownError",
	NETWORK_ERROR: "networkError",
	USER_RATE_LIMIT_EXCEEDED: "userRateLimitExceeded",
	GENERATION_STARTED: "generationStarted",
	GLOBAL_RATE_LIMIT_EXCEEDED: "globalRateLimitExceeded",
	PROVIDER_EXHAUSTED: "providerExhausted",
	SUMMARY_TIMEOUT: "summaryTimeout",
};

export type aiErrors = (typeof AI_CODES)[keyof typeof AI_CODES];

export type aiErrorType = {
	message: string;
	error?: aiErrors;
	success: boolean;
};

export const aiProviders = {
	gemini: "gemini",
	openai: "openai",
	anthropic: "anthropic",
	deepseek: "deepseek",
	grok: "grok",
	deepinfra: "deepinfra",
	fireworks: "fireworks",
	perplexity: "perplexity",
	mistral: "mistral",
	openrouter: "openrouter",
};

export type aiProvidersType =
	| "gemini"
	| "openai"
	| "anthropic"
	| "deepseek"
	| "grok"
	| "deepinfra"
	| "fireworks"
	| "perplexity"
	| "mistral"
	| "openrouter";

export interface GenerateSummaryParams {
	modelId: string;
	provider: aiProvidersType;
	key: string;
	data: {
		title: string;
		content: string;
		url: string;
		lang: "eng" | "npi" | "und";
	};
}
