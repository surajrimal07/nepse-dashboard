import z from '@nepse-dashboard/zod'

export const CONSUME_TYPES = {
  CONSUME_GRANTED: 'consumeGranted',
  CONSUME_UNAVAILABLE: 'consumeUnavailable',
  CONSUME_AVAILABLE: 'consumeAvailable',
  CONSUME_TIMEOUT: 'consumeTimeout',
} as const

export const ConsumeTypeSchema = z.enum([
  CONSUME_TYPES.CONSUME_GRANTED,
  CONSUME_TYPES.CONSUME_UNAVAILABLE,
  CONSUME_TYPES.CONSUME_AVAILABLE,
  CONSUME_TYPES.CONSUME_TIMEOUT,
])

export type ConsumeType = z.infer<typeof ConsumeTypeSchema>

/**
 * LiveDataFromTMS - Data extracted from TMS dashboard
 *
 * Server expects:
 * - close: number
 * - change: number
 * - percentageChange: number
 * - totalTradedShared: number
 * - turnover: string
 */
export const LiveDataFromTMSSchema = z.object({
  close: z.number(),
  change: z.number(),
  percentageChange: z.number(),
  totalTradedShared: z.number(),
  turnover: z.string(),
})

export type LiveDataFromTMS = z.infer<typeof LiveDataFromTMSSchema>
