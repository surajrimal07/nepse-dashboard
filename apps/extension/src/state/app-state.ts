// import { persist } from "zustand/middleware";
// import { useStore } from "zustand/react";
// import { createStore } from "zustand/vanilla";
// import { createDebouncedJSONStorage } from "zustand-debounce";
// import { mutative } from "zustand-mutative";
// import type { NewsSiteType } from "@/types/general-types";
// import type { stateResult } from "@/types/misc-types";
// import { LocalStorage } from "./local-storage";

// export interface AppState {
// 	tmsUrl: string | null;
// 	setTmsUrl: (url: string) => stateResult;

// 	// Global news switch
// 	globalNewsEnabled: boolean;
// 	setGlobalNewsEnabled: (enabled: boolean) => stateResult;
// 	toggleGlobalNews: () => stateResult;

// 	// Fine-grained news visibility per site
// 	newsVisibility: Record<NewsSiteType, boolean>;
// 	setNewsVisibility: (
// 		accountType: NewsSiteType,
// 		visible: boolean,
// 	) => stateResult;
// 	toggleNewsVisibility: (accountType: NewsSiteType) => stateResult;
// 	isNewsVisible: (accountType: NewsSiteType) => boolean;
// }

// export const appState = createStore<AppState>()(
// 	mutative(
// 		persist(
// 			(set, get) => ({
// 				tmsUrl: null,
// 				setTmsUrl: (url: string) => {
// 					set((state) => {
// 						state.tmsUrl = url;
// 					});

// 					return { success: true, message: "TMS URL set successfully" };
// 				},
// 				// Global news switch
// 				globalNewsEnabled: true,
// 				setGlobalNewsEnabled: (enabled: boolean) => {
// 					set((state) => {
// 						state.globalNewsEnabled = enabled;
// 					});

// 					return {
// 						success: true,
// 						message: `Global news ${enabled ? "enabled" : "disabled"} successfully`,
// 					};
// 				},
// 				toggleGlobalNews: () => {
// 					let newState: boolean;
// 					set((state) => {
// 						state.globalNewsEnabled = !state.globalNewsEnabled;
// 						newState = state.globalNewsEnabled;
// 					});

// 					return {
// 						success: true,
// 						message: `Global news ${newState! ? "enabled" : "disabled"} successfully`,
// 					};
// 				},

// 				// Fine-grained news visibility per site
// 				newsVisibility: {
// 					merolagani: true,
// 					sharesansar: true,
// 				},
// 				setNewsVisibility: (accountType: NewsSiteType, visible: boolean) => {
// 					set((state) => {
// 						state.newsVisibility[accountType] = visible;
// 					});

// 					return {
// 						success: true,
// 						message: `${accountType} news ${visible ? "enabled" : "disabled"} successfully`,
// 					};
// 				},
// 				toggleNewsVisibility: (accountType: NewsSiteType) => {
// 					let newState: boolean;
// 					set((state) => {
// 						state.newsVisibility[accountType] =
// 							!state.newsVisibility[accountType];
// 						newState = state.newsVisibility[accountType];
// 					});

// 					return {
// 						success: true,
// 						message: `${accountType} news ${newState! ? "enabled" : "disabled"} successfully`,
// 					};
// 				},
// 				isNewsVisible: (accountType: NewsSiteType): boolean => {
// 					const state = get();
// 					// News is visible if both global news is enabled AND the specific site is enabled
// 					return state.globalNewsEnabled && state.newsVisibility[accountType];
// 				},
// 			}),

// 			{
// 				name: "app-state",
// 				storage: createDebouncedJSONStorage(LocalStorage, {
// 					debounceTime: 1000,
// 					maxRetries: 3,
// 					retryDelay: 1000,
// 				}),
// 				partialize: (s) => ({
// 					tmsUrl: s.tmsUrl,
// 					globalNewsEnabled: s.globalNewsEnabled,
// 					newsVisibility: s.newsVisibility,
// 				}),
// 				version: 1,
// 			},
// 		),
// 	),
// );

// export const useAppStates = <T>(selector: (state: AppState) => T) =>
// 	useStore(appState, selector);
