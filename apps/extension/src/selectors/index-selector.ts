// import type { IndexState } from '@/state/index-state'
// import type {
//   DailyIndexChartWithData,
//   IndexChart,
//   IndexData,
//   IndexIntradayData,
//   IndexKeys,
// } from '@/types/indexes-type'
// import type { stateResult } from '@/types/misc-types'
// import type { MarketStatus } from '@/types/nepse-states-type'

// export function selectIndexData(state: IndexState): Record<IndexKeys, IndexData | null> {
//   return state.indexData
// }

// export const selectNepseState = (state: IndexState): MarketStatus => state.nepseState
// export function selectSetNepseState(state: IndexState): ((state: MarketStatus) => void) {
//   return state.setNepseState
// }
// export function selectFetchNepseState(state: IndexState): (() => Promise<stateResult>) {
//   return state.fetchNepseState
// }

// export function selectUpdateIndexData(state: IndexState): ((newData: Partial<Record<IndexKeys, IndexIntradayData>>) => void) {
//   return state.updateIndexData
// }
// export function selectUpdateIndexChartData(state: IndexState): ((newData: IndexChart) => void) {
//   return state.updateIndexChartData
// }
// export function selectUpdateIndexDailyChartData(state: IndexState): ((newData: DailyIndexChartWithData) => void) {
//   return state.updateIndexDailyChartData
// }

// export function selectFetchIndexData(state: IndexState): ((refresh?: boolean) => Promise<stateResult>) {
//   return state.fetchIndexData
// }
// export function selectFetchIndexChartData(state: IndexState): ((key: IndexKeys, refresh?: boolean) => Promise<stateResult>) {
//   return state.fetchIndexChartData
// }
// export function selectFetchIndexDailyChartData(state: IndexState): ((key: IndexKeys, refresh?: boolean) => Promise<stateResult>) {
//   return state.fetchIndexDailyChartData
// }

// export const selectIsNepseStateLoading = (state: IndexState): boolean => state.isNepseStateLoading
// export const selectIsIndexDataLoading = (state: IndexState): boolean => state.isIndexDataLoading
// export const selectIsIndexChartLoading = (state: IndexState): boolean => state.isIndexChartLoading
// export const selectIsIndexDailyLoading = (state: IndexState): boolean => state.isIndexDailyLoading

// export function selectCurrentIndex(state: IndexState, activeDashboard: IndexKeys): IndexData | null {
//   return state.indexData?.[activeDashboard] || null
// }
