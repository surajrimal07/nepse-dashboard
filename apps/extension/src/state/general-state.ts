import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useStore } from "zustand/react";
import { mutative } from "zustand-mutative";
import { getNextPlaybackSpeed } from "@/components/nepse-tab/utils";
import { CONFIG } from "@/constants/app-config";
import type { OptionTabsType } from "@/entrypoints/options/interface";
import { OPTION_TABS } from "@/entrypoints/options/interface";
import { TabStateEnum } from "@/types/general-types";
import { PLAYBACK_SPEEDS, type PlaybackSpeed } from "@/types/replay-types";

// only to be used in ui that has dom and localstorage
export interface GeneralState {
	activeTab: string;
	setActiveTab: (tab: string) => void;

	// dynamic 3rd tab in popup
	tabs: string[];
	updatePinnedTab: (alias: string | null) => void;

	//global playback sppeed for all top playbacks
	replayPlaybackSpeed: PlaybackSpeed;
	changePlaybackSpeed: () => void;

	dismissedIds: number[];
	hasBanner: boolean;

	dismiss: (id: number) => void;
	setHasBanner: (value: boolean) => void;

	activeTabsOptions: OptionTabsType;
	setActiveTabsOptions: (activeTabsOptions: OptionTabsType) => void;
}

export const generalState = create<GeneralState>()(
	mutative(
		persist(
			(set, get) => ({
				dismissedIds: [],
				hasBanner: false,

				dismiss: (id) =>
					set((state) => {
						if (state.dismissedIds.includes(id)) return;
						state.dismissedIds.push(id);
						state.hasBanner = false;
					}),

				setHasBanner: (value) => set({ hasBanner: value }),

				tabs: [TabStateEnum.HOME, TabStateEnum.DASHBOARD],
				updatePinnedTab: (alias) => {
					const currentThirdTab = get().tabs[2];

					set((state) => {
						if (alias) {
							state.tabs[2] = alias;

							// If user was on aichat, switch to pinned tab
							if (state.activeTab === CONFIG.default_tab) {
								state.activeTab = alias;
							}
							// track in UI
							// op.track(EventName.WIDGET_PINNED, { pinnedTab: alias });
						} else {
							state.tabs[2] = CONFIG.default_tab;

							if (state.activeTab === currentThirdTab) {
								state.activeTab = CONFIG.default_tab;
							}
						}
					});
				},

				replayPlaybackSpeed: PLAYBACK_SPEEDS[1],
				changePlaybackSpeed: () => {
					set((state) => {
						state.replayPlaybackSpeed = getNextPlaybackSpeed(
							state.replayPlaybackSpeed,
						);
					});
				},

				activeTabsOptions: OPTION_TABS.GENERAL,
				setActiveTabsOptions: (activeTabsOptions) => {
					set((state) => {
						state.activeTabsOptions = activeTabsOptions;
					});
				},

				activeTab: TabStateEnum.HOME,

				setActiveTab: (tab) => {
					const state = get().activeTab;
					if (tab === state) return;

					set((state) => {
						state.activeTab = tab;
					});
				},
			}),

			{
				name: "general-state",
				storage: createJSONStorage(() => localStorage),
				version: 1,
			},
		),
	),
);

export function useGeneralState<T>(selector: (state: GeneralState) => T) {
	return useStore(generalState, selector);
}
