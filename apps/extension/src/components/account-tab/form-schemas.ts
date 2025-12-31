import z from "@nepse-dashboard/zod";
import type { accountType } from "@/types/account-types";
import { AccountType } from "@/types/account-types";

// Base form schema for all account types
const baseFormSchema = z.object({
	alias: z.string().min(1, "Alias is required").trim(),
	username: z.string().min(1, "Username is required").trim(),
	password: z.string().min(1, "Password is required"),
	type: z.enum([AccountType.TMS, AccountType.MEROSHARE, AccountType.NAASAX]),
	isPrimary: z.boolean().default(false),
});

// TMS form schema
const tmsFormSchema = baseFormSchema.extend({
	type: z.literal(AccountType.TMS),
	broker: z.number().min(1, "Broker is required"),
});

// Meroshare form schema
const meroshareFormSchema = baseFormSchema.extend({
	type: z.literal(AccountType.MEROSHARE),
	broker: z.number().min(1, "DP is required"),
});

// Naasax form schema (broker is optional/null)
const naasaxFormSchema = baseFormSchema.extend({
	type: z.literal(AccountType.NAASAX),
	broker: z.number().nullable().optional(),
});

// Discriminated union for form validation
export const accountFormSchema = z.discriminatedUnion("type", [
	tmsFormSchema,
	meroshareFormSchema,
	naasaxFormSchema,
]);

// Type inference for form data
export type AccountFormData = z.infer<typeof accountFormSchema>;

// Default values function
export function getDefaultFormValues(
	accountType: accountType,
): Partial<AccountFormData> {
	switch (accountType) {
		case AccountType.TMS:
			return {
				alias: "",
				username: "",
				password: "",
				isPrimary: false,
				type: AccountType.TMS,
				broker: 0,
			};
		case AccountType.MEROSHARE:
			return {
				alias: "",
				username: "",
				password: "",
				isPrimary: false,
				type: AccountType.MEROSHARE,
				broker: 0,
			};
		case AccountType.NAASAX:
			return {
				alias: "",
				username: "",
				password: "",
				isPrimary: false,
				type: AccountType.NAASAX,
				broker: null,
			};
		default:
			return {
				alias: "",
				username: "",
				password: "",
				isPrimary: false,
				type: accountType,
			};
	}
}

// Edit form schema (for validation only - no business logic)
export const editFormSchema = z.object({
	alias: z.string().min(1, "Alias is required").trim(),
	password: z.string().min(1, "Password is required"),
});

export type EditFormData = z.infer<typeof editFormSchema>;

// Individual field validators for TanStack Form
export const fieldValidators = {
	alias: (value: string) => {
		const result = z
			.string()
			.min(1, "Alias is required")
			.trim()
			.safeParse(value);
		return result.error ? result.error.issues[0]?.message : undefined;
	},
	username: (value: string) => {
		const result = z
			.string()
			.min(1, "Username is required")
			.trim()
			.safeParse(value);
		return result.error ? result.error.issues[0]?.message : undefined;
	},
	password: (value: string) => {
		const result = z.string().min(1, "Password is required").safeParse(value);
		return result.error ? result.error.issues[0]?.message : undefined;
	},
	broker: (value: number, accountType: string) => {
		if (accountType === AccountType.NAASAX) return undefined;
		const result = z
			.number()
			.min(
				1,
				accountType === AccountType.MEROSHARE
					? "DP is required"
					: "Broker is required",
			)
			.safeParse(value);
		return result.error ? result.error.issues[0]?.message : undefined;
	},
};
