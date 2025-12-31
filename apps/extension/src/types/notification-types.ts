import z from '@nepse-dashboard/zod'

export const notificationTypes = {
  PRICE_ALERT: 'price_alert',
  PORTFOLIO_ALERT: 'portfolio_alert',
  CHAT: 'chat',
  AI_CHAT: 'ai_chat',
  SYSTEM: 'system',
  MARKET: 'market',
  NEWS: 'news',
  IPO: 'ipo',
  ODDLOT: 'oddlot',
  MAINTENANCE: 'maintenance',
} as const

export const NotificationCategoryEnum = z.enum([
  ...Object.values(notificationTypes),
])

export const NotificationLevelEnum = z.enum([
  'info',
  'warning',
  'error',
  'success',
])

export type NotificationVariant = 'info' | 'warning' | 'error' | 'success'

export const NotificationActionTypeEnum = z.enum([
  'open_link', // opens a link in a new tab
  'view_chart', // opens nepseAlpha chart of the symbol
  'view_portfolio', // opens the meroshare website
  'open_chat',
  'open_ai_chat',
  'apply_ipo', // opens meroshare ipo application page
  'remind_ipo', // add a cron scheduler for 24 hour reminder
  'view_market_summary',
  'open_oddlot',
  'view_news', // opens the news link in a new tab
])

export type NotificationCategory = z.infer<typeof NotificationCategoryEnum>
export type NotificationActions = z.infer<typeof NotificationActionTypeEnum>

export const ChromeNotificationTypeEnum = z.enum([
  'basic',
  'image',
  'list',
  'progress',
])

export type ChromeNotificationType = z.infer<typeof ChromeNotificationTypeEnum>

// 2. Action Button Schema
export const NotificationActionButtonSchema = z.object({
  title: z.string().min(1),
  action: NotificationActionTypeEnum,
  iconUrl: z.url().optional(),
})

export const NotificationDataSchema = z
  .object({
    stock: z.string().optional(),
    orderId: z.string().optional(),
    portfolioId: z.string().optional(),
    userId: z.string().optional(),
    link: z.url().optional(),
    progress: z.number().int().min(0).max(100).optional(),
  })
  .catchall(z.any()) // clean way to allow extra keys

// Notification Item Schema
export const NotificationItemSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
})

// 3. Main Payload Schema
export const NotificationPayloadSchema = z.object({
  id: z.uuid(), // unique identifier for the notification
  category: NotificationCategoryEnum,
  chromeType: ChromeNotificationTypeEnum, // for browser notifications
  title: z.string().min(1),
  message: z.string().min(1),
  contextMessage: z.string().optional(), // small context message for additional info
  imageUrl: z.url().optional(),
  iconUrl: z.url().optional(),
  level: NotificationLevelEnum,
  tag: z.string().optional(),
  timestamp: z.number().int().positive().optional(),
  expiresAt: z.number().int().positive().optional(),
  data: NotificationDataSchema.optional(),
  items: z.array(NotificationItemSchema).optional(),
  buttons: z.array(NotificationActionButtonSchema).optional(),
})

export type NotificationType = z.infer<typeof NotificationPayloadSchema>

// unused
export type NotificationPlace = 'injected' | 'browser' | 'inapp'
