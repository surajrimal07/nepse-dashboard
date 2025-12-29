import { URLS } from "./app-urls";

export const CONFIG = {
	max_widgets: 20,
	dashboard_items: 8,
	dashboard_items_sidepanel: 14,
	app_name: "Nepse Dashboard",
	author_email: "davidparkedme@gmail.com",
	extensionId: "efglamoipanaajcmhfeblhdbhciggojd",
	consume_check_interval: 60 * 1000,
	fcm_sender_id: "56003072035",
	default_tab: "account",
	notification_remainder_delay: 1440, // 24 hours in minutes
	restricted_urls: [
		"chrome://",
		"https://chrome.google.com/webstore/",
		"about:",
		"chrome-extension://",
		"file://",
		"edge://extensions//",
	],
};

export const LIST_HEIGHT = {
	NORMAL: 490,
	FULLSCREEN: 920,
} as const;

export const DEFAULT_CHART_SITES = [
	{ id: "default", name: "NepseAlpha", url: URLS.chart_url },
	{
		id: "Sharehub",
		name: "ShareHub",
		url: "https://sharehubnepal.com/technical-chart/",
	},
] as const;
