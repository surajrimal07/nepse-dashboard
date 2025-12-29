// import { persist } from "zustand/middleware";
// import { useStore } from "zustand/react";
// import { createStore } from "zustand/vanilla";
// import { createDebouncedJSONStorage } from "zustand-debounce";
// import { mutative } from "zustand-mutative";
// import type {
// 	Account,
// 	accountType,
// 	ErrorTypes,
// 	NaasaxTempData,
// } from "@/types/account-types";
// import { AccountType } from "@/types/account-types";
// import type { stateResult } from "@/types/misc-types";
// import { LocalStorage } from "./local-storage";

// export interface AccountState {
// 	accounts: Account[];
// 	setAccounts: (accounts: Account[]) => stateResult;
// 	editingAccount: string | null;
// 	addAccounts: (account: Account) => stateResult;
// 	deleteAccount: (alias: string) => stateResult;
// 	makePrimary: (alias: string) => stateResult;
// 	setEditingAccount: (alias: string | null) => stateResult;

// 	tmsAutofill: boolean; //
// 	setTmsAutofill: (value: boolean) => stateResult;

// 	naasaxAutofill: boolean; //
// 	setNaasaxAutofill: (value: boolean) => stateResult;

// 	// Methods for managing accounts
// 	setError: (alias: string, error: ErrorTypes | null) => stateResult;
// 	setDisabled: (alias: string, disabled: boolean) => stateResult;
// 	setUpdatedAt: (alias: string, updatedAt: string) => stateResult;

// 	meroAutofill: boolean; //
// 	setMeroAutofill: (value: boolean) => stateResult;

// 	autoSaveNewAccount: boolean; //
// 	setAutoSaveNewAccount: (value: boolean) => stateResult;

// 	syncPortfolio: boolean; //
// 	setSyncPortfolio: (value: boolean) => stateResult;

// 	// UI visibility settings for all account types
// 	uiVisibility: Record<accountType, boolean>; //
// 	setUIVisibility: (accountType: accountType, visible: boolean) => stateResult;
// 	toggleUIVisibility: (accountType: accountType) => stateResult;
// 	isUIVisible: (accountType: accountType) => boolean;
// 	// Update Last Logged In Time
// 	setLastLoggedIn: (alias: string) => stateResult;

// 	// temp data for naasax
// 	tempNaasaxData: NaasaxTempData | null; //
// 	setNaasaxTempData: (data: NaasaxTempData | null) => void; //

// 	saveAccountIfNeeded: (
// 		type: accountType,
// 		broker: number | null,
// 		username: string,
// 		password: string,
// 	) => stateResult;
// }

// export const accountState = createStore<AccountState>()(
// 	mutative(
// 		persist(
// 			(set, _get): AccountState => ({
// 				accounts: [],
// 				editingAccount: null,
// 				tmsAutofill: true,
// 				naasaxAutofill: true,
// 				syncPortfolio: true,
// 				meroAutofill: true,
// 				autoSaveNewAccount: true,

// 				tempNaasaxData: null,

// 				setNaasaxTempData: (data) => {
// 					set((state) => {
// 						if (data === null) {
// 							state.tempNaasaxData = null;
// 							return;
// 						}

// 						if (!state.tempNaasaxData) {
// 							state.tempNaasaxData = { ...data };
// 							return;
// 						}

// 						// Only update fields that exist in the new data
// 						if (data.username !== undefined)
// 							state.tempNaasaxData.username = data.username;
// 						if (data.password !== undefined)
// 							state.tempNaasaxData.password = data.password;
// 						if (data.alias !== undefined)
// 							state.tempNaasaxData.alias = data.alias;
// 					});
// 				},

// 				// Initialize UI visibility for all account types
// 				uiVisibility: {
// 					[AccountType.TMS]: true,
// 					[AccountType.MEROSHARE]: true,
// 					[AccountType.NAASAX]: true,
// 				},

// 				// Set UI visibility for a specific account type
// 				setUIVisibility: (accountType, visible) => {
// 					set((state) => {
// 						state.uiVisibility[accountType] = visible;
// 					});
// 					return {
// 						success: true,
// 						message: `${accountType} UI visibility updated successfully`,
// 					};
// 				},

// 				// Toggle UI visibility for a specific account type
// 				toggleUIVisibility: (accountType) => {
// 					let result: stateResult;
// 					set((state) => {
// 						const currentValue = state.uiVisibility[accountType];
// 						state.uiVisibility[accountType] = !currentValue;
// 						result = {
// 							success: true,
// 							message: `${accountType} UI ${!currentValue ? "enabled" : "disabled"} successfully`,
// 						};
// 					});
// 					return result!;
// 				},

// 				// Check if UI is visible for a specific account type
// 				isUIVisible: (accountType) => {
// 					return _get().uiVisibility[accountType] ?? true;
// 				},

