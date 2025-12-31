import { convexQuery } from '@convex-dev/react-query'
import { api } from '@nepse-dashboard/convex/convex/_generated/api'
import { useQuery } from '@tanstack/react-query'
import { gcTime } from './constants'

export function getSentiment() {
  return useQuery({
    ...convexQuery(api.nepsePredictions.get, {}),
    gcTime,
  })
}
