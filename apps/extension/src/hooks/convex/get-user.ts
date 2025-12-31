import { convexQuery } from '@convex-dev/react-query'
import { api } from '@nepse-dashboard/convex/convex/_generated/api'
import { useQuery } from '@tanstack/react-query'
import { useAction } from 'convex/react'
import { gcTime } from './constants'

export function getUser(randomId: string) {
  return useQuery({
    ...convexQuery(api.users.getUserByRand, { randomId }),
    gcTime,
  })
}

export function sendVerificationEmail(randomId: string, email: string) {
  return useAction(api.emails.sendEmailVerification)({ to: email, randomId })
}

export function isUserAuthorized(randomId: string, email: string) {
  return useQuery({
    ...convexQuery(api.users.isUserAuthorized, { randomId, email }),
    gcTime,
  })
}
