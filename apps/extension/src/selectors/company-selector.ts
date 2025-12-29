// import type { CompanyState } from '@/state/company-state'
// import type {
//   CompanyChart,
//   CompanyData,
//   StockDailyChartWithData,
//   StockIntradayChart,
// } from '@/types/company-types'
// import type { stateResult } from '@/types/misc-types'

// export const selectCompaniesData = (state: CompanyState): CompanyData | null => state.companiesData
// export function selectCompanyChartData(state: CompanyState): Record<string, CompanyChart> | null {
//   return state.companyChartData
// }

// export const selectIsCompaniesLoading = (state: CompanyState): boolean => state.isCompaniesLoading
// export function selectIsStockChartLoading(state: CompanyState): boolean {
//   return state.isStockChartLoading
// }
// export function selectIsStockChartDailyLoading(state: CompanyState): boolean {
//   return state.isStockChartDailyLoading
// }
// export function selectIsStockDetailsLoading(state: CompanyState): boolean {
//   return state.isStockDetailsLoading
// }

// export function selectSetCompaniesLoading(state: CompanyState): ((loading: boolean) => void) {
//   return state.setCompaniesLoading
// }
// export function selectSetStockChartLoading(state: CompanyState): ((loading: boolean) => void) {
//   return state.setStockChartLoading
// }

// export function selectUpdateCompaniesData(state: CompanyState): ((data: CompanyData) => void) {
//   return state.updateCompaniesData
// }
// export function selectUpdateCompanyChartData(state: CompanyState): ((data: StockIntradayChart) => void) {
//   return state.updateCompanyChartData
// }
// export function selectUpdateCompanyDailyChartData(state: CompanyState): ((data: StockDailyChartWithData) => void) {
//   return state.updateCompanyDailyChartData
// }

// export function selectFetchCompanies(state: CompanyState): ((refresh?: boolean) => Promise<stateResult>) {
//   return state.fetchCompanies
// }
// export function selectFetchCompanyChartData(state: CompanyState): ((symbol: string, refresh?: boolean) => Promise<stateResult>) {
//   return state.fetchCompanyChartData
// }
// export function selectFetchCompanyDailyChart(state: CompanyState): ((symbol: string, refresh?: boolean) => Promise<stateResult>) {
//   return state.fetchCompanyDailyChart
// }
// export function selectFetchCompanyDetails(state: CompanyState): ((symbol: string) => Promise<stateResult>) {
//   return state.fetchCompanyDetails
// }
