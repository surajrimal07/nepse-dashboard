import z from "@nepse-dashboard/zod";

export const AccountType = {
	TMS: "tms",
	MEROSHARE: "meroshare",
	NAASAX: "naasax",
} as const;

export const accountType = z.union([
	z.literal(AccountType.TMS),
	z.literal(AccountType.MEROSHARE),
	z.literal(AccountType.NAASAX),
]);
export type accountType = z.infer<typeof accountType>;

export const AccountSchema = z.object({
	type: accountType,
	broker: z.number().optional().default(0).nullable(),
	alias: z.string(),
	username: z.string(),
	password: z.string(),
	isPrimary: z.boolean(),
	error: z.string().nullable(),
	disabled: z.boolean(),
	updatedAt: z.iso.datetime().nullable(),
	lastLoggedIn: z.iso.datetime().nullable(),
	isCurrentlyLoggingIn: z.boolean().nullable().default(false),
	pendingLogin: z.boolean().nullable().default(false),
});

export type Account = z.infer<typeof AccountSchema>;

export type ErrorTypes =
	| "credentialError"
	| "usernameError"
	| "passwordError"
	| "generalError"
	| "unknownError"
	| "autoLoginError";

export interface NaasaxTempData {
	username?: string | null;
	password?: string | null;
	alias?: string | null;
	autoLoginAttempts?: number | null;
}
