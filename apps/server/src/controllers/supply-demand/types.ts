import z from '@nepse-dashboard/zod';

export interface SupplyDemand {
  symbol: string;
  totalOrder: number;
  totalQuantity: number;
  quantityPerOrder?: number;
  orderSide?: string;
  securityId?: string;
}

export interface HighestOrderWithSupplyDemandData extends SupplyDemand {
  totalBuyOrder?: number;
  totalBuyQuantity?: number;
  totalSellOrder?: number;
  totalSellQuantity?: number;
  buyQuantityPerOrder?: number;
  sellQuantityPerOrder?: number;
  buyToSellOrderRatio?: number;
  buyToSellQuantityRatio?: number;
}

export interface SupplyDemandData {
  supplyList: SupplyDemand[];
  demandList: SupplyDemand[];
}

export const HighestOrderWithSupplyDemandDataSchema = z.object({
  symbol: z.string(),
  totalBuyOrder: z.number().optional(),
  totalBuyQuantity: z.number().optional(),
  totalSellOrder: z.number().optional(),
  totalSellQuantity: z.number().optional(),
  buyQuantityPerOrder: z.number().optional(),
  sellQuantityPerOrder: z.number().optional(),
  buyToSellOrderRatio: z.number().optional(),
  buyToSellQuantityRatio: z.number().optional(),
});

export const SupplyDemandSchema = z.object({
  symbol: z.string(),
  totalOrder: z.number(),
  totalQuantity: z.number(),
  quantityPerOrder: z.number().optional(),
  orderSide: z.string().optional(),
});

export const SupplyDemandResponseSchema = z.object({
  highestQuantityperOrder: z.array(HighestOrderWithSupplyDemandDataSchema),
  highestSupply: z.array(SupplyDemandSchema),
  highestDemand: z.array(SupplyDemandSchema),
  version: z.string(),
  time: z.string(), // ISO date string
  date: z.string(), // ISO date string
});

export type SupplyDemandResponse = z.infer<typeof SupplyDemandResponseSchema>;
