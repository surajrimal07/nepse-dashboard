// import { useForm } from "@tanstack/react-form";
// import { useCallback, useMemo } from "react";
// import { handleActionResult } from "@/hooks/handle-action";
// import { track } from "@/lib/analytics";
// import {
// 	type Account,
// 	AccountType,
// 	type accountType,
// } from "@/types/account-types";
// import { Env, EventName } from "@/types/analytics-types";
// import type { AccountFormData } from "./form-schemas";
// import { accountFormSchema, getDefaultFormValues } from "./form-schemas";

// interface UseAddAccountFormOptions {
// 	defaultAccountType: accountType;
// 	onSuccess: () => void;
// 	onError: (message: string) => void;
// }

// export function useAddAccountForm({
// 	defaultAccountType,
// 	onSuccess,
// 	onError,
// }: UseAddAccountFormOptions) {
// 	const { useStateItem, callAction } = useAppState();

// 	const [accounts] = useStateItem("accounts");

// 	const form = useForm({
// 		defaultValues: getDefaultFormValues(defaultAccountType) as AccountFormData,
// 		validators: {
// 			onChange: ({ value }) => {
// 				const result = accountFormSchema.safeParse(value);
// 				return result.success ? undefined : result.error.format()._errors[0];
// 			},
// 		},
// 		onSubmit: async ({ value }) => {
// 			try {
// 				// Convert form data to Account format for Zustand
// 				const accountData: Account = {
// 					...value,
// 					broker: value.broker || null,
// 					error: null,
// 					disabled: false,
// 					updatedAt: new Date().toISOString(),
// 					lastLoggedIn: null,
// 				};

// 				const result = await callAction("addAccount", accountData);

// 				handleActionResult(result);

// 				if (!result.success) {
// 					onError(result.message);
// 					return;
// 				}

// 				onSuccess();
// 			} catch (error) {
// 				const message =
// 					error instanceof Error ? error.message : "Failed to update account";

// 				void track({
// 					context: Env.UNIVERSAL,
// 					eventName: EventName.ACCOUNT_RELATED_ERRORS,
// 					params: {
// 						error: message,
// 					},
// 				});

// 				onError(message);
// 			}
// 		},
// 	});
// 	// Check for existing account (for info message)
// 	const existingAccountInfo = useMemo(() => {
// 		const formData = form.state.values;

// 		// Check if we have at least alias filled (most important field)
// 		if (!formData.alias.trim()) {
// 			return null;
// 		}

// 		// Check specifically for alias match
// 		const existingByAlias = accounts.find(
// 			(acc) =>
// 				acc.type === formData.type &&
// 				acc.alias === formData.alias &&
// 				(formData.type === AccountType.NAASAX ||
// 					acc.broker === (formData.broker || 0)),
// 		);

// 		return existingByAlias
// 			? "Alias exists - this will overwrite existing account with this alias."
// 			: null;
// 	}, [accounts, form.state.values]);

// 	// Reset form when account type changes - preserve existing data
// 	const handleAccountTypeChange = useCallback(
// 		(newType: accountType) => {
// 			const currentValues = form.state.values;
// 			const newDefaults = getDefaultFormValues(newType) as AccountFormData;

// 			// Preserve existing data and only change type-specific fields
// 			const preservedValues: AccountFormData = {
// 				...newDefaults,
// 				alias: currentValues.alias,
// 				username: currentValues.username,
// 				password: currentValues.password,
// 				isPrimary: currentValues.isPrimary,
// 			}; // Handle broker field based on account type
// 			if (newType === AccountType.NAASAX) {
// 				(preservedValues as AccountFormData).broker = null;
// 			} else {
// 				(preservedValues as AccountFormData).broker =
// 					currentValues.broker || newDefaults.broker || 0;
// 			}

// 			form.reset(preservedValues);
// 		},
// 		[form],
// 	);

// 	return {
// 		form,
// 		existingAccountInfo,
// 		handleAccountTypeChange,
// 	};
// }
