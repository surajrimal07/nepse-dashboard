// import type { ValidationErrorType } from '@/types/error-types'
// import type { stateResult } from '@/types/misc-types'
// import type { MarketSentiment } from '@/types/sentiment-type'
// import { connect } from 'crann'
// import { createDebouncedJSONStorage } from 'zustand-debounce'
// import { mutative } from 'zustand-mutative'
// import { persist } from 'zustand/middleware'
// import { useStore } from 'zustand/react'
// import { createStore } from 'zustand/vanilla'
// import { DataName } from '@/constants/action-name'
// import { appState } from '@/lib/service/app-service'
// import { LocalStorage } from '@/state/local-storage'
// import { SocketRequestTypeConst } from '@/types/port-types'
// import { CUSTOM_EVENTS } from '@/types/socket-type'
// import formatUserMessage from '@/utils/no-data'

// export interface SentimentState {
//   sentimentData: MarketSentiment | null
//   isSentimentDataLoading: boolean
//   fetchSentimentData: () => Promise<stateResult>
//   setSentimentData: (data: MarketSentiment) => stateResult
// }

// export const sentimentState = createStore<SentimentState>()(
//   mutative(
//     persist(
//       (set, get) => ({
//         sentimentData: null,
//         isSentimentDataLoading: false,
//         fetchSentimentData: async () => {
//           set((state) => {
//             state.isSentimentDataLoading = true
//           })

//           try {
//             const { callAction } = connect(appState)

//             const data: MarketSentiment | ValidationErrorType = await callAction('fetch', {
//               room: [CUSTOM_EVENTS.SENTIMENT],
//               type: SocketRequestTypeConst.requestData,
//             })

//             if (isValidationError(data)) {
//               return {
//                 success: false,
//                 message: formatUserMessage(DataName.SENTIMENT, 'validationError', data.error.message),
//               }
//             }

//             if (!data) {
//               return {
//                 success: false,
//                 message: formatUserMessage(DataName.SENTIMENT, 'notAvailable'),
//               }
//             }

//             return get().setSentimentData(data)
//           }
//           catch (error) {
//             const errorMessage = error instanceof Error ? error.message : String(error)
//             return {
//               success: false,
//               message: formatUserMessage(DataName.SENTIMENT, 'catch', errorMessage),
//             }
//           }
//           finally {
//             set((state) => {
//               state.isSentimentDataLoading = false
//             })
//           }
//         },
//         setSentimentData: (data) => {
//           const currentSentimentData = get().sentimentData

//           if (!currentSentimentData || data.version !== currentSentimentData.version) {
//             set((state) => {
//               state.sentimentData = data
//             })
//             return {
//               success: true,
//               message: formatUserMessage(DataName.SENTIMENT, 'success'),
//             }
//           }
//           return {
//             success: false,
//             message: formatUserMessage(DataName.SENTIMENT, 'notAvailable'),
//           }
//         },
//       }),

//       {
//         name: 'sentiment-state',
//         storage: createDebouncedJSONStorage(LocalStorage, {
//           debounceTime: 1000,
//           maxRetries: 3,
//           retryDelay: 1000,
//         }),
//         version: 1,
//         partialize: state => ({
//           sentimentData: state.sentimentData,
//         }),
//       },
//     ),
//   ),
// )

// export function useSentimentState<T>(selector: (state: SentimentState) => T) {
//   return useStore(sentimentState, selector)
// }
