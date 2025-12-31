import { convexQuery } from '@convex-dev/react-query'
import { api } from '@nepse-dashboard/convex/convex/_generated/api'
import { useQuery } from '@tanstack/react-query'
import { gcTime } from './constants'

export function getBrokers() {
  return useQuery({
    ...convexQuery(api.brokers.getBrokers, {}),
    gcTime,
  })
}

export function getBrokersById(id: number) {
  return useQuery({
    ...convexQuery(api.brokers.getBrokerById, {
      id,
    }),
    gcTime,
  })
}
