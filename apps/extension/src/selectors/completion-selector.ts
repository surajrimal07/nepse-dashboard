// import type { CompletionState } from '@/state/completions-state'
// import type { stateResult } from '@/types/misc-types'
// import type { CompletionsOrders, CompletionsStatus } from '@/types/odd-types'

// export function selectCompletions(state: CompletionState): Record<string, CompletionsOrders[]> {
//   return state.completions
// }

// export function selectIsCompletionsLoading(state: CompletionState): boolean {
//   return state.isCompletionsLoading
// }

// export function selectSetMyCompletions(state: CompletionState): ((completionsData: CompletionsOrders[]) => stateResult) {
//   return state.setMyCompletions
// }

// export function selectFetchMyCompletions(state: CompletionState): (() => Promise<stateResult>) {
//   return state.fetchMyCompletions
// }

// export function selectRequestCompletions(state: CompletionState): ((id: string, message?: string) => Promise<stateResult>) {
//   return state.requestCompletions
// }

// export function selectRespondCompletions(state: CompletionState): ((orderId: string, completionId: string, status: CompletionsStatus) => Promise<stateResult>) {
//   return state.respondCompletions
// }

// export function selectisRequestCompletionsLoading(state: CompletionState): boolean {
//   return state.isRequestCompletionsLoading
// }
