// import { connect } from "crann-fork";
// import { persist } from "zustand/middleware";
// import { useStore } from "zustand/react";
// import { createStore } from "zustand/vanilla";
// import { createDebouncedJSONStorage } from "zustand-debounce";
// import { mutative } from "zustand-mutative";
// import { DataName } from "@/constants/action-name";
// import { appState } from "@/lib/service/app-service";
// import type { z } from "@/lib/zod";
// import { LocalStorage } from "@/state/local-storage";
// import { EventName } from "@/types/analytics-types";
// import type { ValidationErrorType } from "@/types/error-types";
// import type {
// 	DailyIndexChartWithData,
// 	IndexChart,
// 	IndexData,
// 	IndexIntradayData,
// 	IndexKeys,
// } from "@/types/indexes-type";
// import { nepseIndexes } from "@/types/indexes-type";
// import type { stateResult } from "@/types/misc-types";
// import type { MarketStatus } from "@/types/nepse-states-type";
// import { MarketStates } from "@/types/nepse-states-type";
// import { SocketRequestTypeConst } from "@/types/port-types";
// import { SOCKET_ROOMS } from "@/types/socket-type";
// import formatUserMessage from "@/utils/no-data";
// import { OpenPanelWeb } from "@/utils/open-panel-web";
// import { isValidationError } from "../utils/handle-error"; // todo

// // @ to do here, remove OpenPanelWeb sideeffects to components

// const defaultIndexData = nepseIndexes.reduce(
// 	(acc, key) => {
// 		acc[key] = {};
// 		return acc;
// 	},
// 	{} as Record<IndexKeys, z.infer<typeof IndexData>>,
// );

// export interface IndexState {
// 	indexData: Record<IndexKeys, IndexData | null>;
// 	isIndexDataLoading: boolean;
// 	isIndexChartLoading: boolean;
// 	isIndexDailyLoading: boolean;
// 	isNepseStateLoading: boolean;
// 	nepseState: MarketStatus;

// 	setNepseState: (state: MarketStatus) => void;
// 	fetchNepseState: () => Promise<stateResult>;

// 	// setter functions
// 	updateIndexData: (
// 		newData: Partial<Record<IndexKeys, IndexIntradayData>>,
// 	) => stateResult; // for selective update of index data
// 	updateIndexChartData: (newData: IndexChart) => void; // for a whole chart data update
// 	updateIndexDailyChartData: (newData: DailyIndexChartWithData) => void; // for a whole daily chart data update

// 	// fetch utils
// 	fetchIndexData: (refresh?: boolean) => Promise<stateResult>; // fetch index data and chart data of index
// 	fetchIndexChartData: (
// 		key: IndexKeys,
// 		refresh?: boolean,
// 	) => Promise<stateResult>; // fetch only chart data of index
// 	fetchIndexDailyChartData: (
// 		key: IndexKeys,
// 		refresh?: boolean,
// 	) => Promise<stateResult>; // fetch only daily chart data of index
// }

// export const indexState = createStore<IndexState>()(
// 	mutative(
// 		persist(
// 			(set, get) => ({
// 				indexData: defaultIndexData,
// 				isIndexDataLoading: false,
// 				isIndexChartLoading: false,
// 				isNepseStateLoading: false,
// 				nepseState: {
// 					state: MarketStates.CLOSE,
// 					isOpen: false,
// 					version: 0,
// 				},
// 				isIndexDailyLoading: false,

// 				setNepseState: (newState: MarketStatus) => {
// 					if (get().nepseState.version !== newState.version) {
// 						set((state) => {
// 							state.nepseState = newState;
// 						});
// 					}
// 				},
// 				fetchNepseState: async () => {
// 					set((state) => {
// 						state.isNepseStateLoading = true;
// 					});
// 					try {
// 						const { callAction } = connect(appState);

// 						const response: MarketStatus | ValidationErrorType =
// 							await callAction("fetch", {
// 								room: [SOCKET_ROOMS.IS_OPEN],
// 								type: SocketRequestTypeConst.requestData,
// 							});

// 						if (isValidationError(response)) {
// 							return { success: false, message: response.error.message };
// 						}

// 						if (!response) {
// 							return {
// 								success: false,
// 								message: formatUserMessage(DataName.NEPSE_STATE, "error"),
// 							};
// 						}

// 						if (response.version === get().nepseState.version) {
// 							return {
// 								success: false,
// 								message: formatUserMessage(
// 									DataName.NEPSE_STATE,
// 									"notAvailable",
// 								),
// 							};
// 						}

