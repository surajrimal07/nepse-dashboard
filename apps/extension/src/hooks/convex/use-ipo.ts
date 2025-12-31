import { convexQuery } from '@convex-dev/react-query'
import { api } from '@nepse-dashboard/convex/convex/_generated/api'
import { useQuery } from '@tanstack/react-query'
import { gcTime } from './constants'

export function getAllIpos() {
  return useQuery({
    ...convexQuery(api.ipo.getIPOs, {}),
    gcTime,
  })
}

export function getCurrentIssues() {
  return useQuery({
    ...convexQuery(api.ipo.getCurrentIssues, {}),
    gcTime,
  })
}
