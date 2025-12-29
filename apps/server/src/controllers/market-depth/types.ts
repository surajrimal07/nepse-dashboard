import z from "@nepse-dashboard/zod";

export const marketDepthItemSchema = z.object({
	stockId: z.number(),
	orderBookOrderPrice: z.number(),
	quantity: z.number(),
	orderCount: z.number(),
	isBuy: z.union([z.literal(1), z.literal(2)]),
	buy: z.boolean(),
	sell: z.boolean(),
});

export const marketDepthSchema = z.object({
	buyMarketDepthList: z.array(marketDepthItemSchema),
	sellMarketDepthList: z.array(marketDepthItemSchema),
});

export const marketDepthResponse = z.object({
	symbol: z.string().toUpperCase(),
	totalBuyQty: z.number(),
	marketDepth: marketDepthSchema,
	totalSellQty: z.number(),
	timeStamp: z.number().default(() => Date.now()),
	version: z.string(),
});

export type MarketDepthResponse = z.infer<typeof marketDepthResponse>;