// 						get().setNepseState(response);
// 						return {
// 							success: true,
// 							message: formatUserMessage(DataName.NEPSE_STATE, "success"),
// 						};
// 					} catch (error) {
// 						const errorMessage =
// 							error instanceof Error ? error.message : String(error);

// 						OpenPanelWeb.track(EventName.EXCEPTION, {
// 							error: errorMessage,
// 							name,
// 						});
// 						return {
// 							success: false,
// 							message: formatUserMessage(
// 								DataName.NEPSE_STATE,
// 								"catch",
// 								errorMessage,
// 							),
// 						};
// 					} finally {
// 						set((state) => {
// 							state.isNepseStateLoading = false;
// 						});
// 					}
// 				},

// 				updateIndexData: (
// 					newData: Partial<Record<IndexKeys, IndexIntradayData>>,
// 				) => {
// 					for (const [key, dataValue] of Object.entries(newData)) {
// 						const indexKey = key as IndexKeys;
// 						const currentData = get().indexData[indexKey]?.IntradayData;

// 						if (currentData?.version === dataValue.version) {
// 							return {
// 								success: false,
// 								message: formatUserMessage(DataName.INDEX_DATA, "notAvailable"),
// 							};
// 						}
// 					}

// 					set((state) => {
// 						for (const [key, dataValue] of Object.entries(newData)) {
// 							const indexKey = key as IndexKeys;
// 							state.indexData[indexKey]!.IntradayData = dataValue;
// 						}
// 					});

// 					return {
// 						success: true,
// 						message: formatUserMessage(DataName.INDEX_DATA, "success"),
// 					};
// 				},

// 				updateIndexChartData: (newChart: IndexChart) =>
// 					set((state) => {
// 						const existingChart =
// 							state.indexData[newChart.index]?.IntradayChart;

// 						if (existingChart?.version === newChart.version) {
// 							return;
// 						}

// 						state.indexData[newChart.index]!.IntradayChart = newChart;
// 					}),

// 				updateIndexDailyChartData: (newChart: DailyIndexChartWithData) =>
// 					set((state) => {
// 						const indexKey = newChart.index as IndexKeys;
// 						const existingChart = state.indexData[indexKey]?.DailyChartWithData;

// 						if (existingChart?.version === newChart.version) {
// 							return;
// 						}

// 						state.indexData[indexKey]!.DailyChartWithData = newChart;
// 					}),

// 				fetchIndexData: async (refresh?: boolean) => {
// 					if (refresh) {
// 						set((state) => {
// 							state.isIndexDataLoading = true;
// 						});
// 					}

// 					try {
// 						const { callAction } = connect(appState);

// 						// WithNepse | ValidationErrorType

// 						// WithOutNepse | ValidationErrorType

// 						const [nepseData, indexData] = await Promise.all([
// 							callAction("fetch", {
// 								room: [SOCKET_ROOMS.NEPSE_INDEX],
// 								type: SocketRequestTypeConst.requestData,
// 							}),
// 							callAction("fetch", {
// 								room: [SOCKET_ROOMS.OTHER_INDEXES],
// 								type: SocketRequestTypeConst.requestData,
// 							}),
// 						]);

// 						if (isValidationError(nepseData)) {
// 							return {
// 								success: false,
// 								message: formatUserMessage(
// 									DataName.INDEX_DATA,
// 									"validationError",
// 									nepseData.error.message,
// 								),
// 							};
// 						}

// 						if (isValidationError(indexData)) {
// 							return {
// 								success: false,
// 								message: formatUserMessage(
// 									DataName.INDEX_DATA,
// 									"validationError",
// 									indexData.error.message,
// 								),
// 							};
// 						}

// 						if (!nepseData || !indexData) {
// 							return {
// 								success: false,
// 								message: formatUserMessage(DataName.INDEX_DATA, "notAvailable"),
// 							};
// 						}
// 						// merge both data
// 						const mergedData: Record<IndexKeys, IndexIntradayData> = {
// 							...nepseData,
// 							...indexData,
// 						};

// 						if (mergedData) {
// 							return get().updateIndexData(mergedData);
// 						}

// 						return {
// 							success: false,
// 							message: formatUserMessage(DataName.INDEX_DATA, "unknown"),
// 						};
// 					} catch (error) {
// 						const errorMessage =
// 							error instanceof Error ? error.message : String(error);

// 						return {
// 							success: false,
// 							message: formatUserMessage(
// 								DataName.INDEX_DATA,
// 								"catch",
// 								errorMessage,
// 							),
// 						};
// 					} finally {
// 						if (refresh) {
// 							set((state) => {
// 								state.isIndexDataLoading = false;
// 							});
// 						}
// 					}
// 				},

