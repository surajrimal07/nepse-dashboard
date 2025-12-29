// import type { IndexKeys } from '@/types/indexes-type'
// import type { SocketRequest } from '@/types/port-types'
// import type { SocketRooms } from '@/types/socket-type'
// import { createDebouncedJSONStorage } from 'zustand-debounce'

// import { mutative } from 'zustand-mutative'
// import { persist, subscribeWithSelector } from 'zustand/middleware'
// import { createStore } from 'zustand/vanilla'
// import { nepseIndexes } from '@/types/indexes-type'
// import { SOCKET_ROOMS } from '@/types/socket-type'
// import { LocalStorage } from './local-storage'

// export interface SocketConfigState {
//   subscribeConfig: Omit<SocketRequest, 'userToken' | 'requestId' | 'type'>

//   addRoom: (room: SocketRooms) => void
//   removeRoom: (roomToRemove: SocketRooms) => void

//   addIndexChart: (chart: IndexKeys) => void
//   removeIndexChart: (chartToRemove: IndexKeys) => void

//   addStockChart: (chart: string) => void
//   removeStockChart: (chartToRemove: string) => void

//   addMarketDepthStock: (stock: string) => void
//   removeMarketDepthStock: (stockToRemove: string) => void
// }

// export const socketConfigState = createStore<SocketConfigState>()(
//   subscribeWithSelector(
//     mutative(
//       persist(
//         set => ({
//           subscribeConfig: {
//             room: [
//               SOCKET_ROOMS.IS_OPEN,
//               SOCKET_ROOMS.DASHBOARD,
//               SOCKET_ROOMS.SENTIMENT,
//               SOCKET_ROOMS.ALL_COMPANIES,
//               SOCKET_ROOMS.NEPSE_INDEX,
//               SOCKET_ROOMS.OTHER_INDEXES,
//               SOCKET_ROOMS.CONSUME,
//               SOCKET_ROOMS.SUPPLY_DEMAND,
//             ],
//             indexCharts: [nepseIndexes[10]], // default to NEPSE index
//             stockCharts: [],
//             marketDepthStocks: [],
//           },

//           addRoom: (room: SocketRooms) => {
//             set((state) => {
//               if (!state.subscribeConfig.room?.includes(room)) {
//                 state.subscribeConfig.room?.push(room)
//               }
//             })
//           },

//           removeRoom: (roomToRemove: SocketRooms) => {
//             set((state) => {
//               state.subscribeConfig.room = state.subscribeConfig.room?.filter(
//                 (room: SocketRooms) => room !== roomToRemove,
//               )
//             })
//           },

//           addIndexChart: (chart: IndexKeys) => {
//             set((state) => {
//               if (!state.subscribeConfig.indexCharts?.includes(chart)) {
//                 state.subscribeConfig.indexCharts?.push(chart)
//               }
//             })
//           },

//           removeIndexChart: (chartToRemove: IndexKeys) => {
//             set((state) => {
//               if (state.subscribeConfig.indexCharts?.includes(chartToRemove)) {
//                 state.subscribeConfig.indexCharts = state.subscribeConfig.indexCharts.filter(
//                   chart => chart !== chartToRemove,
//                 )
//                 //
//               }
//             })
//           },

//           addStockChart: (chart) => {
//             set((state) => {
//               if (!state.subscribeConfig.stockCharts?.includes(chart)) {
//                 state.subscribeConfig.stockCharts = [
//                   ...(state.subscribeConfig.stockCharts || []),
//                   chart,
//                 ]
//               }
//             })
//           },

//           removeStockChart: (chartToRemove) => {
//             set((state) => {
//               if (
//                 state.subscribeConfig.stockCharts
//                 && state.subscribeConfig.stockCharts.includes(chartToRemove)
//               ) {
//                 state.subscribeConfig.stockCharts = state.subscribeConfig.stockCharts.filter(
//                   chart => chart !== chartToRemove,
//                 )
//               }
//             })
//           },

//           addMarketDepthStock: (stock: string) => {
//             set((state) => {
//               if (!state.subscribeConfig.marketDepthStocks?.includes(stock)) {
//                 state.subscribeConfig.marketDepthStocks = [
//                   ...(state.subscribeConfig.marketDepthStocks || []),
//                   stock,
//                 ]
//               }
//             })
//           },

//           removeMarketDepthStock: (stockToRemove: string) => {
//             set((state) => {
//               if (
//                 state.subscribeConfig.marketDepthStocks
//                 && state.subscribeConfig.marketDepthStocks.includes(stockToRemove)
//               ) {
//                 state.subscribeConfig.marketDepthStocks
//                   = state.subscribeConfig.marketDepthStocks.filter(
//                     stock => stock !== stockToRemove,
//                   )
//               }
//             })
//           },
//         }),

//         {
//           name: 'socket-config-state',
//           storage: createDebouncedJSONStorage(LocalStorage, {
//             debounceTime: 1000,
//             maxRetries: 3,
//             retryDelay: 1000,
//           }),
//           version: 1,
//           partialize: state => ({
//             subscribeConfig: state.subscribeConfig,
//           }),
//         },
//       ),
//     ),
//   ),
// )
