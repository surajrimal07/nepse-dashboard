// import type {
//   CompanyChart,
//   CompanyData,
//   CompanyDetails,
//   StockDailyChartWithData,
//   StockIntradayChart,
// } from '@/types/company-types'
// import type { ValidationErrorType } from '@/types/error-types'

// import type { stateResult } from '@/types/misc-types'
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
// import { CUSTOM_EVENTS, SOCKET_ROOMS } from '@/types/socket-type'
// import formatUserMessage from '@/utils/no-data'

// export interface CompanyState {
//   companiesData: CompanyData | null
//   companyChartData: Record<string, CompanyChart> | null
//   isCompaniesLoading: boolean
//   isStockChartLoading: boolean
//   isStockChartDailyLoading: boolean
//   isStockDetailsLoading: boolean

//   // loading setters
//   setCompaniesLoading: (loading: boolean) => void
//   setStockChartLoading: (loading: boolean) => void

//   // update
//   updateCompaniesData: (data: CompanyData) => stateResult
//   updateCompanyChartData: (data: StockIntradayChart) => stateResult
//   updateCompanyDailyChartData: (data: StockDailyChartWithData) => stateResult

//   // fetcher
//   fetchCompanies: (refresh?: boolean) => Promise<stateResult>

//   fetchCompanyChartData: (symbol: string, refresh?: boolean) => Promise<stateResult>
//   fetchCompanyDailyChart: (symbol: string, refresh?: boolean) => Promise<stateResult>
//   fetchCompanyDetails: (symbol: string) => Promise<stateResult>
// }

// export const companiesState = createStore<CompanyState>()(
//   mutative(
//     persist(
//       (set, get) => ({
//         companiesData: null,
//         companyChartData: null,

//         isCompaniesLoading: false,
//         isStockChartDailyLoading: false,
//         isStockDetailsLoading: false,
//         isStockChartLoading: false,

//         setCompaniesLoading: (loading: boolean) => {
//           set((state) => {
//             state.isCompaniesLoading = loading
//           })
//         },

//         setStockChartLoading: (loading: boolean) => {
//           set((state) => {
//             state.isStockChartLoading = loading
//           })
//         },

//         updateCompaniesData: (data: CompanyData) => {
//           let result: stateResult
//           set((state) => {
//             const oldVersion = state.companiesData?.version

//             if (data.version === oldVersion) {
//               result = { success: false, message: formatUserMessage(DataName.COMPANY_LIST, 'notAvailable') }
//               return
//             }
//             state.companiesData = data
//             result = { success: true, message: formatUserMessage(DataName.COMPANY_LIST, 'success') }
//           })
//           return result!
//         },

//         updateCompanyChartData: (data: StockIntradayChart) => {
//           let result: stateResult
//           set((state) => {
//             const existing = state.companyChartData?.[data.symbol]

//             if (existing && existing.intraday?.version === data.version) {
//               result = { success: true, message: formatUserMessage(DataName.COMPANY_INTRADAY_CHART, 'notAvailable') }
//               return
//             }

//             if (!state.companyChartData)
//               state.companyChartData = {}
//             if (!state.companyChartData[data.symbol])
//               state.companyChartData[data.symbol] = {}

//             state.companyChartData[data.symbol].intraday = data
//             result = { success: true, message: formatUserMessage(DataName.COMPANY_INTRADAY_CHART, 'success') }
//           })
//           return result!
//         },

//         updateCompanyDailyChartData: (data: StockDailyChartWithData) => {
//           let result: stateResult
//           set((state) => {
//             const existing = state.companyChartData?.[data.symbol]

//             if (existing && existing.daily?.version === data.version) {
//               result = { success: true, message: formatUserMessage(DataName.COMPANY_DAILY_CHART, 'notAvailable') }
//               return
//             }

//             if (!state.companyChartData)
//               state.companyChartData = {}
//             if (!state.companyChartData[data.symbol])
//               state.companyChartData[data.symbol] = {}

//             state.companyChartData[data.symbol].daily = data
//             result = { success: true, message: formatUserMessage(DataName.COMPANY_DAILY_CHART, 'success') }
//           })
//           return result!
//         },

//         fetchCompanyChartData: async (symbol: string, refresh?: boolean) => {
//           if (refresh)
//             set({ isStockChartLoading: true })
//           try {
//             const { callAction } = connect(appState)

//             const data: StockIntradayChart | ValidationErrorType = await callAction('fetch', {
//               room: [SOCKET_ROOMS.INTRADAY_STOCK_CHART],
//               type: SocketRequestTypeConst.requestData,
//               stockCharts: [symbol],
//             })

