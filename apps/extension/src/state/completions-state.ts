// import type { ValidationErrorType } from '@/types/error-types'
// import type { stateResult } from '@/types/misc-types'
// import type {
//   CompletionsOrders,
//   CompletionsStatus,
//   OddlotResponse,
// } from '@/types/odd-types'
// import { connect } from 'crann'
// import { create } from 'zustand'
// import { mutative } from 'zustand-mutative'
// import { appState } from '@/lib/service/app-service'
// import { EventName } from '@/types/analytics-types'
// import {
//   OddLotType,
// } from '@/types/odd-types'
// import { SocketRequestTypeConst } from '@/types/port-types'
// import { SOCKET_ROOMS } from '@/types/socket-type'
// import { OpenPanelWeb } from '@/utils/open-panel-web'

// // @ to do here, remove OpenPanelWeb sideeffects to components

// function groupCompletions(completionsData: CompletionsOrders[]) {
//   const groupedCompletions: Record<string, CompletionsOrders[]> = {}
//   for (const completion of completionsData) {
//     if (!groupedCompletions[completion.order_id]) {
//       groupedCompletions[completion.order_id] = []
//     }
//     groupedCompletions[completion.order_id].push(completion)
//   }
//   return groupedCompletions
// }

// export interface CompletionState {
//   completions: Record<string, CompletionsOrders[]>
//   isCompletionsLoading: boolean
//   isRequestCompletionsLoading: boolean
//   setMyCompletions: (completionsData: CompletionsOrders[]) => stateResult
//   fetchMyCompletions: () => Promise<stateResult>

//   requestCompletions: (id: string, message?: string) => Promise<stateResult>
//   respondCompletions: (
//     id: string,
//     completionId: string,
//     status: CompletionsStatus,
//   ) => Promise<stateResult>
// }

// export const useCompletionsState = create<CompletionState>()(
//   mutative(set => ({
//     completions: {},
//     isCompletionsLoading: false,
//     isRequestCompletionsLoading: false,
//     fetchMyCompletions: async () => {
//       set((state) => {
//         state.isCompletionsLoading = true
//       })
//       try {
//         const { callAction } = connect(appState)

//         const data: OddlotResponse | ValidationErrorType = await callAction('fetch', {
//           room: [SOCKET_ROOMS.ODD_LOT],
//           type: SocketRequestTypeConst.oddLot,
//           oddLot: {
//             type: OddLotType.GET_COMPLETION,

//           },
//         })

//         if (isValidationError(data)) {
//           return { success: false, message: data.error.message }
//         }

//         if (!data) {
//           return { success: false, message: 'Error occurred while fetching completions' }
//         }

//         if (data.message) {
//           // showNotification(data.message, data.success ? 'success' : 'error');
//         }

//         if (data.success && data.data) {
//           set((state) => {
//             state.completions = groupCompletions(data.data)
//           })
//           return { success: true, message: 'Completions data fetched successfully' }
//         }

//         return { success: false, message: 'No completions data available' }
//       }
//       catch (error) {
//         if (error instanceof Error) {
//           OpenPanelWeb.track(EventName.EXCEPTION, {
//             error: String(error),
//             name: 'Fetch My Completions',
//           })
//         }
//         return { success: false, message: 'Failed to fetch completions data' }
//       }
//       finally {
//         set((state) => {
//           state.isCompletionsLoading = false
//         })
//       }
//     },

//     setMyCompletions: (completionsData: CompletionsOrders[]) => {
//       set((state) => {
//         state.completions = groupCompletions(completionsData)
//       })
//       return { success: true, message: 'Completions data set successfully' }
//     },

//     requestCompletions: async (id: string, message?: string) => {
//       set((state) => {
//         state.isRequestCompletionsLoading = true
//       })
//       try {
//         const { callAction } = connect(appState)

//         const data: OddlotResponse | ValidationErrorType = await callAction('fetch', {
//           room: [SOCKET_ROOMS.ODD_LOT],
//           type: SocketRequestTypeConst.oddLot,
//           oddLot: {
//             type: OddLotType.REQUEST_COMPLETION,
//             data: {
//               id,
//               message,
//             },
//           },
//         })

//         if (isValidationError(data)) {
//           return { success: false, message: data.error.message }
//         }

//         if (!data) {
//           return { success: false, message: 'Error occurred while requesting completions' }
//         }

//         if (data.message) {
//           return { success: data.success ?? false, message: data.message }
//         }

//         return { success: true, message: 'Completions requested successfully' }
//       }
//       catch (error) {
//         if (error instanceof Error) {
//           OpenPanelWeb.track(EventName.EXCEPTION, {
//             error: String(error),
//             name: 'Request Completions',
//           })

//           return { success: false, message: error.message }
//         }
//         return { success: false, message: 'Failed to request completions' }
//       }
//       finally {
//         set((state) => {
//           state.isRequestCompletionsLoading = false
//         })
//       }
//     },

//     respondCompletions: async (
//       order_id: string,
//       completion_id: string,
//       status: CompletionsStatus,
//     ) => {
//       try {
//         const { callAction } = connect(appState)

//         const data: OddlotResponse | ValidationErrorType = await callAction('fetch', {
//           room: [SOCKET_ROOMS.ODD_LOT],
//           type: SocketRequestTypeConst.oddLot,
//           oddLot: {
//             type: OddLotType.UPDATE_COMPLETION_STATUS,
//             data: {
//               order_id,
//               completion_id,
//               status,
//             },
//           },
//         })

//         if (!data) {
//           return { success: false, message: 'Error occurred while responding to completions' }
//         }

//         if (isValidationError(data)) {
//           return { success: false, message: data.error.message }
//         }

//         if (data.message) {
//           return { success: data.success ?? false, message: data.message }
//         }

//         return { success: true, message: 'Completions response sent successfully' }
//       }
//       catch (error) {
//         if (error instanceof Error) {
//           OpenPanelWeb.track(EventName.EXCEPTION, {
//             error: String(error),
//             name: 'Respond Completions',
//           })

//           return { success: false, message: error.message }
//         }
//         return { success: false, message: 'Failed to respond to completions' }
//       }
//     },
//   })),
// )
