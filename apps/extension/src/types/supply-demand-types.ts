import z from '@nepse-dashboard/zod'

export const SDOrderDataSchema = z.object({
  symbol: z.string(),
  totalBuyOrder: z.number(),
  totalBuyQuantity: z.number(),
  totalSellOrder: z.number(),
  totalSellQuantity: z.number(),
  buyQuantityPerOrder: z.number().optional(),
  sellQuantityPerOrder: z.number().optional(),
  buyToSellOrderRatio: z.number(),
  buyToSellQuantityRatio: z.number(),
})
export type SDOrderData = z.infer<typeof SDOrderDataSchema>

export const SupplyDemandDataSchema = z.object({
  totalQuantity: z.number(),
  totalOrder: z.number(),
  symbol: z.string(),
  quantityPerOrder: z.number(),
  orderSide: z.enum(['Supply', 'Demand']),
})
export type SupplyDemandData = z.infer<typeof SupplyDemandDataSchema>

export const SupplyDemandSchema = z.object({
  highestQuantityperOrder: z.array(SDOrderDataSchema),
  highestSupply: z.array(SupplyDemandDataSchema),
  highestDemand: z.array(SupplyDemandDataSchema),
  version: z.number(),
  timeStamp: z.number(),
})
export type SupplyDemand = z.infer<typeof SupplyDemandSchema>
