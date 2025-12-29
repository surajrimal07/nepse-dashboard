import z from "@nepse-dashboard/zod";
import { indexKeySchema } from "@/types/indexes";
import { timeframes } from "../index-daily-chart/types";

export const IntradayIndexSchema = z
	.array(z.tuple([z.number(), z.number()]))
	.min(1);

export const IntradayChartResponseSchema = z.object({
	index: indexKeySchema,
	version: z.string(),
	data: IntradayIndexSchema,
	timeframe: timeframes,
});

export type IntradayIndexData = z.infer<typeof IntradayIndexSchema>;
export type IndexIntradayChartResponseType = z.infer<
	typeof IntradayChartResponseSchema
>;

export const IndexIntradayData = z.object({
	time: z.string(),
	totalTradedShared: z.number(),
	totalTransactions: z.number(),
	totalScripsTraded: z.number(),
	totalCapitalization: z.string().optional().default("0"),
	fiftyTwoWeekHigh: z.number(),
	fiftyTwoWeekLow: z.number(),
	version: z.string(),
});

export type IndexIntradayData = z.infer<typeof IndexIntradayData>;
