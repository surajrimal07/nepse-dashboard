import {
	type Account,
	AccountType,
	type accountType,
} from "@/types/account-types";
import { sendMessage } from "../messaging/extension-messaging";
import { activateTab } from "./activate-tab";
import { findTMSTab } from "./find-tab";

type LoginConfig = {
	tabUrlPattern: (broker?: number) => string;
	loginUrl: (broker?: number) => string;
	logoutMessage: string;
	requiresBroker: boolean;
};

export const LOGIN_CONFIG: Record<accountType, LoginConfig> = {
	[AccountType.TMS]: {
		tabUrlPattern: (broker) => `https://tms${broker}.nepsetms.com.np/*`,
		loginUrl: (broker) => `https://tms${broker}.nepsetms.com.np/login`,
		logoutMessage: "handleTMSAccountLogout",
		requiresBroker: true,
	},

	[AccountType.MEROSHARE]: {
		tabUrlPattern: () => `https://meroshare.cdsc.com.np/*`,
		loginUrl: () => `https://meroshare.cdsc.com.np/#/login`,
		logoutMessage: "handleMeroshareAccountLogout",
		requiresBroker: false,
	},

	[AccountType.NAASAX]: {
		tabUrlPattern: () => `https://auth.naasasecurities.com.np/*`,
		loginUrl: () => `https://auth.naasasecurities.com.np`,
		logoutMessage: "handleNaasaxAccountLogout",
		requiresBroker: false,
	},
};

export function findConflictingAccount(accounts: Account[], target: Account) {
	return accounts.find(
		(acc) =>
			acc.type === target.type &&
			(acc.type !== AccountType.TMS || acc.broker === target.broker) &&
			acc.isCurrentlyLoggingIn &&
			acc.alias !== target.alias,
	);
}

export async function tryLogout(tabPattern: string, logoutMessage: string) {
	const tab = await findTMSTab(tabPattern);

	if (!tab?.id) return;

	await activateTab(tab);

	await sendMessage(logoutMessage, undefined, tab?.id);
}
