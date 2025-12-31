import type { DashboardState } from '@/state/dashboard-state'
import type { DashboardDirection } from '@/types/general-types'
import type { IndexKeys } from '@/types/indexes-type'
import type { stateResult } from '@/types/misc-types'

export function selectSelectedIndexInDashboards(
  state: DashboardState,
): IndexKeys[] {
  return state.selectedIndexInDashboards
}

export function selectActiveIndexInDashboard(state: DashboardState): IndexKeys {
  return state.activeIndexInDashboard
}

export function selectIsDailyChart(state: DashboardState) {
  return state.chartTypeByIndex[state.activeIndexInDashboard] === '1d'
}

export function selectToggleChartType(state: DashboardState): (() => void) {
  return state.toggleChartType
}

export function selectIsReplayMode(state: DashboardState): boolean {
  return state.isReplayMode
}
export function selectSetIsReplayMode(
  state: DashboardState,
): (mode: boolean) => void {
  return state.setIsReplayMode
}

export function selectAddIndexInDashboard(
  state: DashboardState,
): (index: IndexKeys) => stateResult {
  return state.addIndexInDashboard
}
export function selectRemoveIndexFromDashboard(
  state: DashboardState,
): (index: IndexKeys) => stateResult {
  return state.removeIndexFromDashboard
}

export function selectToggleDashboard(
  state: DashboardState,
): (direction: DashboardDirection) => stateResult {
  return state.toggleDashboard
}

export function selectChangePlaybackSpeed(state: DashboardState): () => void {
  return state.changePlaybackSpeed
}

export function selectReplayPlaybackSpeed(state: DashboardState) {
  return state.replayPlaybackSpeed
}

export function selectMarketDepthStock(state: DashboardState): string | null {
  return state.marketDepthStock
}

export function selectSetMarketDepthSymbol(
  state: DashboardState,
): (symbol: string | null) => void {
  return state.setMarketDepthSymbol
}
