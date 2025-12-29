import z from "@nepse-dashboard/zod";

export const MarketDepthItemSchema = z.object({
	stockId: z.number(),
	orderBookOrderPrice: z.number(),
	quantity: z.number(),
	orderCount: z.number(),
	isBuy: z.union([z.literal(1), z.literal(2)]),
	buy: z.boolean(),
	sell: z.boolean(),
});
export type MarketDepthItem = z.infer<typeof MarketDepthItemSchema>;

export const MarketDepthSideSchema = z.object({
	buyMarketDepthList: z.array(MarketDepthItemSchema),
	sellMarketDepthList: z.array(MarketDepthItemSchema),
});
export type MarketDepthSide = z.infer<typeof MarketDepthSideSchema>;

export const MarketDepth = z.object({
	symbol: z.string(),
	totalBuyQty: z.number(),
	marketDepth: MarketDepthSideSchema,
	totalSellQty: z.number(),
	timeStamp: z.number(),
});
export type MarketDepth = z.infer<typeof MarketDepth>;

export const MarketClosedErrorSchema = z.object({
	error: z.string(),
});

export type MarketClosedError = z.infer<typeof MarketClosedErrorSchema>;
