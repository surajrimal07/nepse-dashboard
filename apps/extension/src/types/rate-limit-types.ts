import z from "@nepse-dashboard/zod";

export const RateLimitSchema = z.object({
	limit: z.number(),
	windowInSeconds: z.number(),
	success: z.boolean(),
	remaining: z.number(),
	ttl: z.number(),
});

export type RateLimit = z.infer<typeof RateLimitSchema>;
