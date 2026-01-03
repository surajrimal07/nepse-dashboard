/** biome-ignore-all lint/suspicious/noExplicitAny: <iknow> */
import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import { defineExtensionMessaging } from "@webext-core/messaging";
import type { Account } from "@/types/account-types";
import type { AnalyticsMessage } from "@/types/analytics-types";
import type { LiveDataFromTMS } from "@/types/consume-type";
import type { ParsedDocument, ParsedNews } from "@/types/news-types";
import type { NotificationVariant } from "@/types/notification-types";

export interface MessageReturn {
	success: boolean;
	message: string;
}

interface ExtensionMessengerSchema {
	registerTab: () => void;
	unregisterTab: () => void;
	companiesList: () => Doc<"company">[];
	getSuggestion: (data: {
		url: string;
		content: ParsedDocument | null;
	}) => string[] | undefined | null;

	analytics: (data: AnalyticsMessage) => void;
	manualLoginMero: (account: Account) => void;
	manualLoginTMS: (account: Account) => void;
	manualLoginNaasax: (account: Account) => void;

	showNotification: (data: {
		title: string;
		body: string;
		variant?: NotificationVariant;
		icon?: string | null;
	}) => void;

	getWebsiteContent: () => ParsedNews | null;
	sendWebsiteContent: (data: ParsedNews | null) => boolean;

	openSidePanel: () => void;
	goToAIPage: (data?: string) => void;
	goToAccountPage: () => void;
	goToRoute: (data: { route: string; routeData?: any }) => void;

	handleTMSAccountLogout: () => void;
	handleMeroshareAccountLogout: () => void;
	handleNaasaxAccountLogout: () => void;

	startExtraction: () => void;
	stopExtraction: () => void;
	sendExtractionData: (data: { extractedData: LiveDataFromTMS }) => void;
	shouldExtract: () => boolean;
}

export const { sendMessage, onMessage } =
	defineExtensionMessaging<ExtensionMessengerSchema>();
