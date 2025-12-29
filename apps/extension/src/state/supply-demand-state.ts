// import type { ValidationErrorType } from '@/types/error-types'
// import type { stateResult } from '@/types/misc-types'
// import type { SupplyDemand } from '@/types/supply-demand-types'
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

// export interface SupplyDemandState {
//   supplyDemand: SupplyDemand | null
//   isSupplyDemandLoading: boolean
//   supplyDemandError: string | null
//   fetchSupplyDemand: () => Promise<stateResult>
//   setSupplyDemand: (data: SupplyDemand) => stateResult
//   setSupplyDemandError: (error: string) => void
// }

// export const supplyDemandState = createStore<SupplyDemandState>()(
//   mutative(
//     persist(
//       (set, get) => ({
//         supplyDemand: null,
//         isSupplyDemandLoading: false,
//         supplyDemandError: null,

//         setSupplyDemand: (data: SupplyDemand) => {
//           const currentSupplyDemand = get().supplyDemand as SupplyDemand | null

//           if (currentSupplyDemand && currentSupplyDemand?.version === data.version) {
//             return {
//               success: false,
//               message: formatUserMessage(DataName.SUPPLY_DEMAND, 'notAvailable'),
//             }
//           }

//           set((state) => {
//             state.supplyDemand = data
//             state.supplyDemandError = null
//           })
//           return {
//             success: true,
//             message: formatUserMessage(DataName.SUPPLY_DEMAND, 'success'),
//           }
//         },

//         fetchSupplyDemand: async () => {
//           set((state) => {
//             state.isSupplyDemandLoading = true
//           })
//           try {
//             const { callAction } = connect(appState)

//             const data: SupplyDemand | ValidationErrorType = await callAction('fetch', {
//               room: [CUSTOM_EVENTS.REQUEST],
//               type: SocketRequestTypeConst.requestData,
//             })

//             if (isValidationError(data)) {
//               const errorMsg = formatUserMessage(DataName.SUPPLY_DEMAND, 'validationError', data.error.message)
//               set((state) => {
//                 state.supplyDemandError = errorMsg
//               })
//               return {
//                 success: false,
//                 message: errorMsg,
//               }
//             }

//             if (!data) {
//               const errorMsg = formatUserMessage(DataName.SUPPLY_DEMAND, 'error')
//               set((state) => {
//                 state.supplyDemandError = errorMsg
//               })
//               return {
//                 success: false,
//                 message: errorMsg,
//               }
//             }

//             return get().setSupplyDemand(data)
//           }
//           catch (error) {
//             const errorMsg = error instanceof Error ? error.message : 'An error occurred while fetching supply demand data'
//             return {
//               success: false,
//               message: formatUserMessage(DataName.SUPPLY_DEMAND, 'catch', errorMsg),
//             }
//           }
//           finally {
//             set((state) => {
//               state.isSupplyDemandLoading = false
//             })
//           }
//         },

//         setSupplyDemandError: (error: string | null) => {
//           set((state) => {
//             state.supplyDemandError = error
//           })
//         },
//       }),

//       {
//         name: 'supplydemand-state',
//         storage: createDebouncedJSONStorage(LocalStorage, {
//           debounceTime: 1000,
//           maxRetries: 3,
//           retryDelay: 1000,
//         }),
//         partialize: state => ({
//           supplyDemand: state.supplyDemand,
//         }),
//         version: 1,
//       },
//     ),
//   ),
// )

// export function useSupplyDemandState<T>(selector: (state: SupplyDemandState) => T) {
//   return useStore(supplyDemandState, selector)
// }
