// import type { MarketDepthState } from '@/state/market-depth-state'
// import type { ValidationErrorType } from '@/types/error-types'
// import type { MarketDepth } from '@/types/market-depth-types'

// export function selectMarketDepthStock(state: MarketDepthState): string | null {
//   return state.marketDepthStock
// }
// export function selectSetMarketDepthSymbol(state: MarketDepthState): ((symbol: string | null) => void) {
//   return state.setMarketDepthSymbol
// }

// export function selectMarketDepthData(state: MarketDepthState): Record<string, MarketDepth> | null {
//   return state.marketDepthData
// }
// export function selectSetMarketDepthData(state: MarketDepthState): ((data: MarketDepth) => void) {
//   return state.setMarketDepthData
// }
// export function selectGetMarketDepthData(state: MarketDepthState): ((symbol: string) => Promise<MarketDepth | null>) {
//   return state.getMarketDepthData
// }

// export function selectFetchMarketDepth(state: MarketDepthState): ((symbol: string) => Promise<MarketDepth | null>) {
//   return state.fetchMarketDepth
// }

// export function selectDepthError(state: MarketDepthState): ValidationErrorType | string | null {
//   return state.depthError
// }

// export function selectSetMarketDepthError(state: MarketDepthState): ((error: string) => void) | undefined {
//   return state.setMarketDepthError
// }