//             if (isValidationError(data)) {
//               return { success: false, message: data.error.message }
//             }

//             if (!data) {
//               return { success: false, message: formatUserMessage(DataName.COMPANY_INTRADAY_CHART, 'notAvailable') }
//             }
//             return get().updateCompanyChartData(data)
//           }
//           catch (error) {
//             const errorMessage = error instanceof Error ? error.message : String(error)

//             return { success: false, message: formatUserMessage(DataName.COMPANY_INTRADAY_CHART, 'catch', errorMessage) }
//           }
//           finally {
//             if (refresh)
//               set({ isStockChartLoading: false })
//           }
//         },

//         fetchCompanyDailyChart: async (symbol: string, refresh?: boolean) => {
//           if (refresh)
//             set({ isStockChartDailyLoading: true })
//           try {
//             const { callAction } = connect(appState)

//             const data: StockDailyChartWithData | ValidationErrorType = await callAction('fetch', {
//               type: SocketRequestTypeConst.requestData,
//               room: [SOCKET_ROOMS.DAILY_STOCK_CHART],
//               stockCharts: [symbol],
//             })

//             if (isValidationError(data)) {
//               return { success: false, message: data.error.message }
//             }

//             if (!data) {
//               return { success: false, message: formatUserMessage(DataName.COMPANY_DAILY_CHART, 'notAvailable') }
//             }

//             return get().updateCompanyDailyChartData(data)
//           }
//           catch (error) {
//             const errorMessage = error instanceof Error ? error.message : String(error)

//             return { success: false, message: formatUserMessage(DataName.COMPANY_DAILY_CHART, 'catch', errorMessage) }
//           }
//           finally {
//             if (refresh)
//               get().setStockChartLoading(false)
//           }
//         },

//         fetchCompanies: async (refresh?: boolean) => {
//           if (refresh)
//             set({ isCompaniesLoading: true })
//           try {
//             const { callAction } = connect(appState)

//             const data: CompanyData | ValidationErrorType = await callAction('fetch', {
//               room: [CUSTOM_EVENTS.ALL_COMPANIES],
//               type: SocketRequestTypeConst.requestData,
//             })

//             if (isValidationError(data)) {
//               return { success: false, message: formatUserMessage(DataName.COMPANY_LIST, 'validationError', data.error.message) }
//             }

//             if (!data) {
//               return { success: false, message: formatUserMessage(DataName.COMPANY_LIST, 'notAvailable') }
//             }

//             return get().updateCompaniesData(data)
//           }
//           catch (error) {
//             const errorMessage = error instanceof Error ? error.message : String(error)
//             return { success: false, message: formatUserMessage(DataName.COMPANY_LIST, 'catch', errorMessage) }
//           }
//           finally {
//             if (refresh)
//               get().setCompaniesLoading(false)
//           }
//         },

//         fetchCompanyDetails: async (symbol: string) => {
//           set({ isStockDetailsLoading: true })
//           try {
//             const { callAction } = connect(appState)

//             const data: CompanyDetails | ValidationErrorType = await callAction('fetch', {
//               type: SocketRequestTypeConst.requestData,
//               stockInfo: symbol,
//             })

//             if (isValidationError(data)) {
//               return { success: false, message: data.error.message }
//             }

//             if (!data) {
//               return { success: false, message: formatUserMessage(DataName.COMPANY_DETAILS, 'notAvailable') }
//             }

//             return {
//               success: true,
//               message: formatUserMessage(DataName.COMPANY_DETAILS, 'success'),
//               data: data as CompanyDetails,
//             }
//           }
//           catch (error) {
//             const errorMessage = error instanceof Error ? error.message : String(error)

//             return { success: false, message: formatUserMessage(DataName.COMPANY_DETAILS, 'catch', errorMessage) }
//           }
//           finally {
//             set((state) => {
//               state.isStockDetailsLoading = false
//             })
//           }
//         },
//       }),

//       {
//         name: 'companies-state',
//         storage: createDebouncedJSONStorage(LocalStorage, {
//           debounceTime: 1000,
//           maxRetries: 3,
//           retryDelay: 1000,
//         }),
//         partialize: state => ({
//           companiesData: state.companiesData,
//           companyChartData: state.companyChartData,
//         }),
//         version: 1,
//       },
//     ),
//   ),
// )

// export function useCompaniesState<T>(selector: (state: CompanyState) => T) {
//   return useStore(companiesState, selector)
// }
