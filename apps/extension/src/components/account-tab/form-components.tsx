import { Button } from "@nepse-dashboard/ui/components/button";
import { Checkbox } from "@nepse-dashboard/ui/components/checkbox";
import { Input } from "@nepse-dashboard/ui/components/input";
import { Label } from "@nepse-dashboard/ui/components/label";
import {
	RadioGroup,
	RadioGroupItem,
} from "@nepse-dashboard/ui/components/radio-group";
import {
	CircleAlert,
	Edit3,
	Eye,
	EyeOff,
	Lock,
	Plus,
	User,
	X,
} from "lucide-react";
import type { ChangeEvent } from "react";
import { forwardRef, memo } from "react";
import { getBrokersById } from "@/hooks/convex/use-brokers";
import { getDPById } from "@/hooks/convex/use-dp";
import { cn } from "@/lib/utils";
import type { Account, accountType } from "@/types/account-types";
import { AccountType } from "@/types/account-types";

export const FormField = memo(
	forwardRef<HTMLInputElement, FormFieldProps>(
		(
			{
				id,
				name,
				label,
				value,
				placeholder,
				error,
				disabled = false,
				readOnly = false,
				type = "text",
				className,
				children,
				onChange,
				showReadOnlyHelp = false,
				variant = "edit",
			},
			ref,
		) => {
			const labelClass =
				variant === "add"
					? "text-sm font-semibold text-white"
					: "text-xs text-gray-300";
			const errorClass =
				variant === "add"
					? "text-sm font-medium text-red-400"
					: "text-xs text-red-400";

			return (
				<div className="space-y-1">
					<Label htmlFor={id} className={labelClass}>
						{label}
					</Label>
					<div className="relative">
						<Input
							ref={ref}
							id={id}
							name={name}
							type={type}
							value={value}
							onChange={onChange}
							placeholder={placeholder}
							className={className}
							disabled={disabled}
							readOnly={readOnly}
						/>
						{children}
					</div>
					{error && <p className={errorClass}>{error}</p>}
					{readOnly && showReadOnlyHelp && (
						<p className="text-xs text-gray-400 flex items-center gap-1">
							<Lock className="h-2 w-2" />
							Cannot be modified
						</p>
					)}
				</div>
			);
		},
	),
);

FormField.displayName = "FormField";

interface FormInputProps {
	id: string;
	name: string;
	label: string;
	value: string;
	placeholder: string;
	error?: string;
	disabled?: boolean;
	readOnly?: boolean;
	type?: string;
	className?: string;
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
	children?: React.ReactNode;
}

export const FormInput = memo(
	forwardRef<HTMLInputElement, FormInputProps>(
		(
			{
				id,
				name,
				label,
				value,
				placeholder,
				error,
				disabled,
				readOnly,
				type = "text",
				className,
				onChange,
				children,
			},
			ref,
		) => (
			<div className="space-y-1">
				<Label htmlFor={id} className="text-xs text-gray-300">
					{label}
				</Label>
				<div className="relative">
					<Input
						ref={ref}
						id={id}
						name={name}
						type={type}
						value={value}
						onChange={onChange}
						placeholder={placeholder}
						className={className}
						disabled={disabled}
						readOnly={readOnly}
					/>
					{children}
				</div>
				{error && <p className="text-xs text-red-400">{error}</p>}
				{readOnly && (
					<p className="text-xs text-gray-400 flex items-center gap-1">
						<Lock className="h-2 w-2" />
						Cannot be modified
					</p>
				)}
			</div>
		),
	),
);

FormInput.displayName = "FormInput";

// Account info component for edit form only
export const AccountInfo = memo(({ formData }: { formData: Account }) => {
	const { data: broker } = getBrokersById(formData.broker || 0);
	const { data: dp } = getDPById(formData.broker || 0);

	const brokerName =
		formData.type === AccountType.MEROSHARE
			? dp?.name || formData.broker
			: broker?.broker_name || formData.broker;

	return (
		<div className="bg-gray-700 p-3 rounded-lg mb-4">
			<h4 className="font-medium text-white text-xs mb-2 flex items-center gap-1">
				<User className="h-3 w-3 text-blue-400" />
				Account Info
			</h4>
			<div className="grid grid-cols-2 gap-2 text-xs">
				<div>
					<p className="text-gray-400">Type</p>
					<p className="text-white font-medium capitalize">{formData.type}</p>
				</div>
				{formData.broker &&
					(formData.type === AccountType.TMS ||
						formData.type === AccountType.MEROSHARE) && (
						<div>
							<p className="text-gray-400">
								{formData.type === AccountType.MEROSHARE ? "DP" : "Broker"}
							</p>
							<p className="text-white font-medium truncate">{brokerName}</p>
						</div>
					)}
			</div>
		</div>
	);
});

