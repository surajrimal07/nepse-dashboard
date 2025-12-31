import z from '@nepse-dashboard/zod'

export const marketDepthParams = z.object({
  symbol: z.string().optional(),
  sidepanel: z.boolean().optional(),
  widgetId: z.string().optional(),
})
