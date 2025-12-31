import type { ComponentType } from 'react'
import z from '@nepse-dashboard/zod'
import { indexKeySchema } from './indexes-type'
import { PlaybackSpeedSchema } from './replay-types'
import { TopTabTypeSchema } from './top-types'

export interface SidepanelTabItem {
  key: string
  icon: ComponentType<{ className?: string }>
  label: string
  size: 'h-4 w-4'
}

export const SidepanelTabs = {
  HOME: 'home',
  DASHBOARD: 'dashboard',
} as const

export type SidepanelTab = (typeof SidepanelTabs)[keyof typeof SidepanelTabs]

export const widgetType = {
  CHART: 'chart',
  TOP: 'top',
  MARKETINDEXES: 'marketindexes',
  STOCK: 'stock',
  DEPTH: 'depth',
  ORDERS: 'orders',
  SUMMARY: 'summary',
} as const

export const widgetTypeEnum = z.enum([
  widgetType.CHART,
  widgetType.TOP,
  widgetType.MARKETINDEXES,
  widgetType.STOCK,
  widgetType.DEPTH,
  widgetType.ORDERS,
  widgetType.SUMMARY,
])

export type WidgetType = z.infer<typeof widgetTypeEnum>

const BaseWidgetSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: widgetTypeEnum,
})

const OptionalWidgetFields = z
  .object({
    index: indexKeySchema,
    topvalue: TopTabTypeSchema,
    symbol: z.string(),
    depthSymbol: z.string(),
    isDaily: z.boolean(),
    isReplayMode: z.boolean(),
    replayPlaybackSpeed: PlaybackSpeedSchema,
  })
  .partial()

export const WidgetSchema = z.object({
  ...BaseWidgetSchema.shape,
  ...OptionalWidgetFields.shape,
})
export type Widget = z.infer<typeof WidgetSchema>

export const WIDGET_HEIGHTS = {
  [widgetType.CHART]: 'h-[250px]',
  [widgetType.TOP]: 'h-[548px]',
  [widgetType.DEPTH]: 'h-[540px]',
  [widgetType.ORDERS]: 'h-[515px]',
  [widgetType.MARKETINDEXES]: 'h-[505px]',
  [widgetType.STOCK]: 'h-[250px]',
  [widgetType.SUMMARY]: 'h-[280px]',
} as const


export type timeType = {
  enabled: boolean,
  type: "currentTime" | "countdown"
}