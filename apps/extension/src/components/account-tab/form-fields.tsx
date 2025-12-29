import { Label } from "@nepse-dashboard/ui/components/label";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const inputBaseClass =
	"w-full px-2 py-1 text-xs bg-gray-700 text-white border border-gray-500 rounded focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none";
export const inputErrorClass =
	"border-red-500 focus:ring-red-400 focus:border-red-400";
export const inputReadOnlyClass =
	"bg-gray-600 text-gray-400 cursor-not-allowed";

interface FormFieldProps {
	label: string;
	error?: string;
	children: React.ReactNode;
	className?: string;
}

export function FormField({
	label,
	error,
	children,
	className,
}: FormFieldProps) {
	return (
		<div className={cn("space-y-1", className)}>
			<Label className="text-xs text-gray-300">{label}</Label>
			{children}
			{error && <p className="text-xs text-red-400">{error}</p>}
		</div>
	);
}

interface TanStackInputProps {
	name: string;
	label: string;
	placeholder?: string;
	type?: string;
	disabled?: boolean;
	readOnly?: boolean;
	className?: string;
	children?: React.ReactNode;
}

export const TanStackInput = forwardRef<HTMLInputElement, TanStackInputProps>(
	(
		{
			name,
			label,
			placeholder,
			type = "text",
			disabled,
			readOnly,
			className,
			children,
		},
		ref,
	) => {
		return (
			<FormField label={label} className="relative">
				<input
					ref={ref}
					name={name}
					type={type}
					placeholder={placeholder}
					disabled={disabled}
					readOnly={readOnly}
					className={cn(
						inputBaseClass,
						readOnly && inputReadOnlyClass,
						className,
					)}
				/>
				{children}
			</FormField>
		);
	},
);

TanStackInput.displayName = "TanStackInput";