// 				setLastLoggedIn: (alias) => {
// 					let result: stateResult;
// 					set((state) => {
// 						const account = state.accounts.find((acc) => acc.alias === alias);

// 						if (account) {
// 							account.lastLoggedIn = new Date().toISOString();
// 							result = {
// 								success: true,
// 								message: "Last logged in time updated successfully",
// 							};
// 						} else {
// 							result = { success: false, message: "Account not found" };
// 						}
// 					});
// 					return result!;
// 				},

// 				setEditingAccount: (editingAccountAlias) => {
// 					set((state) => {
// 						state.editingAccount = editingAccountAlias;
// 					});
// 					return { success: true, message: "Editing account set successfully" };
// 				},
// 				setAccounts: (accountsToSet) => {
// 					set((state) => {
// 						state.accounts = accountsToSet;
// 					});
// 					return { success: true, message: "Accounts set successfully" };
// 				},

// 				setSyncPortfolio: (value) => {
// 					set((state) => {
// 						state.syncPortfolio = value;
// 					});
// 					return {
// 						success: true,
// 						message: "Sync portfolio setting updated successfully",
// 					};
// 				},

// 				setError: (alias, error) => {
// 					let result: stateResult;
// 					set((state) => {
// 						const account = state.accounts.find((acc) => acc.alias === alias);
// 						if (account) {
// 							account.error = error;
// 							result = {
// 								success: true,
// 								message: "Account error set successfully",
// 							};
// 						} else {
// 							result = { success: false, message: "Account not found" };
// 						}
// 					});
// 					return result!;
// 				},
// 				setDisabled: (alias, disabled) => {
// 					let result: stateResult;
// 					set((state) => {
// 						const account = state.accounts.find((acc) => acc.alias === alias);
// 						if (account) {
// 							account.disabled = disabled;
// 							result = {
// 								success: true,
// 								message: "Account disabled status updated successfully",
// 							};
// 						} else {
// 							result = { success: false, message: "Account not found" };
// 						}
// 					});
// 					return result!;
// 				},

// 				setUpdatedAt: (alias, updatedAt) => {
// 					let result: stateResult;
// 					set((state) => {
// 						const account = state.accounts.find((acc) => acc.alias === alias);
// 						if (account) {
// 							account.updatedAt = updatedAt;
// 							result = {
// 								success: true,
// 								message: "Account updated time set successfully",
// 							};
// 						} else {
// 							result = { success: false, message: "Account not found" };
// 						}
// 					});
// 					return result!;
// 				},

// 				setTmsAutofill: (value) => {
// 					set((state) => {
// 						state.tmsAutofill = value;
// 					});
// 					return {
// 						success: true,
// 						message: "TMS autofill setting updated successfully",
// 					};
// 				},

// 				setNaasaxAutofill: (value) => {
// 					set((state) => {
// 						state.naasaxAutofill = value;
// 					});
// 					return {
// 						success: true,
// 						message: "Naasax autofill setting updated successfully",
// 					};
// 				},

// 				setMeroAutofill: (value) => {
// 					set((state) => {
// 						state.meroAutofill = value;
// 					});
// 					return {
// 						success: true,
// 						message: "Mero autofill setting updated successfully",
// 					};
// 				},

// 				setAutoSaveNewAccount: (value) => {
// 					set((state) => {
// 						state.autoSaveNewAccount = value;
// 					});

// 					return {
// 						success: true,
// 						message: "Auto save new account setting updated successfully",
// 					};
// 				},

// 				// accounts code
// 				addAccounts: (newAccountData: Account) => {
// 					let result: stateResult;
// 					set((state) => {
// 						// Check if account already exists by alias or username
// 						const existingIndex = state.accounts?.findIndex(
// 							(acc) =>
// 								acc.alias === newAccountData.alias ||
// 								acc.username === newAccountData.username,
// 						);

// 						let newAccount: Account;

// 						// Only set default values for truly new accounts
// 						if (existingIndex === -1) {
// 							// This is a new account - set default values
// 							newAccount = {
// 								...newAccountData,
// 								updatedAt: new Date().toISOString(),
// 								lastLoggedIn: null,
// 								disabled: false,
// 								error: null,
// 							};
// 						} else {
// 							// This is an existing account - preserve existing values and only update what's provided
// 							const existingAccount = state.accounts[existingIndex];
// 							newAccount = {
// 								...existingAccount, // Start with existing values
// 								alias: newAccountData.alias, // only alias and username can be updated
// 								password: newAccountData.password,
// 								updatedAt: new Date().toISOString(), // Always update the timestamp
// 								error: null, // Reset error // User might have fixed the issue
// 							};
// 							// if this account was primary, and it triggered disable autofill then reenable it
// 							if (newAccount.isPrimary) {
// 								if (newAccount.type === AccountType.TMS && !state.tmsAutofill) {
// 									state.setTmsAutofill(true);
// 								} else if (
// 									newAccount.type === AccountType.MEROSHARE &&
// 									!state.meroAutofill
// 								) {
// 									state.meroAutofill = true;
// 								} else if (
// 									newAccount.type === AccountType.NAASAX &&
// 									!state.naasaxAutofill
// 								) {
// 									state.naasaxAutofill = true;
// 								}
// 							}
// 						}

