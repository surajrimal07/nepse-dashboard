import type { OptionTabsType } from "@/entrypoints/options/interface";
import type { GeneralState } from "@/state/general-state";

export const selectActiveTab = (state: GeneralState): string => state.activeTab;

export function selectActiveTabsOptions(state: GeneralState): OptionTabsType {
	return state.activeTabsOptions;
}

export const selectSetActiveTab = (state: GeneralState) => state.setActiveTab;

export function selectSetActiveTabsOptions(state: GeneralState) {
	return state.setActiveTabsOptions;
}

export const selectTabs = (state: GeneralState): string[] => state.tabs;
export function selectUpdatePopupPinnedTab(
	state: GeneralState,
): (alias: string | null) => void {
	return state.updatePinnedTab;
}

export function selectPopupPinnedTab(state: GeneralState): string | null {
	const secondTab = state.tabs[2];
	return secondTab === "account" ? null : secondTab || null;
}

export function SelectDynamicTab(state: GeneralState): string {
	const secondTab = state.tabs[2];
	return secondTab ?? "account";
}

export function selectChangePlaybackSpeed(state: GeneralState): () => void {
	return state.changePlaybackSpeed;
}

export function selectReplayPlaybackSpeed(state: GeneralState) {
	return state.replayPlaybackSpeed;
}