AccountInfo.displayName = "AccountInfo";

// Common input styles
export const inputBaseClass =
	"h-8 bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-sm focus:border-white focus:ring-1 focus:ring-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white";
export const inputErrorClass =
	"border-red-500 focus:border-red-500 focus:ring-red-500 focus-visible:ring-red-500";
export const inputReadOnlyClass =
	"bg-gray-600 border-gray-500 text-gray-300 cursor-not-allowed";

// Password Field Component
interface PasswordFieldProps {
	id: string;
	name: string;
	label: string;
	value: string;
	placeholder: string;
	error?: string;
	disabled?: boolean;
	showPassword: boolean;
	onTogglePassword: () => void;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	className?: string;
	variant?: "edit" | "add";
}

export const PasswordField = memo(
	forwardRef<HTMLInputElement, PasswordFieldProps>(
		(
			{
				id,
				name,
				label,
				value,
				placeholder,
				error,
				disabled = false,
				showPassword,
				onTogglePassword,
				onChange,
				className,
				variant = "edit",
			},
			ref,
		) => {
			const iconSize = variant === "add" ? "h-4 w-4" : "h-3 w-3";
			const buttonClass = cn(
				"absolute text-gray-400 hover:text-white transition-colors focus:outline-none",
				variant === "add"
					? "right-1 top-1 h-8 w-8 hover:bg-zinc-700 rounded text-zinc-400"
					: "right-2 top-1/2 transform -translate-y-1/2",
			);

			return (
				<FormField
					ref={ref}
					id={id}
					name={name}
					label={label}
					value={value}
					placeholder={placeholder}
					error={error}
					disabled={disabled}
					type={showPassword ? "text" : "password"}
					className={className}
					onChange={onChange}
					variant={variant}
				>
					<button
						type="button"
						onClick={onTogglePassword}
						className={buttonClass}
						disabled={disabled}
					>
						{showPassword ? (
							<EyeOff className={iconSize} />
						) : (
							<Eye className={iconSize} />
						)}
					</button>
				</FormField>
			);
		},
	),
);

PasswordField.displayName = "PasswordField";

// Modal Header Component
interface ModalHeaderProps {
	title: string;
	variant: "edit" | "add";
	onClose: () => void;
	disabled?: boolean;
}

export const ModalHeader = memo(
	({ title, variant, onClose, disabled = false }: ModalHeaderProps) => {
		const icon =
			variant === "add" ? (
				<Plus className="h-4 w-4 text-green-400" />
			) : (
				<Edit3 className="h-4 w-4 text-blue-400" />
			);

		return (
			<div className="flex justify-between items-center mb-4">
				<div className="flex items-center gap-2">
					{icon}
					<h3 className="text-base font-medium text-white">{title}</h3>
				</div>
				{/** biome-ignore lint/a11y/useButtonType: button in modal header */}
				<button
					onClick={onClose}
					className="text-gray-400 hover:text-white transition-colors"
					disabled={disabled}
				>
					<X size={18} />
				</button>
			</div>
		);
	},
);

ModalHeader.displayName = "ModalHeader";

// Modal Wrapper Component
interface ModalWrapperProps {
	open: boolean;
	children: React.ReactNode;
	variant?: "edit" | "add";
}

export const ModalWrapper = memo(({ open, children }: ModalWrapperProps) => {
	if (!open) return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
			<div className="bg-gray-800 p-4 rounded-lg shadow-lg max-w-sm w-full mx-4">
				{children}
			</div>
		</div>
	);
});

ModalWrapper.displayName = "ModalWrapper";

// Account Type Radio Group Component - Compact version
interface AccountTypeRadioProps {
	value: accountType;
	onChange: (value: accountType) => void;
	disabled?: boolean;
	variant?: "edit" | "add";
}

export const AccountTypeRadio = memo(
	({ value, onChange, disabled = false }: AccountTypeRadioProps) => {
		return (
			<div className="space-y-1">
				<Label className="text-xs text-gray-300">Account Type</Label>
				<RadioGroup
					value={value}
					onValueChange={onChange}
					className="flex gap-3"
					disabled={disabled}
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
							value="meroshare"
							id="meroshare"
							className="w-3 h-3 border border-gray-500 text-white focus:ring-blue-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
						/>
						<Label htmlFor="meroshare" className="text-xs text-white">
							Meroshare
						</Label>
					</div>
				</RadioGroup>
			</div>
		);
	},
);

AccountTypeRadio.displayName = "AccountTypeRadio";

