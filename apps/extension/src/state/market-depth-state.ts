// import type { ValidationErrorType } from '@/types/error-types'
// import type { MarketDepth } from '@/types/market-depth-types'

// import { connect } from 'crann'
// import { createDebouncedJSONStorage } from 'zustand-debounce'
// import { mutative } from 'zustand-mutative'
// import { persist } from 'zustand/middleware'
// import { useStore } from 'zustand/react'
// import { createStore } from 'zustand/vanilla'
// import { appState } from '@/lib/service/app-service'
// import { LocalStorage } from '@/state/local-storage'
// import { SocketRequestTypeConst } from '@/types/port-types'
// import { SOCKET_ROOMS } from '@/types/socket-type'

// export interface MarketDepthState {
//   marketDepthStock: string | null
//   marketDepthData: Record<string, MarketDepth> | null
//   depthError: string | null

//   setMarketDepthSymbol: (symbol: string | null) => void

//   // //holds all market depth data for popup and sidebar
//   setMarketDepthData: (data: MarketDepth) => void
//   getMarketDepthData: (symbol: string) => Promise<MarketDepth | null>

//   // fetcher
//   fetchMarketDepth: (symbol: string) => Promise<MarketDepth | null>
//   setMarketDepthError: (error: string) => void
// }

// export const marketDepthState = createStore<MarketDepthState>()(
//   mutative(
//     persist(
//       (set, get) => ({
//         marketDepthStock: null,
//         marketDepthData: {} as Record<string, MarketDepth>,
//         depthError: null, // Initialized
//         setMarketDepthData: (data) => {
//           set((state) => {
//             if (!state.marketDepthData) {
//               state.marketDepthData = {}
//             }

//             state.marketDepthData[data.symbol] = data
//             state.depthError = null
//           })
//         },
//         getMarketDepthData: async (symbol) => {
//           const currentMarketDepthData = get().marketDepthData
//           const dataForSymbol = currentMarketDepthData?.[symbol]

//           if (
//             dataForSymbol
//             && dataForSymbol.timeStamp
//             && Date.now() - dataForSymbol.timeStamp <= 240000
//           ) {
//             return dataForSymbol
//           }

//           return await get().fetchMarketDepth(symbol) || null
//         },
//         setMarketDepthSymbol: (symbol) => {
//           // moved to specific component, no sideeffect on store
//           // if (symbol) {
//           //   const { callAction } = connect(appState)
//           //   callAction('addMarketDepthStock', symbol)
//           // }

//           // if (!symbol) {
//           //   const stock = get().marketDepthStock

//           //   const { callAction } = connect(appState)
//           //   if (stock) {
//           //     callAction('removeMarketDepthStock', stock)
//           //   }
//           // }

//           set((state) => {
//             state.marketDepthStock = symbol
//           })
//         },

//         fetchMarketDepth: async (symbol) => {
//           set((state) => {
//             state.depthError = null
//           })

//           try {
//             const { callAction } = connect(appState)

//             const data: MarketDepth | ValidationErrorType = await callAction('fetch', {
//               room: [SOCKET_ROOMS.MARKET_DEPTH],
//               type: SocketRequestTypeConst.requestData,
//               marketDepthStocks: [symbol],
//             })

//             if (isValidationError(data)) {
//               set((state) => {
//                 state.depthError = data.error.message
//               })
//               return null
//             }

//             if (!data) {
//               set((state) => {
//                 state.depthError = 'No data found for market depth'
//               })

//               return null
//             }

//             get().setMarketDepthData(data)

//             return data
//           }
//           catch (error) {
//             const errorMsg = `Error fetching market depth for ${symbol}: ${error instanceof Error ? error.message : String(error)}`
//             set((state) => {
//               state.depthError = errorMsg
//             })

//             // op.track(EventName.EXCEPTION, {
//             //   error: error instanceof Error ? error.message : String(error),
//             //   name: 'Market Depth Fetch',
//             //   symbol,
//             // })

//             return null
//           }
//         },

//         setMarketDepthError: (error) => {
//           set((state) => {
//             state.depthError = error
//           })
//         },
//       }),

//       {
//         name: 'marketdepth-state',
//         storage: createDebouncedJSONStorage(LocalStorage, {
//           debounceTime: 1000,
//           maxRetries: 3,
//           retryDelay: 1000,
//         }),
//         partialize: state => ({
//           marketDepthStock: state.marketDepthStock,
//           marketDepthData: state.marketDepthData,
//           depthError: state.depthError,
//         }),
//         version: 1,
//       },
//     ),
//   ),
// )

// export function useMarketDepthState<T>(selector: (state: MarketDepthState) => T) {
//   return useStore(marketDepthState, selector)
// }
