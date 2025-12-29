import z from "@nepse-dashboard/zod";

export const profileParamsSchema = z.object({
	fromAuthFlow: z.boolean(),
});

export const emailSchema = z.object({
	email: z.email("Please enter a valid email address"),
});