// Primary Account Checkbox Component - Compact version
interface PrimaryCheckboxProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
	variant?: "edit" | "add";
}

export const PrimaryCheckbox = memo(
	({ checked, onChange, disabled = false }: PrimaryCheckboxProps) => {
		return (
			<div className="flex items-center space-x-2 pt-1">
				<Checkbox
					id="isPrimary"
					checked={checked}
					onCheckedChange={onChange}
					disabled={disabled}
					className="w-3 h-3 border border-gray-500 text-white focus:ring-blue-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
				/>
				<Label htmlFor="isPrimary" className="text-xs text-white">
					Set as Primary Account
				</Label>
			</div>
		);
	},
);

PrimaryCheckbox.displayName = "PrimaryCheckbox";

// Form Actions Component
interface FormActionsProps {
	onCancel: () => void;
	onSubmit?: () => void;
	isSubmitting: boolean;
	hasChanges?: boolean;
	hasErrors: boolean;
	submitText?: string;
	cancelText?: string;
	showSubmitButton?: boolean;
	variant?: "edit" | "add";
}

export const FormActions = memo(
	({
		onCancel,
		onSubmit,
		isSubmitting,
		hasChanges = true,
		hasErrors,
		submitText,
		cancelText = "Cancel",
		showSubmitButton = true,
		variant = "edit",
	}: FormActionsProps) => {
		const defaultSubmitText =
			variant === "add" ? "Add Account" : "Save Changes";
		const finalSubmitText = isSubmitting
			? variant === "add"
				? "Adding..."
				: "Saving..."
			: submitText || defaultSubmitText;

		const submitButtonClass =
			variant === "add"
				? cn(
						"h-8 text-xs bg-green-600 hover:bg-green-700 text-white",
						(isSubmitting || hasErrors) && "opacity-50 cursor-not-allowed",
					)
				: cn(
						"h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white",
						(isSubmitting || hasErrors) && "opacity-50 cursor-not-allowed",
					);

		return (
			<div className="flex justify-end space-x-2 pt-2">
				<Button
					type="button"
					variant="destructive"
					onClick={onCancel}
					disabled={isSubmitting}
					className="h-8 text-xs border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
				>
					{cancelText}
				</Button>

				{showSubmitButton && hasChanges && (
					<Button
						type="submit"
						disabled={isSubmitting || hasErrors}
						className={submitButtonClass}
						onClick={onSubmit}
					>
						{finalSubmitText}
					</Button>
				)}
			</div>
		);
	},
);

FormActions.displayName = "FormActions";

// Info Message Component - Compact version
interface InfoMessageProps {
	message: string;
	variant?: "info" | "warning" | "error";
}

export const InfoMessage = memo(
	({ message, variant = "warning" }: InfoMessageProps) => {
		const colorClasses = {
			info: "text-blue-300 bg-blue-500/10 border-blue-500/20",
			warning: "text-orange-300 bg-orange-500/10 border-orange-500/20",
			error: "text-red-300 bg-red-500/10 border-red-500/20",
		};

		return (
			<div
				className={`flex items-start gap-2 text-xs ${colorClasses[variant]} p-2 rounded border`}
			>
				<CircleAlert className="h-3 w-3 mt-0.5 shrink-0" />
				<span className="font-medium">{message}</span>
			</div>
		);
	},
);

InfoMessage.displayName = "InfoMessage";

// Common Input Styles - Unified for both forms
export const inputStyles = {
	edit: {
		base: "h-8 bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-sm focus:border-white focus:ring-1 focus:ring-white dark:focus:border-white dark:focus:ring-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white",
		error:
			"border-red-500 focus:border-red-500 focus:ring-red-500 focus-visible:ring-red-500",
		password: "pr-8",
		readOnly:
			"bg-gray-600 border-gray-500 text-gray-300 cursor-not-allowed focus-visible:outline-none",
	},
	add: {
		base: "h-8 bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-sm focus:border-white focus:ring-1 focus:ring-white dark:focus:border-white dark:focus:ring-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white",
		error:
			"border-red-500 focus:border-red-500 focus:ring-red-500 focus-visible:ring-red-500",
		password: "pr-8",
		number:
			"[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
		disabled: "opacity-50 cursor-not-allowed bg-gray-600",
	},
} as const;

InfoMessage.displayName = "InfoMessage";

interface FormFieldProps {
	id: string;
	name: string;
	label: string;
	value: string;
	placeholder: string;
	error?: string;
	disabled?: boolean;
	readOnly?: boolean;
	type?: string;
	className?: string;
	children?: React.ReactNode;
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
	showReadOnlyHelp?: boolean;
	variant?: "edit" | "add";
}
