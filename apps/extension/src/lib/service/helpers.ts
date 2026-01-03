import type { Account } from "@/types/account-types";

export function deleteAccount(
	accounts: Account[],
	accountIndex: number,
): Account[] {
	const accountToDelete = accounts[accountIndex];
	const wasPrimary = accountToDelete.isPrimary;

	// Remove account immutably
	let newAccounts = accounts.filter(
		(_: Account, idx: number) => idx !== accountIndex,
	);

	// If deleted account was primary → promote first account of same type (and broker for TMS)
	if (wasPrimary) {
		newAccounts = newAccounts.map((acc: Account, index: number) => {
			// For TMS, only promote within the same broker
			if (accountToDelete.type === "tms") {
				if (
					acc.type === accountToDelete.type &&
					acc.broker === accountToDelete.broker &&
					!acc.isPrimary &&
					index ===
						newAccounts.findIndex(
							(a) =>
								a.type === accountToDelete.type &&
								a.broker === accountToDelete.broker,
						)
				) {
					return { ...acc, isPrimary: true };
				}
			} else {
				// For NAASAX and MEROSHARE, promote first account of same type
				if (
					acc.type === accountToDelete.type &&
					!acc.isPrimary &&
					index ===
						newAccounts.findIndex((a) => a.type === accountToDelete.type)
				) {
					return { ...acc, isPrimary: true };
				}
			}
			return acc;
		});
	}

	return newAccounts;
}

export function makePrimary(
	accounts: Account[],
	alias: string,
	targetAccount: Account,
): Account[] {
	const newAccounts = accounts.map((acc: Account) => {
		// For TMS accounts, only affect accounts with the same broker
		// For NAASAX and MEROSHARE, affect all accounts of the same type
		if (acc.type === targetAccount.type) {
			if (targetAccount.type === "tms") {
				// TMS: broker-scoped primary
				if (acc.broker === targetAccount.broker) {
					return { ...acc, isPrimary: acc.alias === alias };
				}
			} else {
				// NAASAX and MEROSHARE: global primary
				return { ...acc, isPrimary: acc.alias === alias };
			}
		}
		return acc;
	});

	return newAccounts;
}

export function addAccount(
	accounts: Account[],
	newAccountData: Account,
): Account[] {
	const existingIndex = accounts.findIndex(
		(acc) =>
			acc.alias === newAccountData.alias ||
			acc.username === newAccountData.username,
	);

	let newAccount: Account;

	if (existingIndex === -1) {
		// New account
		newAccount = {
			...newAccountData,
			isPrimary: false,
			error: null,
			disabled: false,
			updatedAt: new Date().toISOString(),
			lastLoggedIn: new Date().toISOString(),
		};
	} else {
		// Update existing account
		newAccount = {
			...accounts[existingIndex],
			...newAccountData,
			updatedAt: new Date().toISOString(),
			error: null, // Reset error on update
		};
	}

	// Handle primary logic based on account type
	if (newAccount.type === "tms") {
		// TMS: broker-scoped primary
		const existingBrokerAccounts = accounts.filter(
			(acc) => acc.type === "tms" && acc.broker === newAccount.broker,
		);

		// If this is the first account for this broker, make it primary
		if (
			existingBrokerAccounts.length === 0 ||
			(existingIndex !== -1 && existingBrokerAccounts.length === 1)
		) {
			newAccount.isPrimary = true;
		}
	} else {
		// NAASAX and MEROSHARE: global primary
		const existingAccountsSameType = accounts.filter(
			(acc) => acc.type === newAccount.type,
		);

		// If this is the first account of this type, make it primary
		if (
			existingAccountsSameType.length === 0 ||
			(existingIndex !== -1 && existingAccountsSameType.length === 1)
		) {
			newAccount.isPrimary = true;
		}
	}

	let newAccounts: Account[];
	if (existingIndex === -1) {
		// Adding new account - demote others if this is primary
		if (newAccount.isPrimary) {
			newAccounts = accounts.map((acc) => {
				if (newAccount.type === "tms") {
					// TMS: demote only accounts with same broker
					if (acc.type === "tms" && acc.broker === newAccount.broker) {
						return { ...acc, isPrimary: false };
					}
				} else {
					// NAASAX and MEROSHARE: demote all of same type
					if (acc.type === newAccount.type) {
						return { ...acc, isPrimary: false };
					}
				}
				return acc;
			});
		} else {
			newAccounts = [...accounts];
		}
		newAccounts.push(newAccount);
	} else {
		// Updating existing account
		newAccounts = accounts.map((acc, i) => {
			if (i === existingIndex) {
				return newAccount;
			}
			// If updating account is set as primary, demote others
			if (newAccount.isPrimary) {
				if (newAccount.type === "tms") {
					// TMS: demote only accounts with same broker
					if (
						acc.type === "tms" &&
						acc.broker === newAccount.broker &&
						acc.alias !== newAccount.alias
					) {
						return { ...acc, isPrimary: false };
					}
				} else {
					// NAASAX and MEROSHARE: demote all of same type
					if (acc.type === newAccount.type && acc.alias !== newAccount.alias) {
						return { ...acc, isPrimary: false };
					}
				}
			}
			return acc;
		});
	}

	return newAccounts;
}