// 						const existingAccountsSameType = state.accounts?.filter(
// 							(acc) => acc.type === newAccount.type,
// 						);

// 						if (newAccount.type === AccountType.TMS) {
// 							const brokerAccounts = existingAccountsSameType?.filter(
// 								(acc) => acc.broker === newAccount.broker,
// 							);

// 							if (brokerAccounts?.length === 0) {
// 								newAccount.isPrimary = true;
// 							} else if (!newAccount.isPrimary) {
// 								const existingPrimary = brokerAccounts?.find(
// 									(acc) => acc.isPrimary,
// 								);
// 								if (existingPrimary?.username === newAccount.username) {
// 									newAccount.isPrimary = true;
// 								}
// 							}

// 							if (newAccount.isPrimary) {
// 								state.accounts?.forEach((acc) => {
// 									if (
// 										acc.type === AccountType.TMS &&
// 										acc.broker === newAccount.broker &&
// 										acc.alias !== newAccount.alias
// 									) {
// 										acc.isPrimary = false;
// 									}
// 								});
// 							}
// 						} else if (newAccount.type === "naasax") {
// 							// Set broker to null for naasax accounts
// 							newAccount.broker = null;

// 							// If no naasax accounts exist, make this one primary
// 							if (existingAccountsSameType?.length === 0) {
// 								newAccount.isPrimary = true;
// 							} else if (!newAccount.isPrimary) {
// 								// If updating existing account, check if it was primary
// 								const existingPrimary = existingAccountsSameType?.find(
// 									(acc) => acc.isPrimary,
// 								);
// 								if (existingPrimary?.username === newAccount.username) {
// 									newAccount.isPrimary = true;
// 								}
// 							}

// 							// If this account is set as primary, make all other naasax accounts non-primary
// 							if (newAccount.isPrimary) {
// 								state.accounts?.forEach((acc) => {
// 									if (acc.type === "naasax" && acc.alias !== newAccount.alias) {
// 										acc.isPrimary = false;
// 									}
// 								});
// 							}
// 						} else if (newAccount.type === AccountType.MEROSHARE) {
// 							const primaryAccount = existingAccountsSameType?.find(
// 								(acc) => acc.isPrimary,
// 							);

// 							if (existingAccountsSameType?.length === 0) {
// 								newAccount.isPrimary = true;
// 							} else if (
// 								!newAccount.isPrimary &&
// 								primaryAccount?.username === newAccount.username
// 							) {
// 								newAccount.isPrimary = true;
// 							}

// 							if (newAccount.isPrimary) {
// 								state.accounts?.forEach((acc) => {
// 									if (
// 										acc.type === AccountType.MEROSHARE &&
// 										acc.alias !== newAccount.alias
// 									) {
// 										acc.isPrimary = false;
// 									}
// 								});
// 							}
// 						}

// 						if (existingIndex !== -1 && state.accounts[existingIndex]) {
// 							// Update existing account using mutative
// 							Object.assign(state.accounts[existingIndex], newAccount);
// 							result = {
// 								success: true,
// 								message: "Account updated successfully",
// 							};
// 						} else if (existingIndex === -1) {
// 							// Add new account
// 							state.accounts.push(newAccount);
// 							result = { success: true, message: "Account added successfully" };
// 						} else {
// 							result = {
// 								success: false,
// 								message: "Failed to add or update account",
// 							};
// 						}
// 					});
// 					return result!;
// 				},

// 				makePrimary: (alias: string) => {
// 					let result: stateResult;
// 					set((state) => {
// 						const accountToMakePrimary = state.accounts?.find(
// 							(account) => account.alias === alias,
// 						);
// 						if (!accountToMakePrimary) {
// 							result = { success: false, message: "Account not found" };
// 							return;
// 						}

// 						// Check if the account is already primary
// 						if (accountToMakePrimary.isPrimary) {
// 							result = {
// 								success: false,
// 								message: "Account is already primary",
// 							};
// 							return;
// 						}

