import { convexQuery } from '@convex-dev/react-query'
import { api } from '@nepse-dashboard/convex/convex/_generated/api'
import { useQuery } from '@tanstack/react-query'
import { gcTime } from './constants'

export function getIPO() {
  return useQuery({
    ...convexQuery(api.ipo.getIPOs, {}),
    gcTime,
    staleTime: 5 * 60 * 1000, // 5 minutes - IPO data doesn't change frequently
  })
}
