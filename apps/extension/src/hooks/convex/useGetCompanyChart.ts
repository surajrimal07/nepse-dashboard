import { convexQuery } from '@convex-dev/react-query'
import { api } from '@nepse-dashboard/convex/convex/_generated/api'
import { useQuery } from '@tanstack/react-query'
import { gcTime } from './constants'

export function useGetCompanyChart(symbol: string, timeframe: '1m' | '1d') {
  return useQuery({
    ...convexQuery(api.company.getChart, {
      symbol,
      timeframe,
    }),
    gcTime,
  })
}
