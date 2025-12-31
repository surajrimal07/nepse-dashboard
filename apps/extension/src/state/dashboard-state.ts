import { persist } from "zustand/middleware";
import { create } from "zustand/react";
import { mutative } from "zustand-mutative";
import { getNextPlaybackSpeed } from "@/components/nepse-tab/utils";
import type { DashboardDirection } from "@/types/general-types";
import type { IndexKeys, timeframe } from "@/types/indexes-type";
import { nepseIndexes } from "@/types/indexes-type";
import type { stateResult } from "@/types/misc-types";
import type { PlaybackSpeed } from "@/types/replay-types";
import { PLAYBACK_SPEEDS } from "@/types/replay-types";

type ChartStateByIndex = Record<IndexKeys, timeframe>;

// rename later to popup-state
export interface DashboardState {
	selectedIndexInDashboards: IndexKeys[];
	activeIndexInDashboard: IndexKeys;

	chartTypeByIndex: ChartStateByIndex;
	isReplayMode: boolean;

	setIsReplayMode: (mode: boolean) => void;

	replayPlaybackSpeed: PlaybackSpeed;
	changePlaybackSpeed: () => void;

	toggleChartType: () => void;

	addIndexInDashboard: (index: IndexKeys) => stateResult;
	removeIndexFromDashboard: (index: IndexKeys) => stateResult;

	toggleDashboard: (direction: DashboardDirection) => stateResult;

	marketDepthStock: string | null;
	setMarketDepthSymbol: (symbol: string | null) => void;
}

export const useDashboardState = create<DashboardState>()(
	mutative(
		persist(
			(set, get) => ({
				chartTypeByIndex: {} as ChartStateByIndex, // empty object
				selectedIndexInDashboards: [nepseIndexes[10]],
				activeIndexInDashboard: nepseIndexes[10],
				isReplayMode: false,
				setIsReplayMode: (mode: boolean) => set({ isReplayMode: mode }),

				toggleChartType: () => {
					const activeTab = useDashboardState.getState().activeIndexInDashboard;

					set((state) => {
						const currentType = state.chartTypeByIndex[activeTab];
						const newType = currentType === "1d" ? "1m" : "1d";
						state.chartTypeByIndex[activeTab] = newType;
					});
				},
				addIndexInDashboard: (index: IndexKeys) => {
					set((state) => {
						if (state.selectedIndexInDashboards.includes(index)) return;

						state.selectedIndexInDashboards.push(index);
					});
					return { success: true, message: `${index} added to dashboard` };
				},

				// Remove an index from dashboards
				removeIndexFromDashboard: (index) => {
					const currentPosition = useDashboardState
						.getState()
						.selectedIndexInDashboards.indexOf(index);
					if (currentPosition === -1) {
						return {
							success: false,
							message: `${index} not found in dashboard`,
						};
					}

					set((state) => {
						// Filter out the removed index
						state.selectedIndexInDashboards =
							state.selectedIndexInDashboards.filter((item) => item !== index);

						if (state.activeIndexInDashboard === index) {
							if (currentPosition > 0) {
								// Move to previous index
								state.activeIndexInDashboard =
									state.selectedIndexInDashboards[currentPosition - 1] ||
									nepseIndexes[10];
							} else if (state.selectedIndexInDashboards.length > 0) {
								// If at first position and other indices exist, take first remaining index
								state.activeIndexInDashboard =
									state.selectedIndexInDashboards[0];
							} else {
								// If no other indices, fall back to NEPSE_INDEX
								state.activeIndexInDashboard = nepseIndexes[10];
							}
						}
					});
					return { success: true, message: `${index} removed ` };
				},

				// market depth stock
				marketDepthStock: null,

				setMarketDepthSymbol: (symbol) => {
					set((state) => {
						state.marketDepthStock = symbol;
					});
				},

				toggleDashboard: (direction: DashboardDirection) => {
					const state = get();

					const dashboards = state.selectedIndexInDashboards;
					const length = dashboards.length;

					const currentIndex = dashboards.indexOf(state.activeIndexInDashboard);

					const delta = direction === "next" ? 1 : -1;

					const nextIndex = (currentIndex + delta + length) % length;

					const nextDashboard = dashboards[nextIndex];

					set((state) => {
						state.activeIndexInDashboard = nextDashboard;
					});

					return {
						success: true,
						message: nextDashboard,
					};
				},

				replayPlaybackSpeed: PLAYBACK_SPEEDS[1],
				changePlaybackSpeed: () => {
					set((state) => {
						state.replayPlaybackSpeed = getNextPlaybackSpeed(
							state.replayPlaybackSpeed,
						);
					});
				},
			}),

			{
				name: "dashboard-state",
				partialize: (state) => ({
					selectedIndexInDashboards: state.selectedIndexInDashboards,
					activeIndexInDashboard: state.activeIndexInDashboard,
					replayPlaybackSpeed: state.replayPlaybackSpeed,
					chartTypeByIndex: state.chartTypeByIndex,
					marketDepthStock: state.marketDepthStock,
				}),
				version: 1,
			},
		),
	),
);
