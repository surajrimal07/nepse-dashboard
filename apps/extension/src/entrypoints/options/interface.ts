export const OPTION_TABS = {
	GENERAL: "general",
	MARKET: "market",
	AI: "ai",
	ACCOUNT: "account",
} as const;

export type OptionTabsType = (typeof OPTION_TABS)[keyof typeof OPTION_TABS];

export interface TabConfig {
	value: OptionTabsType;
	label: string;
}

export const TAB_CONFIG: TabConfig[] = [
	{ value: OPTION_TABS.GENERAL, label: "General" },
	{ value: OPTION_TABS.MARKET, label: "Market" },
	{ value: OPTION_TABS.AI, label: "Assistant" },
	{ value: OPTION_TABS.ACCOUNT, label: "Account" },
];
