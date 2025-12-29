import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useStore } from "zustand/react";
import { mutative } from "zustand-mutative";
import { dashboardItems } from "@/components/dashboard-tab/menu-items";
import { getNextPlaybackSpeed } from "@/components/nepse-tab/utils";
import { CONFIG } from "@/constants/app-config";
import { PLAYBACK_SPEEDS } from "@/types/replay-types";
import type { Widget } from "@/types/sidepanel-type";
import { SidepanelTabs, widgetType } from "@/types/sidepanel-type";

export interface SidebarDashboardState {
	widgets: Widget[];
	addWidget: (widget: Omit<Widget, "id">) => Promise<void>;
	removeWidget: (id: string) => Promise<void>;
	addDepthSymbol: (id: string, symbol: string | null) => Promise<void>;
	toggleDailyChart: (id: string) => void;
	changePlaybackSpeed: (id: string) => void;
	changeIsReplayMode: (id: string, mode: boolean) => void;

	// Tab management
	pinnedTab: string; // available tabs in the sidebar, why no TabItem[]? icon data gets lost, so we write array of sring[] , this string === TabItem.alias
	currentTab: string; // current active tab key, string === TabItem.alias
	setCurrentTab: (tabKey: string) => void; // sets the current active tab of sidepanel navigation
	updatePinnedTab: (alias: string | null) => void; // updates the pinned tab in the second position of tabs
	// when upating pinned tab, if alias is null, it will restore the chat tab, or else set alias of incoming string to the second tab
	// then in ui, map this way, if alias or string or currentTab === Dashboard or sidePanelHome, map through DEFAULTTABS, else
	// dashboardItems to get its name, icons,

	moveWidgetUp: (id: string) => void;
	moveWidgetDown: (id: string) => void;
}

export const sidebarDashboardState = create<SidebarDashboardState>()(
	mutative(
		persist(
			(set, get) => ({
				widgets: [],
				pinnedTab: CONFIG.default_tab,
				currentTab: SidepanelTabs.HOME,

				changeIsReplayMode: (id: string, mode: boolean) => {
					set((state) => {
						const widget = state.widgets.find((w) => w.id === id);
						if (!widget) return;

						widget.isReplayMode = mode;
					});
				},

				setCurrentTab: (tabKey: string) => {
					const currentTab = get().currentTab;
					if (currentTab === tabKey) return;

					set((state) => {
						state.currentTab = tabKey;
					});
				},

				updatePinnedTab: (alias: string | null) => {
					const currentSecondTab = get().pinnedTab;

					set((state) => {
						if (alias) {
							const menuItem = dashboardItems.find(
								(item) => item.alias === alias,
							);
							if (menuItem) {
								// Update the second tab (index 1) with pinned item alias
								state.pinnedTab = alias;

								// If user was on aichat, switch to pinned tab
								if (state.currentTab === CONFIG.default_tab) {
									state.currentTab = alias;
								}
							}
						} else {
							state.pinnedTab = CONFIG.default_tab;

							if (state.currentTab === currentSecondTab) {
								state.currentTab = CONFIG.default_tab;
							}
						}
					});
				},

				moveWidgetUp: (id: string) => {
					set((state) => {
						const currentIndex = state.widgets.findIndex((w) => w.id === id);
						if (currentIndex > 0) {
							const temp = state.widgets[currentIndex];
							state.widgets[currentIndex] = state.widgets[currentIndex - 1];
							state.widgets[currentIndex - 1] = temp;
						}
					});
				},

				moveWidgetDown: (id: string) => {
					set((state) => {
						const currentIndex = state.widgets.findIndex((w) => w.id === id);
						if (
							currentIndex !== -1 &&
							currentIndex < state.widgets.length - 1
						) {
							const temp = state.widgets[currentIndex];
							state.widgets[currentIndex] = state.widgets[currentIndex + 1];
							state.widgets[currentIndex + 1] = temp;
						}
					});
				},

				addWidget: async (widget) => {
					const processedWidget = { ...widget };

					if (processedWidget.title && processedWidget.title.length > 37) {
						processedWidget.title = `${processedWidget.title.substring(0, 30)}...`;
					}

					const isChartWidget =
						processedWidget.type === widgetType.CHART ||
						processedWidget.type === widgetType.STOCK;

					const newWidget: Widget = {
						...processedWidget,
						id: `${processedWidget.type}-${Date.now()}-${Math.random().toString(30).substring(2, 7)}`,
						isDaily: isChartWidget ? false : undefined,
						isReplayMode: isChartWidget ? false : undefined,
						replayPlaybackSpeed: isChartWidget ? PLAYBACK_SPEEDS[1] : undefined,
					};

					set((state) => {
						state.widgets.push(newWidget);
					});
				},

				removeWidget: async (id) => {
					set((state) => {
						const widgetIndex = state.widgets.findIndex((w) => w.id === id);
						if (widgetIndex !== -1) {
							state.widgets.splice(widgetIndex, 1);
						}
					});
				},

				changePlaybackSpeed: (id) => {
					set((state) => {
						const widget = state.widgets.find((w) => w.id === id);
						if (!widget || !widget.replayPlaybackSpeed) return;

						widget.replayPlaybackSpeed = getNextPlaybackSpeed(
							widget.replayPlaybackSpeed,
						);
					});
				},

				toggleDailyChart: (id: string) => {
					set((state) => {
						const widget = state.widgets.find((w) => w.id === id);
						if (!widget) return;

						const willBeDaily = !widget.isDaily;
						widget.isDaily = willBeDaily;
					});
				},

				addDepthSymbol: async (id, symbol) => {
					if (!id) return;

					const title = `${symbol ?? "No Company Selected"} - Market Depth`;

					set((state) => {
						const widget = state.widgets.find((w) => w.id === id);
						if (!widget) return;

						widget.title = title;
						if (symbol) {
							widget.depthSymbol = symbol;
						} else {
							widget.depthSymbol = undefined;
						}
					});
				},
			}),

			{
				name: "sidepanel-state",
				storage: createJSONStorage(() => localStorage),
				version: 1,
			},
		),
	),
);

export function useSidebarDashboardState<T>(
	selector: (state: SidebarDashboardState) => T,
) {
	return useStore(sidebarDashboardState, selector);
}
