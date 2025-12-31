import { convexQuery } from '@convex-dev/react-query'
import { api } from '@nepse-dashboard/convex/convex/_generated/api'
import { useQuery } from '@tanstack/react-query'
import { gcTime } from './constants'

export function useIndexStatus() {
  return useQuery({
    ...convexQuery(api.marketStatus.get, {}),
    gcTime,
  })
}

export function useIsMarketOpen() {
  const query = useQuery({
    ...convexQuery(api.marketStatus.isOpen, {}),
    gcTime,
  })
  return query.data
}
