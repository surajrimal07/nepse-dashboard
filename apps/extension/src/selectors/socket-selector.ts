// // export const selectSubscribeConfig = (state: SocketConfigState): SocketRequest =>
// //   state.subscribeConfig;

// import type { SocketConfigState } from '@/state/socket-config-state'
// import type { IndexKeys } from '@/types/indexes-type'
// import type { SocketRooms } from '@/types/socket-type'

// export function selectSocketRooms(state: SocketConfigState): SocketRooms[] {
//   return state.subscribeConfig.room
// }

// export function selectIndexCharts(state: SocketConfigState): IndexKeys[] {
//   return state.subscribeConfig.indexCharts || []
// }

// export function selectStockCharts(state: SocketConfigState): string[] {
//   return state.subscribeConfig.stockCharts || []
// }

// export function selectMarketDepthStocks(state: SocketConfigState): string[] {
//   return state.subscribeConfig.marketDepthStocks || []
// }

// // export const selectUserToken = (state: SocketConfigState): string | undefined =>
// //   state.subscribeConfig.userToken || undefined;

// export const selectAddRoom = (state: SocketConfigState) => state.addRoom

// export const selectRemoveRoom = (state: SocketConfigState) => state.removeRoom

// export const selectAddIndexChart = (state: SocketConfigState) => state.addIndexChart

// export const selectRemoveIndexChart = (state: SocketConfigState) => state.removeIndexChart

// export const selectAddStockChart = (state: SocketConfigState) => state.addStockChart

// export const selectRemoveStockChart = (state: SocketConfigState) => state.removeStockChart

// export const selectAddMarketDepthStock = (state: SocketConfigState) => state.addMarketDepthStock

// export function selectRemoveMarketDepthStock(state: SocketConfigState) {
//   return state.removeMarketDepthStock
// }

// // export const selectUpdateUserToken = (state: SocketConfigState) => state.updateUserToken;

// // export const selectGetSubscribeConfig = (state: SocketConfigState) => state.getSubscribeConfig;

// // export const selectLoginPending = (state: SocketConfigState): boolean => state.loginPending;
// // export const selectSetLoginPending = (state: SocketConfigState) => state.setLoginPending;

// // export const selectSupabaseId = (state: SocketConfigState): string | null => state.supabaseId;
// // export const selectSetSupabaseId = (state: SocketConfigState) => state.setSupabaseId;

// // export const selectLoginTokens = (state: SocketConfigState): LoginTokens | null =>
// //   state.loginTokens;
// // export const selectSetLoginTokens = (state: SocketConfigState) => state.setLoginTokens;
