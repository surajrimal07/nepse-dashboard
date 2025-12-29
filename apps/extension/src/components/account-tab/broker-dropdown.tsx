import { Button } from "@nepse-dashboard/ui/components/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@nepse-dashboard/ui/components/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@nepse-dashboard/ui/components/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
	BUTTON_BASE_CLASSES,
	BUTTON_HOVER_CLASSES,
	findOptionByValue,
	getEmptyText,
	getOptionsByAccountType,
	getPlaceholderText,
	ITEM_CLASSES,
	NAASAX_BUTTON_CLASSES,
} from "@/components/account-tab/utils";
import { getBrokers } from "@/hooks/convex/use-brokers";
import { getDp } from "@/hooks/convex/use-dp";
import { cn } from "@/lib/utils";
import type { accountType } from "@/types/account-types";
import { AccountType } from "@/types/account-types";

interface BrokerDropdownProps {
	value: number;
	onChange: (value: number) => void;
	accountType: accountType;
	disabled?: boolean;
	error?: string;
	placeholder?: string;
}

export default function BrokerDropdown({
	value,
	onChange,
	accountType,
	disabled = false,
	error,
	placeholder = "Select broker/DP",
}: BrokerDropdownProps) {
	const [open, setOpen] = useState(false);

	const {
		data: brokers,
		isPending: brokersPending,
		error: brokersError,
	} = getBrokers();

	const { data: dps, isPending: dpsPending, error: dpsError } = getDp();

	const isPending =
		accountType === AccountType.MEROSHARE ? dpsPending : brokersPending;
	const hasError =
		accountType === AccountType.MEROSHARE ? dpsError : brokersError;

	const options = useMemo(
		() => getOptionsByAccountType(accountType, brokers, dps),
		[accountType, brokers, dps],
	);
	const displayValue = useMemo(
		() => findOptionByValue(options, value),
		[options, value],
	);

	const handleOpenChange = useCallback((newOpen: boolean) => {
		setOpen(newOpen);
	}, []);

	const handleItemSelect = useCallback(
		(optionValue: number) => {
			onChange(optionValue);
			setOpen(false);
		},
		[onChange],
	);

	const buttonClasses = useMemo(
		() =>
			cn(
				BUTTON_BASE_CLASSES,
				BUTTON_HOVER_CLASSES,
				error && "border-red-500",
				disabled && "opacity-50 cursor-not-allowed",
			),
		[error, disabled],
	);

	if (accountType === AccountType.NAASAX) {
		return (
			<Button variant="outline" disabled className={cn(NAASAX_BUTTON_CLASSES)}>
				Not applicable
			</Button>
		);
	}

	if (isPending) {
		return (
			<Button variant="outline" disabled className={buttonClasses}>
				<span className="text-xs">Loading...</span>
			</Button>
		);
	}

	if (hasError) {
		return (
			<Button
				variant="outline"
				disabled
				className={cn(buttonClasses, "border-red-500 text-red-400")}
			>
				<span className="text-xs">Error loading data</span>
			</Button>
		);
	}

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<Button
					variant="default"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className={buttonClasses}
				>
					<span className="truncate text-left">
						{displayValue || placeholder}
					</span>
					<ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-[310px] h-[220px] p-0 bg-gray-700 border-gray-500"
				align="start"
			>
				<Command key={accountType} className="bg-gray-700">
					<CommandInput
						placeholder={getPlaceholderText(accountType)}
						className="h-8 text-xs bg-gray-600 text-white border-gray-500 placeholder:text-gray-400"
					/>
					<CommandList className="max-h-48">
						<CommandEmpty className="text-xs text-gray-400 py-2">
							No {getEmptyText(accountType)} found.
						</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									value={option.searchValue}
									onSelect={() => handleItemSelect(option.value)}
									className={ITEM_CLASSES}
								>
									{option.label}
									<Check
										className={cn(
											"ml-auto h-3 w-3",
											value === option.value ? "opacity-100" : "opacity-0",
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
