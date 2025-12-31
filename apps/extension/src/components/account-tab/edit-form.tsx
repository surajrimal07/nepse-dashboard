import { Button } from "@nepse-dashboard/ui/components/button";
import { cn } from "@nepse-dashboard/ui/lib/utils";
import { Edit3, Eye, EyeOff, X } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import type { FormErrors } from "@/components/account-tab/utils";
import { useAppState } from "@/hooks/use-app";
import useScreenView from "@/hooks/usePageView";
import type { Account } from "@/types/account-types";
import {
	AccountInfo,
	FormInput,
	inputBaseClass,
	inputErrorClass,
	inputReadOnlyClass,
} from "./form-components";
import { getUpdatedValue } from "./utils";

interface EditAccountFormProps {
	accounts: Account[];
	editingAccount: string | null;
	onClose: () => void;
}

// Consolidated form state
interface FormState {
	data: Account;
	originalData: Account;
	errors: FormErrors;
	isSubmitting: boolean;
	showPassword: boolean;
}

const initialFormState: FormState = {
	data: {} as Account,
	originalData: {} as Account,
	errors: {},
	isSubmitting: false,
	showPassword: false,
};

export default function editAccount({
	accounts,
	editingAccount,
	onClose,
}: EditAccountFormProps) {
	const { callAction } = useAppState();

	const open = !!editingAccount;
	useScreenView("/account-edit");

	const [formState, setFormState] = useState<FormState>(initialFormState);
	const passwordInputRef = useRef<HTMLInputElement>(null);

	// Memoized handlers
	const handleCancel = useCallback(() => {
		setFormState(initialFormState);
		onClose();
	}, [onClose]);

	const validateForm = useCallback((): boolean => {
		const editErrors: FormErrors = {};

		if (!formState.data.alias?.trim()) {
			editErrors.alias = "Alias is required";
		}

		if (!formState.data.password?.trim()) {
			editErrors.password = "Password is required";
		}

		setFormState((prev) => ({ ...prev, errors: editErrors }));
		return Object.keys(editErrors).length === 0;
	}, [formState.data.alias, formState.data.password]);

	const handleSubmit = useCallback(async () => {
		if (validateForm() && !formState.isSubmitting) {
			setFormState((prev) => ({ ...prev, isSubmitting: true }));

			try {
				const result = await callAction("addAccount", formState.data);

				if (!result.success) {
					toast.error(result.message);
					setFormState((prev) => ({ ...prev, isSubmitting: false }));
					return;
				}

				onClose();
				toast.success(result.message);
			} catch (error) {
				setFormState((prev) => ({ ...prev, isSubmitting: false }));
				toast.error(
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
				);
			}
		}
	}, [
		validateForm,
		formState.isSubmitting,
		formState.data,
		callAction,
		onClose,
	]);

	// Memoized change detection
	const hasChanges = useMemo(() => {
		const { data, originalData } = formState;
		if (!originalData.alias || !data.alias) return false;

		return (
			data.alias !== originalData.alias ||
			data.password !== originalData.password
		);
	}, [
		formState.data.alias,
		formState.data.password,
		formState.originalData.alias,
		formState.originalData.password,
	]);

	// Hotkeys for keyboard navigation - PRESERVED
	useHotkeys("esc", handleCancel, { enabled: open });
	useHotkeys("enter", handleSubmit, {
		enabled:
			open &&
			!formState.isSubmitting &&
			Object.keys(formState.errors).length === 0 &&
			hasChanges,
		preventDefault: true,
	});

	// Memoized current account lookup
	const currentAccount = useMemo(
		() =>
			editingAccount
				? accounts.find((acc) => acc.alias === editingAccount)
				: null,
		[editingAccount, accounts],
	);

	// Effect for setting form data when editing account changes
	useEffect(() => {
		if (currentAccount) {
			setFormState((prev) => ({
				...prev,
				data: currentAccount,
				originalData: currentAccount,
			}));
		}
	}, [currentAccount]);

	// Effect for focusing input when modal opens
	useEffect(() => {
		if (passwordInputRef.current && open) {
			passwordInputRef.current.focus();
		}
	}, [open]);

	// Reset form when modal closes
	useEffect(() => {
		if (!open) {
			setFormState(initialFormState);
		}
	}, [open]);

	// Optimized change handler
	const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		const updatedValue = getUpdatedValue(name, value);

		setFormState((prev) => ({
			...prev,
			data: { ...prev.data, [name]: updatedValue },
			errors: prev.errors[name as keyof FormErrors]
				? { ...prev.errors, [name]: undefined }
				: prev.errors,
		}));
	}, []);

	// Memoized form submit handler
	const onFormSubmit = useCallback(
		(e: FormEvent) => {
			e.preventDefault();
			handleSubmit();
		},
		[handleSubmit],
	);

	// Memoized toggle password visibility
	const togglePasswordVisibility = useCallback(() => {
		setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }));
	}, []);

	const hasErrors = Object.keys(formState.errors).length > 0;

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
			<div className="bg-gray-800 p-4 rounded-lg shadow-lg max-w-sm w-full mx-4">
				<div className="flex justify-between items-center mb-4">
					<div className="flex items-center gap-2">
						<Edit3 className="h-4 w-4 text-blue-400" />
						<h3 className="text-base font-medium text-white">Edit Account</h3>
					</div>
					{/** biome-ignore lint/a11y/useButtonType: button in modal header */}
					<button
						onClick={handleCancel}
						className="text-gray-400 hover:text-white transition-colors"
						disabled={formState.isSubmitting}
					>
						<X size={18} />
					</button>
				</div>

				<AccountInfo formData={formState.data} />

				<form onSubmit={onFormSubmit} className="space-y-3">
					<FormInput
						id="alias"
						name="alias"
						label="Account Alias"
						value={formState.data.alias || ""}
						placeholder="Enter account alias"
						error={formState.errors.alias}
						className={cn(
							inputBaseClass,
							formState.errors.alias && inputErrorClass,
						)}
						disabled={formState.isSubmitting}
						onChange={handleChange}
					/>

					<FormInput
						id="username"
						name="username"
						label="Username"
						value={formState.data.username || ""}
						placeholder="Username (read-only)"
						className={cn(inputBaseClass, inputReadOnlyClass)}
						disabled
						readOnly
					/>

					<FormInput
						ref={passwordInputRef}
						id="password"
						name="password"
						label="Password"
						type={formState.showPassword ? "text" : "password"}
						value={formState.data.password || ""}
						placeholder="Enter new password"
						error={formState.errors.password}
						className={cn(
							inputBaseClass,
							"pr-8",
							formState.errors.password && inputErrorClass,
						)}
						disabled={formState.isSubmitting}
						onChange={handleChange}
					>
						<button
							type="button"
							onClick={togglePasswordVisibility}
							className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none"
							disabled={formState.isSubmitting}
						>
							{formState.showPassword ? (
								<EyeOff className="h-3 w-3" />
							) : (
								<Eye className="h-3 w-3" />
							)}
						</button>
					</FormInput>

					<div className="flex justify-end space-x-2 pt-2">
						<Button
							type="button"
							variant="destructive"
							onClick={handleCancel}
							disabled={formState.isSubmitting}
							className="h-8 text-xs border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
						>
							Cancel
						</Button>

						<Button
							type="submit"
							disabled={formState.isSubmitting || hasErrors || !hasChanges}
							className={cn(
								"h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white",
								(formState.isSubmitting || hasErrors || !hasChanges) &&
									"opacity-50 cursor-not-allowed",
							)}
						>
							{formState.isSubmitting ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
