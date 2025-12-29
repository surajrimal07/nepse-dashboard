// import type { IndexKeys } from '@/types/indexes-type'
// import type { SocketRooms } from '@/types/socket-type'
// import { defineProxyService } from '@webext-core/proxy-service'
// import { socketConfigState } from '@/state/socket-config-state'

// function createSocketConfigService() {
//   return {
//     addRoom(room: SocketRooms) {
//       socketConfigState.getState().addRoom(room)
//     },

//     removeRoom(room: SocketRooms) {
//       socketConfigState.getState().removeRoom(room)
//     },

//     addIndexChart(chart: IndexKeys) {
//       socketConfigState.getState().addIndexChart(chart)
//     },

//     removeIndexChart(chart: IndexKeys) {
//       socketConfigState.getState().removeIndexChart(chart)
//     },

//     addStockChart(stock: string) {
//       socketConfigState.getState().addStockChart(stock)
//     },

//     removeStockChart(stock: string) {
//       socketConfigState.getState().removeStockChart(stock)
//     },

//     addMarketDepthStock(stock: string) {
//       socketConfigState.getState().addMarketDepthStock(stock)
//     },

//     removeMarketDepthStock(stock: string) {
//       socketConfigState.getState().removeMarketDepthStock(stock)
//     },

//     getConfig() {
//       return socketConfigState.getState().subscribeConfig
//     },
//   }
// }

// export const [registerSocketConfigService, getSocketConfigService] = defineProxyService(
//   'SocketConfigService',
//   createSocketConfigService,
// )
