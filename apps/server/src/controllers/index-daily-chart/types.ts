import z from "@nepse-dashboard/zod";
import { indexKeySchema } from "@/types/indexes";

export const timeframes = z.enum(["1m", "1d"]);

export type Timeframe = z.infer<typeof timeframes>;

export const IndexHistoricalDataResponseSchema = z.object({
	index: indexKeySchema,
	data: z.array(z.tuple([z.number(), z.number()])),
	version: z.string(),
	timeframe: timeframes,
});

export type IndexHistoricalDataResponseType = z.infer<
	typeof IndexHistoricalDataResponseSchema
>;

export const IndexDailyPriceSchema = z.object({
	id: z.number(),
	businessDate: z.string(),
	exchangeIndexId: z.number(),
	closingIndex: z.number(),
	openIndex: z.number(),
	highIndex: z.number(),
	lowIndex: z.number(),
	fiftyTwoWeekHigh: z.number(),
	fiftyTwoWeekLow: z.number(),
	turnoverValue: z.number(),
	turnoverVolume: z.number(),
	totalTransaction: z.number(),
	absChange: z.number(),
	percentageChange: z.number(),
});

export const IndexHistoricalDataArraySchema = z.array(IndexDailyPriceSchema).min(1);
