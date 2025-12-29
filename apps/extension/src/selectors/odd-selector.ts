// import type { OddState } from '@/state/odd-state'
// import type { stateResult } from '@/types/misc-types'
// import type { Oddlot } from '@/types/odd-types'

// export const selectOddLot = (state: OddState): Oddlot[] => state.oddLot
// export function selectGetAllOddlot(state: OddState): ((limit?: number) => Promise<stateResult>) {
//   return state.getAllOddlot
// }
// export const selectIsOddlotLoading = (state: OddState): boolean => state.isOddlotLoading

// export const selectMyOddLot = (state: OddState): Oddlot[] => state.myOddLot
// export const selectGetMyOddlot = (state: OddState): (() => void) => state.getMyOddlot
// export const selectIsMyOddlotLoading = (state: OddState): boolean => state.isMyOddlotLoading
// export const selectAddMyOddlot = (state: OddState): ((oddlot: Oddlot) => void) => state.addMyOddlot

// export const selectUpdateOddlot = (state: OddState): ((data: Oddlot) => void) => state.updateOddlot

// export const selectAddOddlot = (state: OddState): ((oddlot: Oddlot) => void) => state.addOddlot
// export function selectAddAllOddlot(state: OddState): ((oddlot: Oddlot[]) => void) {
//   return state.addAllOddlot
// }

// export function selectAddNewOrder(state: OddState): ((order: Omit<Oddlot, 'user_id' | 'created_at' | 'id'>) => Promise<stateResult>) {
//   return state.addNewOrder
// }
// export const selectIsAddNewOrderLoading = (state: OddState): boolean => state.isAddNewOrderLoading

// export function selectModifyOddlot(state: OddState): ((id: string, updates: Partial<Oddlot>) => stateResult) {
//   return state.modifyOddlot
// }
