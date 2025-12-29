import { Button } from "@nepse-dashboard/ui/components/button";
import { Checkbox } from "@nepse-dashboard/ui/components/checkbox";
import { Label } from "@nepse-dashboard/ui/components/label";
import {
	RadioGroup,
	RadioGroupItem,
} from "@nepse-dashboard/ui/components/radio-group";
import { CircleAlert, Eye, EyeOff, Plus, X } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import BrokerDropdown from "@/components/account-tab/broker-dropdown";
import type { FormErrors } from "@/components/account-tab/utils";
import useScreenView from "@/hooks/usePageView";
import { appState } from "@/lib/service/app-service";
import { cn } from "@/lib/utils";
import type { Account, accountType } from "@/types/account-types";
import { AccountType } from "@/types/account-types";
import { FormInput, inputBaseClass, inputErrorClass } from "./form-components";
import {
	findExistingAccount,
	getUpdatedValue,
	initialFormData,
	validateFormData,
} from "./utils";

interface AddAccountFormProps {
	activeTab: accountType;
	onClose: () => void;
}

// Consolidated form state
interface FormState {
	data: Account;
	errors: FormErrors;
	infoMessage: string | null;
	showPassword: boolean;
	isSubmitting: boolean;
}

export default function addAccountForm({
	activeTab,
	onClose,
}: AddAccountFormProps) {
	const { useStateItem, callAction } = useAppState();
	const [accounts] = useStateItem("accounts");

	useScreenView("/account-add");

	const [formState, setFormState] = useState<FormState>({
		data: { ...initialFormData, type: activeTab },
		errors: {},
		infoMessage: null,
		showPassword: false,
		isSubmitting: false,
	});
	// Memoized handlers
	const handleCancel = useCallback(() => {
		setFormState({
			data: { ...initialFormData, type: activeTab },
			errors: {},
			infoMessage: null,
			showPassword: false,
			isSubmitting: false,
		});
		onClose();
	}, [activeTab, onClose]);

	const validateForm = useCallback((): boolean => {
		const newErrors = validateFormData(formState.data);
		setFormState((prev) => ({ ...prev, errors: newErrors }));
		return Object.keys(newErrors).length === 0;
	}, [formState.data]);

	const handleSubmit = useCallback(async () => {
		if (validateForm() && !formState.isSubmitting) {
			setFormState((prev) => ({ ...prev, isSubmitting: true }));

			try {
				const result = await callAction("addAccount", formState.data);

				if (!result.success) {
					setFormState((prev) => ({
						...prev,
						infoMessage: result.message,
						isSubmitting: false,
					}));
					return;
				}

				onClose();
				toast.success(result.message);
			} catch (error) {
				setFormState((prev) => ({ ...prev, isSubmitting: false }));
				toast.error(
					error instanceof Error ? error.message : "Failed to add account",
				);
			}
		}
	}, [validateForm, formState.isSubmitting, formState.data, appState, onClose]);

	// Hotkeys for keyboard navigation
	useHotkeys("esc", handleCancel);
	useHotkeys("enter", handleSubmit, {
		enabled:
			!formState.isSubmitting && Object.keys(formState.errors).length === 0,
		preventDefault: true,
	});

	// Effect for default account type changes
	useEffect(() => {
		setFormState((prev) => ({
			...prev,
			data: { ...initialFormData, type: activeTab },
		}));
	}, [activeTab]);

	// Reset form when modal closes
	useEffect(() => {
		if (!open) {
			setFormState({
				data: { ...initialFormData, type: activeTab },
				errors: {},
				infoMessage: null,
				showPassword: false,
				isSubmitting: false,
			});
		}
	}, [open, activeTab]);

	// Optimized change handler
	const handleChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { name, value } = e.target;
			const updatedValue = getUpdatedValue(name, value);

			setFormState((prev) => {
				const newData = { ...prev.data, [name]: updatedValue };

				// Re-validate the entire form to properly clear all errors
				const newErrors = validateFormData(newData);

				// Check for existing account
				let newInfoMessage = prev.infoMessage;
				if (name === "alias" || name === "username") {
					const existingAccount = findExistingAccount(
						accounts,
						newData.type,
						name === "alias" ? value : newData.alias,
						name === "username" ? value : newData.username,
						newData.broker || 0,
					);
					newInfoMessage = existingAccount
						? "Account with this username or alias exists, this will update existing account"
						: null;
				}

				return {
					...prev,
					data: newData,
					errors: newErrors,
					infoMessage: newInfoMessage,
				};
			});
		},
		[accounts],
	);

	const handleRadioChange = useCallback(
		(value: accountType) => {
			setFormState((prev) => {
				const newData = {
					...prev.data,
					type: value,
					...(value !== AccountType.TMS ? { broker: undefined } : {}),
				};

				const existingAccount = findExistingAccount(
					accounts,
					value,
					newData.alias,
					newData.username,
					newData.broker || 0,
				);

				return {
					...prev,
					data: newData,
					infoMessage: existingAccount
						? "Account with this username or alias exists, this will update existing account"
						: null,
				};
			});
		},
		[accounts],
	);

	// Optimized checkbox change handler
	const handleCheckboxChange = useCallback((checked: boolean) => {
		setFormState((prev) => ({
			...prev,
			data: { ...prev.data, isPrimary: checked },
		}));
	}, []);

	// Optimized change handler for broker dropdown
	const handleBrokerChange = useCallback(
		(value: number) => {
			setFormState((prev) => {
				const newData = { ...prev.data, broker: value };

				// Clear error for broker field
				const newErrors = prev.errors.broker
					? { ...prev.errors, broker: undefined }
					: prev.errors;

				// Check for existing account
				const existingAccount = findExistingAccount(
					accounts,
					newData.type,
					newData.alias,
					newData.username,
					newData.broker || 0,
				);

				return {
					...prev,
					data: newData,
					errors: newErrors,
					infoMessage: existingAccount
						? "Account with this username or alias exists, this will update existing account"
						: null,
				};
			});
		},
		[accounts],
	);

	const onFormSubmit = useCallback(
		(e: FormEvent) => {
			e.preventDefault();
			handleSubmit();
		},
		[handleSubmit],
	);

	const togglePasswordVisibility = useCallback(() => {
		setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }));
	}, []);

	// Check if form has any meaningful input
	const hasInput = useMemo(() => {
		const { data } = formState;
		return !!(
			data.alias?.trim() ||
			data.username?.trim() ||
			data.password?.trim() ||
			(data.broker && data.type !== AccountType.NAASAX)
		);
	}, [formState.data]);

	const hasErrors = Object.keys(formState.errors).length > 0;

	if (!open) return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
			<div className="bg-gray-800 p-2 rounded-lg shadow-lg max-w-sm w-full mx-4">
				<div className="flex justify-between items-center mb-4">
					<div className="flex items-center gap-2">
						<Plus className="h-4 w-4 text-green-400" />
						<h3 className="text-base font-medium text-white">
							Add New Account
						</h3>
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

				<form onSubmit={onFormSubmit} className="space-y-3">
					<div className="space-y-1">
						<Label className="text-xs text-gray-300">Account Type</Label>
						<RadioGroup
							value={formState.data.type}
							onValueChange={handleRadioChange}
							className="flex gap-3"
							disabled={formState.isSubmitting}
						>
							<div className="flex items-center space-x-1">
								<RadioGroupItem
									value="tms"
									id="tms"
									className="w-3 h-3 border border-gray-500 text-white focus:ring-blue-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
								/>
								<Label htmlFor="tms" className="text-xs text-white">
									TMS
								</Label>
							</div>
							<div className="flex items-center space-x-1">
								<RadioGroupItem
									value="naasax"
									id="naasax"
									className="w-3 h-3 border border-gray-500 text-white focus:ring-blue-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
								/>
								<Label htmlFor="naasax" className="text-xs text-white">
									NaasaX
								</Label>
							</div>
							<div className="flex items-center space-x-1">
								<RadioGroupItem
									value={AccountType.MEROSHARE}
									id={AccountType.MEROSHARE}
									className="w-3 h-3 border border-gray-500 text-white focus:ring-blue-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
								/>
								<Label
									htmlFor={AccountType.MEROSHARE}
									className="text-xs text-white"
								>
									Meroshare
								</Label>
							</div>
						</RadioGroup>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1">
							<Label className="text-xs text-gray-300">
								{formState.data.type === AccountType.MEROSHARE
									? "DP ID"
									: "Broker"}
							</Label>
							<BrokerDropdown
								key={formState.data.type}
								value={formState.data.broker || 0}
								onChange={handleBrokerChange}
								accountType={formState.data.type}
								disabled={formState.isSubmitting}
								error={formState.errors.broker}
								placeholder={
									formState.data.type === AccountType.MEROSHARE
										? "Select DP"
										: "Select broker"
								}
							/>
							{formState.errors.broker && (
								<p className="text-xs text-red-400">
									{formState.errors.broker}
								</p>
							)}
						</div>

						<FormInput
							id="alias"
							name="alias"
							label="Account Alias"
							value={formState.data.alias || ""}
							placeholder="Enter alias"
							error={formState.errors.alias}
							className={cn(
								inputBaseClass,
								formState.errors.alias && inputErrorClass,
							)}
							disabled={formState.isSubmitting}
							onChange={handleChange}
						/>
					</div>

					<FormInput
						id="username"
						name="username"
						label="Username"
						value={formState.data.username || ""}
						placeholder="Enter username"
						error={formState.errors.username}
						className={cn(
							inputBaseClass,
							formState.errors.username && inputErrorClass,
						)}
						disabled={formState.isSubmitting}
						onChange={handleChange}
					/>

					<FormInput
						id="password"
						name="password"
						label="Password"
						type={formState.showPassword ? "text" : "password"}
						value={formState.data.password || ""}
						placeholder="Enter password"
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

					<div className="flex items-center space-x-2 pt-1">
						<Checkbox
							id="isPrimary"
							checked={formState.data.isPrimary}
							onCheckedChange={handleCheckboxChange}
							disabled={formState.isSubmitting}
							className="w-3 h-3 border border-gray-500 text-white focus:ring-blue-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
						/>
						<Label htmlFor="isPrimary" className="text-xs text-white">
							Set as Primary Account
						</Label>
					</div>

					{formState.infoMessage && (
						<div className="flex items-start gap-2 text-xs text-orange-300 bg-orange-500/10 p-2 rounded border border-orange-500/20">
							<CircleAlert className="h-3 w-3 mt-0.5 shrink-0" />
							<span className="font-medium">{formState.infoMessage}</span>
						</div>
					)}

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
							disabled={formState.isSubmitting || hasErrors || !hasInput}
							className={cn(
								"h-8 text-xs bg-green-600 hover:bg-green-700 text-white",
								(formState.isSubmitting || hasErrors || !hasInput) &&
									"opacity-50 cursor-not-allowed",
							)}
						>
							{formState.isSubmitting ? "Adding..." : "Add Account"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
