// import type { ValidationErrorType } from '@/types/error-types'

// import type { stateResult } from '@/types/misc-types'
// import type { Oddlot, OddlotResponse } from '@/types/odd-types'
// import { connect } from 'crann'
// import { mutative } from 'zustand-mutative'
// import { useStore } from 'zustand/react'
// import { createStore } from 'zustand/vanilla'
// import { appState } from '@/lib/service/app-service'
// import { EventName } from '@/types/analytics-types'
// import { OddLotType } from '@/types/odd-types'
// import { SocketRequestTypeConst } from '@/types/port-types'
// import { SOCKET_ROOMS } from '@/types/socket-type'
// import { OpenPanelWeb } from '@/utils/open-panel-web'

// // todo remove all sideeffects like op from here to UI components

// export interface OddState {
//   oddLot: Oddlot[]
//   isOddlotLoading: boolean
//   isAddNewOrderLoading: boolean
//   isMyOddlotLoading: boolean
//   isModifyOddlotLoading: boolean
//   myOddLot: Oddlot[]

//   // oddLot: Oddlot[];
//   getAllOddlot: (limit?: number) => Promise<stateResult>
//   // isOddlotLoading: boolean;

//   // myOddLot: Oddlot[];
//   getMyOddlot: () => void
//   // isMyOddlotLoading: boolean;
//   addMyOddlot: (oddlot: Oddlot | Oddlot[] | null) => void

//   updateOddlot: (data: Oddlot) => void

//   // setter
//   addOddlot: (oddlot: Oddlot) => void
//   addAllOddlot: (oddlot: Oddlot[]) => void

//   // fetchers
//   addNewOrder: (order: Omit<Oddlot, 'user_id' | 'created_at' | 'id'>) => Promise<stateResult>
//   // isAddNewOrderLoading: boolean;

//   modifyOddlot: (order_id: string, updates: Partial<Oddlot>) => stateResult
//   // isModifyOddlotLoading: boolean;
//   // modifyStates: (orderId: string, status: OddLotOrderStatus) => void;

//   showNotification: (message: string) => void
// }

// export const oddLotState = createStore<OddState>()(
//   mutative(set => ({
//     oddLot: [],
//     myOddLot: [],
//     isOddlotLoading: false,
//     isAddNewOrderLoading: false,
//     isMyOddlotLoading: false,
//     isModifyOddlotLoading: false,

//     showNotification: (message: string) => {
//       // showNotification(message, 'info');
//       // show global notification here
//     },

//     updateOddlot: (data: Oddlot) => {
//       set((state) => {
//         const id = data.id
//         const order = state.oddLot.find(o => o.id === id)
//         const myOrder = state.myOddLot.find(o => o.id === id)
//         if (order) {
//           Object.assign(order, data)
//         }
//         if (myOrder) {
//           Object.assign(myOrder, data)
//         }
//       })
//     },
//     addNewOrder: async (order: Omit<Oddlot, 'user_id' | 'created_at' | 'id'>) => {
//       set((state) => {
//         state.isAddNewOrderLoading = true
//       })

//       try {
//         const { callAction } = connect(appState)

//         const data: OddlotResponse | ValidationErrorType = await callAction('fetch', {
//           room: [SOCKET_ROOMS.ODD_LOT],
//           type: SocketRequestTypeConst.oddLot,
//           oddLot: {
//             type: OddLotType.ADD,
//             data: order,
//           },
//         })

//         if (isValidationError(data)) {
//           return { success: false, message: data.error.message }
//         }

//         if (data.message) {
//           return { success: data.success ?? false, message: data.message }
//         }

//         if (data.success && data.data) {
//           set((state) => {
//             state.myOddLot.unshift(data.data)
//           })
//           return { success: true, message: 'New oddlot order added successfully' }
//         }

//         return { success: false, message: 'Failed to add new oddlot order' }
//       }
//       catch (error) {
//         if (error instanceof Error) {
//           OpenPanelWeb.track(EventName.EXCEPTION, {
//             error: error.message,
//             name: 'Add New Oddlot Order',
//           })

//           return { success: false, message: error.message }
//         }
//         return { success: false, message: 'Failed to add new oddlot order' }
//       }
//       finally {
//         set((state) => {
//           state.isAddNewOrderLoading = false
//         })
//       }
//     },

