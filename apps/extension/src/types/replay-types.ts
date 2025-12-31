import z from '@nepse-dashboard/zod'

export const REPLAY_BASE_INTERVAL = 300 // ms at 1x

export const PLAYBACK_SPEEDS = [0.5, 1, 2, 4, 8] as const

export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number]

export const CHART_MARGIN = { top: 0, right: 0, left: 0, bottom: 0 }
export const TOOLTIP_CURSOR_BASE = { strokeWidth: 1 }

export const PlaybackSpeedSchema = z.union([
  z.literal(0.5),
  z.literal(1),
  z.literal(2),
  z.literal(4),
  z.literal(8),
])
