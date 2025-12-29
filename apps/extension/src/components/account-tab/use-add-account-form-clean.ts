// import { useForm } from "@tanstack/react-form";
// import { useCallback, useMemo } from "react";
// import { handleActionResult } from "@/hooks/handle-action";
// import { track } from "@/lib/analytics";
// import type { Account, accountType } from "@/types/account-types";
// import { Env, EventName } from "@/types/analytics-types";
// import type { AccountFormData } from "./form-schemas";
// import { getDefaultFormValues } from "./form-schemas";
// import { findExistingAccount } from "./utils";

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
// 		onSubmit: async ({ value }) => {
// 			try {
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
// 		if (!formData.alias && !formData.username) return null;

// 		const existing = findExistingAccount(
// 			accounts,
// 			formData.type,
// 			formData.alias || "",
// 			formData.username || "",
// 			formData.broker || 0,
// 		);

// 		return existing
// 			? "Account with this username or alias exists, this will update existing account"
// 			: null;
// 	}, [accounts, form.state.values]);

// 	// Reset form when account type changes
// 	const handleAccountTypeChange = useCallback(
// 		(newType: accountType) => {
// 			const newDefaults = getDefaultFormValues(newType) as AccountFormData;
// 			form.reset(newDefaults);
// 		},
// 		[form],
// 	);

// 	return {
// 		form,
// 		existingAccountInfo,
// 		handleAccountTypeChange,
// 	};
// }
