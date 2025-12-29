// import type { ValidationErrorType } from '@/types/error-types'
// import type { stateResult } from '@/types/misc-types'
// import type { DashboardData, TopTabType } from '@/types/top-types'
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
// import { SOCKET_ROOMS } from '@/types/socket-type'
// import { TopType } from '@/types/top-types'
// import formatUserMessage from '@/utils/no-data'

// export interface TopState {
//   topData: DashboardData
//   isTopDataLoading: boolean
//   setTopData: (data: DashboardData) => stateResult
//   fetchTopData: () => Promise<stateResult>
// }

// export const topState = createStore<TopState>()(
//   mutative(
//     persist(
//       (set, get) => ({
//         topData: {} as DashboardData,
//         fetchTopData: async () => {
//           set((state) => {
//             state.isTopDataLoading = true
//           })
//           try {
//             const { callAction } = connect(appState)

//             const data: DashboardData | ValidationErrorType = await callAction('fetch', {
//               room: [SOCKET_ROOMS.DASHBOARD],
//               type: SocketRequestTypeConst.requestData,
//             })

//             if (isValidationError(data)) {
//               return { success: false, message: formatUserMessage(DataName.TOP_DASHBOARD, 'validationError', data.error.message) }
//             }

//             if (!data) {
//               return { success: false, message: formatUserMessage(DataName.TOP_DASHBOARD, 'notAvailable') }
//             }

//             return get().setTopData(data)
//           }
//           catch (error) {
//             const message = error instanceof Error ? error.message : String(error)

//             return {
//               success: false,
//               message,
//             }
//           }
//           finally {
//             set((state) => {
//               state.isTopDataLoading = false
//             })
//           }
//         },
//         setTopData: (incomingData) => {
//           const currentData = get().topData
//           const fieldsToUpdate: TopTabType[] = []

//           for (const field of TopType) {
//             if (!currentData[field] || currentData[field].version !== incomingData[field].version) {
//               fieldsToUpdate.push(field)
//             }
//           }

//           if (fieldsToUpdate.length === 0) {
//             return { success: false, message: formatUserMessage(DataName.TOP_DASHBOARD, 'notAvailable') }
//           }

//           set((state) => {
//             for (const field of fieldsToUpdate) {
//               (state.topData as any)[field] = incomingData[field]
//             }
//           })

//           return {
//             success: true,
//             message: formatUserMessage(DataName.TOP_DASHBOARD, 'success'),
//           }
//         },

//         isTopDataLoading: false,
//       }),

//       {
//         name: 'top-state',
//         storage: createDebouncedJSONStorage(LocalStorage, {
//           debounceTime: 1000,
//           maxRetries: 3,
//           retryDelay: 1000,
//         }),
//         version: 1,
//         partialize: state => ({
//           topData: state.topData,
//         }),
//       },
//     ),
//   ),
// )
// export const useTopState = <T>(selector: (state: TopState) => T) => useStore(topState, selector)
