import {
	MEROSHARE_LOGIN_URL,
	NAASAX_LOGIN_URL,
	TMS_LOGIN_URL,
} from "@/constants/content-url";
import type { Account, accountType } from "@/types/account-types";
import { AccountType } from "@/types/account-types";

export interface SiteDetails {
	type: accountType;
	broker: number | null;
	name: string;
}
/**
 * Get account details from URL to determine current site context
 */
export function getAccountDetails(): SiteDetails | null {
	const url = window.location.href;

	if (url.includes(NAASAX_LOGIN_URL))
		return { type: AccountType.NAASAX, broker: null, name: "NaasaX" };
	if (url.includes(MEROSHARE_LOGIN_URL))
		return { type: AccountType.MEROSHARE, broker: null, name: "Meroshare" };

	const match = url.match(TMS_LOGIN_URL);
	return match
		? { type: AccountType.TMS, broker: +match[1], name: "TMS" }
		: null;
}

/**
 * Filter accounts based on current site and active tab
 */
export function filterAccountsBySite(
	accounts: Account[],
	currentSiteDetails: SiteDetails | null,
	activeTab: string,
) {
	if (!accounts || !currentSiteDetails) {
		return {
			currentBrokerAccounts: [],
			allTmsAccounts: [],
			filteredAccounts: [],
		};
	}

	const allTms = accounts.filter(
		(account: Account) => account.type === AccountType.TMS,
	);

	if (currentSiteDetails.type === AccountType.TMS) {
		const current = accounts.filter(
			(account: Account) =>
				account.type === AccountType.TMS &&
				account.broker === currentSiteDetails.broker,
		);
		const filtered = activeTab === "current" ? current : allTms;

		return {
			currentBrokerAccounts: current,
			allTmsAccounts: allTms,
			filteredAccounts: filtered,
		};
	} else if (currentSiteDetails.type === AccountType.MEROSHARE) {
		const meroshareAccounts = accounts.filter(
			(account: Account) => account.type === AccountType.MEROSHARE,
		);
		return {
			currentBrokerAccounts: [],
			allTmsAccounts: allTms,
			filteredAccounts: meroshareAccounts,
		};
	} else if (currentSiteDetails.type === AccountType.NAASAX) {
		const naasaxAccounts = accounts.filter(
			(account: Account) => account.type === AccountType.NAASAX,
		);
		return {
			currentBrokerAccounts: [],
			allTmsAccounts: allTms,
			filteredAccounts: naasaxAccounts,
		};
	}

	return {
		currentBrokerAccounts: [],
		allTmsAccounts: [],
		filteredAccounts: [],
	};
}

/**
 * Check if autofill is paused for the current site
 */
export function isAutofillPausedForSite(
	site: SiteDetails | null,
	autofills: Record<accountType, boolean>,
): boolean {
	return !!site && !(autofills?.[site.type] ?? false);
}

/**
 * Validate primary account change
 */
// export function validatePrimaryChange(alias: string, accounts: Account[]): string | null {
//   const account = accounts.find(acc => acc.alias === alias)
//   if (!account)
//     return 'Account not found'
//   if (account.isPrimary)
//     return 'Account is already primary'
//   return null
// }

/**
 * Validate account deletion
 */
// export function validateAccountDeletion(
//   alias: string,
//   accounts: Account[],
//   hasMultipleAccounts: boolean,
// ): string | null {
//   const account = accounts.find(acc => acc.alias === alias)
//   if (!account)
//     return 'Account not found'
//   if (account.isPrimary && hasMultipleAccounts) {
//     return 'Cannot delete primary account. Set another account as primary first.'
//   }
//   return null
// }

/**
 * Get footer message based on current site type
 */
export function getFooterMessage(siteType: accountType): string {
	switch (siteType) {
		case AccountType.MEROSHARE:
			return "Manage your Meroshare accounts";
		case AccountType.NAASAX:
			return "Manage your NaasaX accounts";
		default:
			return "Manage your TMS accounts";
	}
}

// /**
//  * Get context description for TMS tabs
//  */
// export function getContextDescription(
//   activeTab: string,
//   brokerName?: string,
// ): string {
//   return activeTab === 'current'
//     ? `Current Broker (${brokerName})`
//     : 'All TMS Accounts'
// }

// /**
//  * Create matching broker account checker function
//  */
// export function createBrokerMatcher(broker?: number | null) {
//   return broker !== null && broker !== undefined
//     ? (account: Account) => account.broker === broker
//     : () => true
// }

// /**
//  * Check if login button should be disabled
//  */
// export function shouldDisableLoginButton(
//   siteType: accountType,
//   activeTab: string,
// ): boolean {
//   return siteType === AccountType.TMS && activeTab === 'all'
// }

// // checks if showing UI in this site is disabled in store?
// export function isUIEnabledForSite(
//   currentSiteDetails: SiteDetails | null,
//   accountState: AccountState | null,
// ): boolean {
//   if (!currentSiteDetails || !accountState)
//     return true

//   // Use the unified UI visibility check
//   return accountState.uiVisibility[currentSiteDetails.type] ?? true
// }
