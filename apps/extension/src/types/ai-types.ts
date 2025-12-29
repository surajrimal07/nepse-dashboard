import z from "@nepse-dashboard/zod";

export const tasksSchema = z.union([
	z.literal("title"),
	z.literal("news"),
	z.literal("chat"),
	z.literal("general"),
]);

export const aiProvidersSchema = z.union([
	z.literal("gemini"),
	z.literal("openai"),
	z.literal("anthropic"),
	z.literal("deepseek"),
	z.literal("grok"),
	z.literal("deepinfra"),
	z.literal("fireworks"),
	z.literal("perplexity"),
	z.literal("mistral"),
	z.literal("openrouter"),
]);

export const AISettingsSchema = z.object({
	model: z.string().nullable(),
	hasKeys: z.boolean(),
	provider: aiProvidersSchema.nullable(),
	apiKey: z.string().nullable(),
});

export type AISettings = z.infer<typeof AISettingsSchema>;

// Models
export const LLMModelSchema = z.object({
	id: z.string(),
	errored: z.boolean().optional(),
	lastError: z.string().optional(),
});

export const LLMApiKeySchema = z.object({
	key: z.string(),
	errored: z.boolean(),
	lastError: z.string().optional(),
	lastUsedAt: z.number().optional(),
});

// Provider
export const LLMProviderSchema = z.object({
	provider: aiProvidersSchema,
	apiKey: LLMApiKeySchema.optional(),
	models: z.record(z.string(), LLMModelSchema),
	defaults: z.record(tasksSchema, z.string()),
});

// Config
export const LLMConfigSchema = z.object({
	provider: z.record(tasksSchema, LLMProviderSchema).optional(),
});

// Example inferred types
export type tasks = z.infer<typeof tasksSchema>;
export type aiProviders = z.infer<typeof aiProvidersSchema>;
export type LLMModel = z.infer<typeof LLMModelSchema>;
export type LLMApiKey = z.infer<typeof LLMApiKeySchema>;
export type LLMProvider = z.infer<typeof LLMProviderSchema>;
export type LLMConfig = z.infer<typeof LLMConfigSchema>;
