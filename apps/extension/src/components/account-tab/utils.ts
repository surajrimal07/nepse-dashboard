import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import type { Account, accountType } from "@/types/account-types";
import { AccountType } from "@/types/account-types";

export interface FormErrors {
	broker?: string;
	alias?: string;
	username?: string;
	password?: string;
}

export const initialFormData: Account = {
	type: AccountType.TMS,
	broker: 0,
	alias: "",
	username: "",
	password: "",
	isPrimary: false,
	error: null,
	disabled: false,
	updatedAt: new Date().toISOString(),
	lastLoggedIn: null,
};

export function validateFormData(data: Account): FormErrors {
	const errors: FormErrors = {};

	if (!data.alias?.trim()) {
		errors.alias = "Alias is required";
	}

	if (!data.username?.trim()) {
		errors.username = "Username is required";
	}

	if (!data.password?.trim()) {
		errors.password = "Password is required";
	}

	// Broker validation based on account type
	if (data.type === AccountType.TMS || data.type === AccountType.MEROSHARE) {
		if (!data.broker) {
			errors.broker =
				data.type === AccountType.MEROSHARE
					? "DP is required"
					: "Broker is required";
		}
	}

	return errors;
}

export function findExistingAccount(
	accounts: Account[],
	type: accountType,
	alias: string,
	username: string,
	brokerId: number,
): Account | undefined {
	return accounts.find(
		(acc) =>
			acc.type === type &&
			acc.broker === brokerId &&
			(acc.alias === alias || acc.username === username),
	);
}

export function getUpdatedValue(name: string, value: string): string | number {
	return name === "broker" ? Number(value) : value;
}

// add //edit forms utils
export function transformDpOptions(dps?: Doc<"dp">[]) {
	if (!dps) return [];
	return dps.map((dp) => ({
		value: dp.dpid,
		label: `${dp.name} (${dp.dpid})`,
		searchValue: `${dp.name} ${dp.dpid}`.toLowerCase(),
	}));
}

export function transformBrokerOptions(brokers?: Doc<"brokers">[]) {
	if (!brokers) return [];
	return brokers.map((broker) => ({
		value: broker.broker_number,
		label: `${broker.broker_name} (${broker.broker_number})`,
		searchValue: `${broker.broker_name} ${broker.broker_number}`.toLowerCase(),
	}));
}

export function getOptionsByAccountType(
	accountType: accountType,
	brokers?: Doc<"brokers">[],
	dps?: Doc<"dp">[],
) {
	return accountType === AccountType.MEROSHARE
		? transformDpOptions(dps)
		: transformBrokerOptions(brokers);
}

export function findOptionByValue(
	options: Array<{ value: number; label: string; searchValue: string }>,
	value: number,
) {
	return options.find((opt) => opt.value === value)?.label || "";
}

export function getPlaceholderText(accountType: string) {
	return accountType === AccountType.MEROSHARE
		? "Search DP..."
		: "Search broker...";
}

export function getEmptyText(accountType: string) {
	return accountType === AccountType.MEROSHARE ? "DP" : "broker";
}

export const BUTTON_BASE_CLASSES =
	"w-full justify-between text-xs h-8 bg-gray-700 text-white border border-gray-500";
export const BUTTON_HOVER_CLASSES =
	"hover:bg-gray-600 hover:text-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400";
export const NAASAX_BUTTON_CLASSES =
	"w-full justify-start text-xs h-8 bg-gray-600 text-gray-400 border border-gray-500 opacity-50 cursor-not-allowed hover:bg-gray-600 hover:text-gray-400";
export const ITEM_CLASSES =
	"text-xs text-white hover:bg-gray-600 cursor-pointer aria-selected:bg-blue-600 aria-selected:text-white";

export function getTMSNameById(
	brokers: Doc<"brokers">[] | undefined,
	id: number,
) {
	if (!brokers) return "";
	const broker = brokers.find((b) => b.broker_number === id);
	return broker ? broker.broker_name : "";
}

export function getDPNameById(dps: Doc<"dp">[] | undefined, id: number) {
	if (!dps) return "";
	const dp = dps.find((d) => d.dpid === id);
	return dp ? dp.name : "";
}