// 				fetchIndexChartData: async (key: IndexKeys, refresh?: boolean) => {
// 					if (refresh) {
// 						set((state) => {
// 							state.isIndexChartLoading = true;
// 						});
// 					}

// 					try {
// 						const { callAction } = connect(appState);

// 						const response: IndexChart | ValidationErrorType = await callAction(
// 							"fetch",
// 							{
// 								room: [SOCKET_ROOMS.INTRADAY_CHART],
// 								indexCharts: [key],
// 								type: SocketRequestTypeConst.requestData,
// 							},
// 						);

// 						if (!response) {
// 							return {
// 								success: false,
// 								message: formatUserMessage(
// 									DataName.INDEX_INTRADAY_CHART,
// 									"error",
// 								),
// 							};
// 						}

// 						if (isValidationError(response)) {
// 							return {
// 								success: false,
// 								message: formatUserMessage(
// 									DataName.INDEX_INTRADAY_CHART,
// 									"validationError",
// 									response.error.message,
// 								),
// 							};
// 						}

// 						const existingChartVersion =
// 							get().indexData[key]?.IntradayChart?.version;

// 						if (response.version === existingChartVersion) {
// 							return {
// 								success: false,
// 								message: formatUserMessage(
// 									DataName.INDEX_INTRADAY_CHART,
// 									"notAvailable",
// 								),
// 							};
// 						}

// 						set((state) => {
// 							state.indexData[key]!.IntradayChart = response;
// 						});
// 						return {
// 							success: true,
// 							message: formatUserMessage(
// 								DataName.INDEX_INTRADAY_CHART,
// 								"success",
// 							),
// 						};
// 					} catch (error) {
// 						const errorMessage =
// 							error instanceof Error ? error.message : String(error);

// 						OpenPanelWeb.track(EventName.EXCEPTION, {
// 							error: errorMessage,
// 							name,
// 							index: key,
// 						});
// 						return {
// 							success: false,
// 							message: formatUserMessage(
// 								DataName.INDEX_INTRADAY_CHART,
// 								"catch",
// 								errorMessage,
// 							),
// 						};
// 					} finally {
// 						if (refresh) {
// 							set((state) => {
// 								state.isIndexChartLoading = false;
// 							});
// 						}
// 					}
// 				},

// 				fetchIndexDailyChartData: async (key: IndexKeys, refresh?: boolean) => {
// 					if (refresh) {
// 						set((state) => {
// 							state.isIndexDailyLoading = true;
// 						});
// 					}

// 					try {
// 						const { callAction } = connect(appState);

// 						const response: DailyIndexChartWithData | ValidationErrorType =
// 							await callAction("fetch", {
// 								room: [SOCKET_ROOMS.DAILY_INDEX_CHART],
// 								type: SocketRequestTypeConst.requestData,
// 								indexCharts: [key],
// 							});

// 						if (isValidationError(response)) {
// 							return { success: false, message: response.error.message };
// 						}

// 						if (!response) {
// 							return {
// 								success: false,
// 								message: formatUserMessage(DataName.INDEX_DAILY_CHART, "error"),
// 							};
// 						}

// 						const currentDailyChartVersion =
// 							get().indexData[key]!.DailyChartWithData?.version;

// 						if (response.version === currentDailyChartVersion) {
// 							return {
// 								success: false,
// 								message: formatUserMessage(
// 									DataName.INDEX_DAILY_CHART,
// 									"notAvailable",
// 								),
// 							};
// 						}

// 						set((state) => {
// 							state.indexData[key]!.DailyChartWithData = response;
// 						});
// 						return {
// 							success: true,
// 							message: formatUserMessage(DataName.INDEX_DAILY_CHART, "success"),
// 						};
// 					} catch (error) {
// 						const errorMessage =
// 							error instanceof Error ? error.message : String(error);

// 						return {
// 							success: false,
// 							message: formatUserMessage(
// 								DataName.INDEX_DAILY_CHART,
// 								"catch",
// 								errorMessage,
// 							),
// 						};
// 					} finally {
// 						if (refresh) {
// 							set((state) => {
// 								state.isIndexDailyLoading = false;
// 							});
// 						}
// 					}
// 				},
// 			}),

// 			{
// 				name: "index-state",
// 				storage: createDebouncedJSONStorage(LocalStorage, {
// 					debounceTime: 1000,
// 					maxRetries: 3,
// 					retryDelay: 1000,
// 				}),
// 				version: 1,
// 				partialize: (state) => ({
// 					indexData: state.indexData,
// 					nepseState: state.nepseState,
// 				}),
// 			},
// 		),
// 	),
// );

// export function useIndexState<T>(selector: (state: IndexState) => T) {
// 	return useStore(indexState, selector);
// }
