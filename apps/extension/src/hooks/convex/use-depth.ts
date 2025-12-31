import { convexAction, convexQuery } from '@convex-dev/react-query'
import { api } from '@nepse-dashboard/convex/convex/_generated/api'
import { useQuery } from '@tanstack/react-query'
import { gcTime } from './constants'

export function useCompanyDepth(symbol: string) {
  return useQuery({
    ...convexQuery(api.marketDepth.get, { symbol }),
    gcTime,
  })
}

export function useFetchCompanyDepth(symbol: string) {
  return convexAction(api.marketDepth.fetchMarketDepth, { symbol })
}

//		const { depthData, fetchMarketDepth, depthError } = useCompanyDepth(currentSymbol);
