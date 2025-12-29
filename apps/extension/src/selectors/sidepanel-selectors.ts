import type { SidebarDashboardState } from "@/state/sidepanel-state";
import { PLAYBACK_SPEEDS } from "@/types/replay-types";
import type { Widget } from "@/types/sidepanel-type";

export const selectWidgets = (state: SidebarDashboardState): Widget[] =>
	state.widgets;
export function selectAddWidget(
	state: SidebarDashboardState,
): (widget: Omit<Widget, "id">) => Promise<void> {
	return state.addWidget;
}
export function selectRemoveWidget(
	state: SidebarDashboardState,
): (id: string) => Promise<void> {
	return state.removeWidget;
}
export function selectAddDepthSymbol(
	state: SidebarDashboardState,
): (id: string, symbol: string | null) => Promise<void> {
	return state.addDepthSymbol;
}
export function selectToggleDailyChart(
	state: SidebarDashboardState,
): (id: string) => void {
	return state.toggleDailyChart;
}

export function selectSetIsReplayMode(
	state: SidebarDashboardState,
): (id: string, mode: boolean) => void {
	return state.changeIsReplayMode;
}

export function selectIsReplayMode(
	state: SidebarDashboardState,
	widgetId: string,
): boolean {
	const widget = state.widgets.find((w) => w.id === widgetId);
	return widget?.isReplayMode || false;
}

export function selectIsDailyChart(
	state: SidebarDashboardState,
	widgetId: string,
): boolean {
	const widget = state.widgets.find((w) => w.id === widgetId);
	return widget?.isDaily || false;
}

export function selectisPanelDailyChart(
	state: SidebarDashboardState,
	widgetId?: string,
): boolean {
	const widget = state.widgets.find((w) => w.id === widgetId);
	return widget?.isDaily || false;
}

export function selectReplayPlaybackSpeed(
	state: SidebarDashboardState,
	widgetId: string,
): number {
	const widget = state.widgets.find((w) => w.id === widgetId);
	return widget?.replayPlaybackSpeed || PLAYBACK_SPEEDS[1];
}

export function selectChangePlaybackSpeed(
	state: SidebarDashboardState,
): (widgetId: string) => void {
	return state.changePlaybackSpeed;
}

export const selectCurrentTab = (state: SidebarDashboardState): string =>
	state.currentTab;
export function selectSetCurrentTab(
	state: SidebarDashboardState,
): (tabKey: string) => void {
	return state.setCurrentTab;
}

export function selectMoveWidgetUp(
	state: SidebarDashboardState,
): (id: string) => void {
	return state.moveWidgetUp;
}

export function selectMoveWidgetDown(
	state: SidebarDashboardState,
): (id: string) => void {
	return state.moveWidgetDown;
}

export function selectPinnedTab(state: SidebarDashboardState): string {
	const secondTab = state.pinnedTab;
	return secondTab || "aichat";
}

export function selectUpdatePinnedTab(
	state: SidebarDashboardState,
): (alias: string | null) => void {
	return state.updatePinnedTab;
}
