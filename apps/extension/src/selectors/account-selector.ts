// import type { AccountState } from '@/state/account-state'
// import type { Account, accountType, AllBrokers, ErrorTypes, NaasaxTempData } from '@/types/account-types'
// import type { stateResult } from '@/types/misc-types'

// export const selectAccounts = (state: AccountState): Account[] => state.accounts
// export function selectSetAccounts(state: AccountState): ((accounts: Account[]) => stateResult) {
//   return state.setAccounts
// }
// export const selectEditingAccount = (state: AccountState): string | null => state.editingAccount
// export function selectAddAccounts(state: AccountState): ((account: Account) => stateResult) {
//   return state.addAccounts
// }
// export function selectDeleteAccount(state: AccountState): ((alias: string) => stateResult) {
//   return state.deleteAccount
// }
// export function selectMakePrimary(state: AccountState): ((alias: string) => stateResult) {
//   return state.makePrimary
// }
// export function selectSetEditingAccount(state: AccountState): ((alias: string | null) => stateResult) {
//   return state.setEditingAccount
// }

// export const selectTmsAutofill = (state: AccountState): boolean => state.tmsAutofill
// export function selectSetTmsAutofill(state: AccountState): ((value: boolean) => stateResult) {
//   return state.setTmsAutofill
// }

// export const selectMeroAutofill = (state: AccountState): boolean => state.meroAutofill
// export function selectSetMeroAutofill(state: AccountState): ((value: boolean) => stateResult) {
//   return state.setMeroAutofill
// }

// export function selectAutoSaveNewAccount(state: AccountState): boolean | undefined {
//   return state.autoSaveNewAccount
// }
// export function selectSetAutoSaveNewAccount(state: AccountState): ((value: boolean) => stateResult) | undefined {
//   return state.setAutoSaveNewAccount
// }

// export function selectSetError(state: AccountState): ((alias: string, error: ErrorTypes) => stateResult) {
//   return state.setError
// }

// export function selectSetDisabled(state: AccountState): ((alias: string, disabled: boolean) => stateResult) {
//   return state.setDisabled
// }

// export function selectSetUpdatedAt(state: AccountState): ((alias: string, updatedAt: string) => stateResult) {
//   return state.setUpdatedAt
// }

// export function selectAccountByAlias(state: AccountState, alias: string): Account | undefined {
//   return state.accounts.find(account => account.alias === alias)
// }

// export function selectAccountByUsername(state: AccountState, username: string): Account | undefined {
//   return state.accounts.find(account => account.username === username)
// }

// export const selectSyncPortfolio = (state: AccountState): boolean => state.syncPortfolio
// export function selectSetSyncPortfolio(state: AccountState): ((value: boolean) => stateResult) {
//   return state.setSyncPortfolio
// }

// export const selectNaasaxAutofill = (state: AccountState): boolean => state.naasaxAutofill
// export function selectSetNaasaxAutofill(state: AccountState): ((value: boolean) => stateResult) {
//   return state.setNaasaxAutofill
// }
// export const selectBrokerList = (state: AccountState): AllBrokers => state.brokers
// export function selectSetBrokerList(state: AccountState): ((brokers: AllBrokers) => stateResult) {
//   return state.setBrokers
// }

// // UI Visibility selectors
// export const selectUIVisibility = (state: AccountState) => state.uiVisibility
// export function selectSetUIVisibility(state: AccountState): ((accountType: accountType, visible: boolean) => stateResult) {
//   return state.setUIVisibility
// }
// export function selectToggleUIVisibility(state: AccountState): ((accountType: accountType) => stateResult) {
//   return state.toggleUIVisibility
// }
// export function selectIsUIVisible(state: AccountState): ((accountType: accountType) => boolean) {
//   return state.isUIVisible
// }

// // Temp data selectors
// export const selectTempNaasaxData = (state: AccountState): NaasaxTempData | null => state.tempNaasaxData
// export function selectSetTempNaasaxData(state: AccountState): ((data: NaasaxTempData | null) => void) {
//   return state.setNaasaxTempData
// }

// // Last logged in selector
// export function selectSetLastLoggedIn(state: AccountState): ((alias: string) => stateResult) {
//   return state.setLastLoggedIn
// }
