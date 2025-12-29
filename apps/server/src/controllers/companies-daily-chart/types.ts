import z from "@nepse-dashboard/zod";
import { IntradayChartSchema } from "../companies-intraday-chart/types";
import { timeframes } from "../index-daily-chart/types";

// export const StockDailyPriceResponseSchema = z.object({
// 	symbol: z.string(),
// 	data: IntradayChartSchema,
// 	version: z.string(),
// });

// export type StockDailyPriceResponseType = z.infer<
// 	typeof StockDailyPriceResponseSchema
// >;

export const StockDailyPriceSchema = z.object({
	businessDate: z.string(),
	openPrice: z.number(),
	highPrice: z.number(),
	lowPrice: z.number(),
	previousDayClosePrice: z.number(),
	fiftyTwoWeekHigh: z.number(),
	lastTradedPrice: z.number(),
	totalTradedQuantity: z.number(),
	closePrice: z.number(),
});

// Define the Zod schema for an array of StockDailyPrice
export const StockDailyPriceArraySchema = z.array(StockDailyPriceSchema).min(1);

export const StockDailyPriceResponseSchema = z.object({
	symbol: z.string(),
	data: IntradayChartSchema,
	version: z.string(),
	timeframe: timeframes,
});

export type StockDailyPriceResponseType = z.infer<
	typeof StockDailyPriceResponseSchema
>;

// Infer the TypeScript types from the Zod schemas
export type StockDailyPrice = z.infer<typeof StockDailyPriceSchema>;
export type StockDailyPriceArray = z.infer<typeof StockDailyPriceArraySchema>;