//     getAllOddlot: async (limit: number = 100) => {
//       set((state) => {
//         state.isOddlotLoading = true
//       })

//       try {
//         const { callAction } = connect(appState)

//         const data: OddlotResponse | ValidationErrorType = await callAction('fetch', {
//           room: [SOCKET_ROOMS.ODD_LOT],
//           type: SocketRequestTypeConst.oddLot,
//           oddLot: {
//             type: OddLotType.ALL,
//             data: {
//               limit,
//             },
//           },
//         })

//         if (isValidationError(data)) {
//           return { success: false, message: data.error.message }
//         }

//         if (data.message) {
//           return { success: data.success ?? false, message: data.message }
//         }

//         if (data.success && data.data) {
//           set((state) => {
//             state.oddLot = data.data
//           })
//           return { success: true, message: 'Oddlot orders fetched successfully' }
//         }

//         return { success: false, message: 'No oddlot orders found' }
//       }
//       catch (error) {
//         if (error instanceof Error) {
//           OpenPanelWeb.track(EventName.EXCEPTION, {
//             error: error.message,
//             name: 'Get All Oddlot Order',
//           })

//           return { success: false, message: error.message }
//         }
//         return { success: false, message: 'Failed to get oddlot orders' }
//       }
//       finally {
//         set((state) => {
//           state.isOddlotLoading = false
//         })
//       }
//     },

//     modifyOddlot: (order_id: string, updates: Partial<Oddlot>) => {
//       set((state) => {
//         state.isModifyOddlotLoading = true
//       })

//       const performModify = async () => {
//         try {
//           const { callAction } = connect(appState)

//           const data: OddlotResponse | ValidationErrorType = await callAction('fetch', {
//             room: [SOCKET_ROOMS.ODD_LOT],
//             type: SocketRequestTypeConst.oddLot,
//             oddLot: {
//               type: OddLotType.MODIFY,
//               data: {
//                 order_id,
//                 updates,
//               },
//             },
//           })

//           if (isValidationError(data)) {
//             return { success: false, message: data.error.message }
//           }

//           if (data.message) {
//             return { success: data.success ?? false, message: data.message }
//           }

//           return { success: true, message: 'Oddlot order modified successfully' }
//         }
//         catch (error) {
//           if (error instanceof Error) {
//             OpenPanelWeb.track(EventName.EXCEPTION, {
//               error: error.message,
//               name: 'Modify Oddlot Order',
//             })

//             return { success: false, message: error.message }
//           }
//           return { success: false, message: 'Failed to modify oddlot order' }
//         }
//         finally {
//           set((state) => {
//             state.isModifyOddlotLoading = false
//           })
//         }
//       }

//       performModify()
//       return { success: true, message: 'Modify request initiated' }
//     },

//     addOddlot: (oddlot: Oddlot) => {
//       set((state) => {
//         state.oddLot.unshift(oddlot)
//       })
//     },

//     addAllOddlot: (oddlot: Oddlot[]) => {
//       set((state) => {
//         state.oddLot = oddlot
//       })
//     },

//     addMyOddlot: (oddlot: Oddlot | Oddlot[] | null) => {
//       if (oddlot === null) {
//         set({ myOddLot: [] })
//       }
//       else if (Array.isArray(oddlot)) {
//         set({ myOddLot: oddlot })
//       }
//       else {
//         set({ myOddLot: [oddlot] })
//       }
//     },

//     getMyOddlot: async () => {
//       try {
//         const { callAction } = connect(appState)
//         await callAction('fetch', {
//           room: [SOCKET_ROOMS.ODD_LOT],
//           type: SocketRequestTypeConst.oddLot,
//           oddLot: {
//             type: OddLotType.MY,
//           },
//         })
//       }
//       catch (error) {
//         if (error instanceof Error) {
//           OpenPanelWeb.track(EventName.EXCEPTION, {
//             error: error.message,
//             name: 'Get My Oddlot',
//           })
//         }
//       }
//     },
//   })),
// )

// export function useOddlotState<T>(selector: (state: OddState) => T) {
//   return useStore(oddLotState, selector)
// }
