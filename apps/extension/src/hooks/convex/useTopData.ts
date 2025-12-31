import { convexQuery } from '@convex-dev/react-query'
import { api } from '@nepse-dashboard/convex/convex/_generated/api'
import { useQuery } from '@tanstack/react-query'
import { gcTime } from './constants'

export function useTopData() {
  return useQuery({
    ...convexQuery(api.dashboard.get, {}),
    gcTime,
  })
}

export function useAllTopData() {
  return useQuery({
    ...convexQuery(api.dashboard.getAll, {}),
    gcTime,
  })
}
