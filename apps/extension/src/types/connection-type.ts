import z from '@nepse-dashboard/zod'

export const ConnectionState = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  INACTIVE: 'inactive',
  DISABLED: 'disabled',
  HIGH_LATENCY: 'high_latency',
  MEDIUM_LATENCY: 'medium_latency',
  NO_CONNECTION: 'no_connection',
} as const

export const ConnectionStateSchema = z.enum([
  ConnectionState.CONNECTED,
  ConnectionState.DISCONNECTED,
  ConnectionState.INACTIVE,
  ConnectionState.DISABLED,
  ConnectionState.HIGH_LATENCY,
  ConnectionState.MEDIUM_LATENCY,
  ConnectionState.NO_CONNECTION,
])

export type ConnectionState = z.infer<typeof ConnectionStateSchema>

export const ConnectionStatus = z.object({
  isConnected: ConnectionStateSchema,
  message: z.string().optional(),
  bothWayLatency: z.number(),
  oneWayLatency: z.number(),
})

export type ConnectionStatus = z.infer<typeof ConnectionStatus>
