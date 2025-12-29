export interface PortfolioItem {
  id: string
  stock: string
  ticker: string
  unit: number
  wacc: number
  ltp: number
  dailyGain: {
    value: number
    percentage: number
  }
  overallGain: {
    value: number
    percentage: number
  }
}

export type SortField = 'stock' | 'unit' | 'wacc' | 'ltp' | 'dailyGain' | 'overallGain'
export type SortDirection = 'asc' | 'desc'

export interface SortState {
  field: SortField
  direction: SortDirection
}
