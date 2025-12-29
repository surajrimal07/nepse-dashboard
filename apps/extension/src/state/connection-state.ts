// import { persist } from "zustand/middleware";
// import { useStore } from "zustand/react";
// import { createStore } from "zustand/vanilla";
// import { createDebouncedJSONStorage } from "zustand-debounce";
// import { mutative } from "zustand-mutative";
// import { LocalStorage } from "@/state/local-storage";
// import type { ConnectionStatus } from "@/types/connection-type";
// import { ConnectionState } from "@/types/connection-type";

// export interface ConnectionStatusState {
// 	connectionStatus: ConnectionStatus;
// 	setConnectionStatus: (status: ConnectionStatus) => void;
// }

// export const connectionState = createStore<ConnectionStatusState>()(
// 	mutative(
// 		persist(
// 			(set) => ({
// 				connectionStatus: {
// 					isConnected: ConnectionState.DISCONNECTED,
// 					message: "Socket disconnected.",
// 					bothWayLatency: 0,
// 					oneWayLatency: 0,
// 				} as ConnectionStatus,

// 				setConnectionStatus: (status: ConnectionStatus) => {
// 					set((state) => {
// 						state.connectionStatus = status;
// 					});
// 				},
// 			}),

// 			{
// 				name: "connection-state",
// 				storage: createDebouncedJSONStorage(LocalStorage, {
// 					debounceTime: 1000,
// 					maxRetries: 3,
// 					retryDelay: 1000,
// 				}),
// 				version: 1,
// 			},
// 		),
// 	),
// );

// export function useConnectionStatusState<T>(
// 	selector: (state: ConnectionStatusState) => T,
// ) {
// 	return useStore(connectionState, selector);
// }