// 						state.accounts?.forEach((acc) => {
// 							if (acc.alias === alias) {
// 								acc.isPrimary = true;
// 							} else if (
// 								(accountToMakePrimary.type === AccountType.MEROSHARE &&
// 									acc.type === AccountType.MEROSHARE &&
// 									acc.isPrimary) ||
// 								(accountToMakePrimary.type === AccountType.TMS &&
// 									acc.type === AccountType.TMS &&
// 									acc.broker === accountToMakePrimary.broker &&
// 									acc.isPrimary) ||
// 								(accountToMakePrimary.type === AccountType.NAASAX &&
// 									acc.type === AccountType.NAASAX &&
// 									acc.isPrimary)
// 							) {
// 								acc.isPrimary = false;
// 							}
// 						});

// 						result = {
// 							success: true,
// 							message: "Primary account updated successfully",
// 						};
// 					});
// 					return result!;
// 				},

// 				deleteAccount: (alias: string) => {
// 					let result: stateResult;
// 					set((state) => {
// 						const accountIndexToDelete = state.accounts?.findIndex(
// 							(acc) => acc.alias === alias,
// 						);

// 						if (accountIndexToDelete === -1) {
// 							result = { success: false, message: "Account not found" };
// 							return;
// 						}

// 						const accountToDelete = state.accounts?.[accountIndexToDelete];

// 						state.accounts?.splice(accountIndexToDelete, 1);

// 						if (accountToDelete.isPrimary) {
// 							const firstAccountOfSameTypeAndBroker = state.accounts.find(
// 								(acc) =>
// 									acc.type === accountToDelete.type &&
// 									(accountToDelete.type !== AccountType.TMS ||
// 										acc.broker === accountToDelete.broker),
// 							);

// 							if (firstAccountOfSameTypeAndBroker) {
// 								firstAccountOfSameTypeAndBroker.isPrimary = true;
// 							}
// 						}
// 						result = { success: true, message: "Account deleted successfully" };
// 					});
// 					return result!;
// 				},

// 				saveAccountIfNeeded: (type, broker, username, password) => {
// 					if (!username || !password || !type) {
// 						return {
// 							success: false,
// 							message: "Username, password, and account type are required",
// 						};
// 					}

// 					const state = accountState.getState();

// 					const existingAccount = state.accounts.find(
// 						(acc) => acc.username === username && acc.type === type,
// 					);

// 					if (existingAccount) {
// 						// clear its errors and some flags
// 						existingAccount.error = null;
// 						existingAccount.updatedAt = new Date().toISOString();

// 						// if this account was primary, and it triggered disable autofill then reenable it
// 						if (existingAccount.isPrimary) {
// 							if (type === AccountType.TMS && !state.tmsAutofill) {
// 								state.setTmsAutofill(true);
// 							} else if (
// 								type === AccountType.MEROSHARE &&
// 								!state.meroAutofill
// 							) {
// 								state.setMeroAutofill(true);
// 							} else if (type === AccountType.NAASAX && !state.naasaxAutofill) {
// 								state.setNaasaxAutofill(true);
// 							}
// 						}

// 						if (existingAccount.password === password) {
// 							return { success: false, message: "Account already exists" };
// 						} else {
// 							// now we came till here means account exists but password is different
// 							// so we will update the password and return success
// 							existingAccount.password = password;

// 							return {
// 								success: true,
// 								message: "Account password updated successfully",
// 							};
// 						}
// 					}

// 					// Otherwise, add the account and return the updated state
// 					const account: Account = {
// 						username,
// 						password,
// 						type,
// 						alias: username,
// 						isPrimary: false,
// 						error: null,
// 						disabled: false,
// 						updatedAt: new Date().toISOString(),
// 						lastLoggedIn: new Date().toISOString(), // since this occurs when the user is logging in
// 						broker,
// 					};

// 					// if this account is first of its type, make it primary
// 					if (
// 						state.accounts.length === 0 ||
// 						state.accounts.every((acc) => acc.type !== type)
// 					) {
// 						account.isPrimary = true;
// 					}

// 					return state.addAccounts(account);
// 				},
// 			}),

// 			{
// 				name: "account-state",
// 				storage: createDebouncedJSONStorage(LocalStorage, {
// 					debounceTime: 1000,
// 					maxRetries: 3,
// 					retryDelay: 1000,
// 				}),
// 				version: 1,
// 				partialize: (state) => ({
// 					accounts: state.accounts,
// 					tmsAutofill: state.tmsAutofill,
// 					meroAutofill: state.meroAutofill,
// 					naasaxAutofill: state.naasaxAutofill,
// 					autoSaveNewAccount: state.autoSaveNewAccount,
// 					syncPortfolio: state.syncPortfolio,
// 					uiVisibility: state.uiVisibility,
// 					tempNaasaxData: state.tempNaasaxData,
// 				}),
// 			},
// 		),
// 	),
// );

// export function useAccountState<T>(selector: (state: AccountState) => T) {
// 	return useStore(accountState, selector);
// }
