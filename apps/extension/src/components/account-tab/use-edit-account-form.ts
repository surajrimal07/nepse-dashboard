// import { useForm } from "@tanstack/react-form";
// import { useCallback, useEffect, useMemo } from "react";
// import { handleActionResult } from "@/hooks/handle-action";
// import { track } from "@/lib/analytics";
// import type { Account } from "@/types/account-types";
// import { Env, EventName } from "@/types/analytics-types";
// import type { EditFormData } from "./form-schemas";
// import { editFormSchema } from "./form-schemas";

// interface UseEditAccountFormOptions {
// 	onSuccess: () => void;
// 	onError: (message: string) => void;
// }

// export function useEditAccountForm({
// 	onSuccess,
// 	onError,
// }: UseEditAccountFormOptions) {
// 	const { useStateItem, callAction } = useAppState();

// 	const [accounts] = useStateItem("accounts");

// 	const [editingAccount, setEditingAccount] = useStateItem("editingAccount");

// 	// Get current account being edited
// 	const currentAccount = useMemo(
// 		() =>
// 			editingAccount
// 				? accounts.find((acc) => acc.alias === editingAccount)
// 				: null,
// 		[editingAccount, accounts],
// 	);
// 	const form = useForm({
// 		defaultValues: {
// 			alias: currentAccount?.alias || "",
// 			password: currentAccount?.password || "",
// 		} as EditFormData,
// 		validators: {
// 			onChange: ({ value }) => {
// 				const result = editFormSchema.safeParse(value);
// 				return result.success ? undefined : result.error.format()._errors[0];
// 			},
// 		},
// 		onSubmit: async ({ value }) => {
// 			if (!currentAccount) {
// 				onError("No account selected for editing");
// 				return;
// 			}

// 			try {
// 				// Create updated account data
// 				const updatedAccount: Account = {
// 					...currentAccount,
// 					alias: value.alias,
// 					password: value.password,
// 				};

// 				const result = await callAction("addAccount", updatedAccount);

// 				handleActionResult(result);

// 				if (!result.success) {
// 					onError(result.message);
// 					return;
// 				}

// 				setEditingAccount(null);
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

// 	// Reset form when currentAccount changes
// 	useEffect(() => {
// 		if (currentAccount) {
// 			form.reset({
// 				alias: currentAccount.alias,
// 				password: currentAccount.password,
// 			});
// 		}
// 	}, [currentAccount, form]);

// 	// Check if form has changes
// 	const hasChanges = useMemo(() => {
// 		if (!currentAccount) return false;
// 		const formData = form.state.values;
// 		return (
// 			formData.alias !== currentAccount.alias ||
// 			formData.password !== currentAccount.password
// 		);
// 	}, [currentAccount, form.state.values]);

// 	// Reset form when editing account changes
// 	const resetForm = useCallback(() => {
// 		if (currentAccount) {
// 			form.reset({
// 				alias: currentAccount.alias,
// 				password: currentAccount.password,
// 			});
// 		}
// 	}, [currentAccount, form]);

// 	return {
// 		form,
// 		currentAccount,
// 		hasChanges,
// 		resetForm,
// 		setEditingAccount,
// 	};
// }
