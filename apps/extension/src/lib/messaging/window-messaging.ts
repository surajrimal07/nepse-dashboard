/** biome-ignore-all lint/suspicious/noExplicitAny: <iknow> */
import { defineWindowMessaging } from "@webext-core/messaging/page";
import type { Account } from "@/types/account-types";
import type { AnalyticsMessage } from "@/types/analytics-types";

export type MessageReturn = { success: boolean; message: string };

interface WebsiteMessengerSchema {
	analytics: (data: AnalyticsMessage) => void;
	manualLoginMero: (account: Account) => void;
	manualLoginTMS: (account: Account) => void;
	manualLoginNaasax: (account: Account) => void;
}

export const { sendMessage, onMessage } =
	defineWindowMessaging<WebsiteMessengerSchema>({
		namespace: "nepse-dashboard-messaging",
	});
