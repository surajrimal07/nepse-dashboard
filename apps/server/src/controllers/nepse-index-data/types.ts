import z from '@nepse-dashboard/zod';
import { AdvanceDeclineSchema } from '@/types/nepse';

// const indexIntradayBaseSchema = z.object({
// 	time: z.string(),
// 	open: z.number(),
// 	high: z.number(),
// 	low: z.number(),
// 	close: z.number(),
// 	change: z.number(),
// 	previousClose: z.number(),
// 	totalTradedShared: z.number(),
// 	totalTransactions: z.number(),
// 	totalScripsTraded: z.number(),
// 	turnover: z.string(),
// 	totalCapitalization: z.string(),
// 	percentageChange: z.number(),
// 	fiftyTwoWeekHigh: z.number(),
// 	fiftyTwoWeekLow: z.number(),
// 	color: z.string().optional().nullable().default("#00ff00"),
// 	adLine: AdvanceDeclineSchema,
// });

// export const indexIntradayResponseSchema = z.object({
// 	version: z.number(),
// 	...indexIntradayBaseSchema.shape,
// });

// export type IndexIntradayResponseType = z.infer<
// 	typeof indexIntradayResponseSchema
// >;

export const NEPSEIndexAPISchema = z.object({
  close: z.number(),
  high: z.number(),
  low: z.number(),
  previousClose: z.number(),
  change: z.number(),
  perChange: z.number(),
  fiftyTwoWeekHigh: z.number(),
  fiftyTwoWeekLow: z.number(),
  currentValue: z.number(),
  generatedTime: z.string().nullable().optional(),
});

export const MarketSummarySchema = z
  .object({
    'Total Turnover Rs:': z.number(),
    'Total Traded Shares': z.number(),
    'Total Transactions': z.number(),
    'Total Scrips Traded': z.number(),
    'Total Market Capitalization Rs:': z
      .number()
      .nullable()
      .optional()
      .default(0),
    'Total Float Market Capitalization Rs:': z
      .number()
      .nullable()
      .optional()
      .default(0),
  })
  .transform((data) => ({
    turnover: data['Total Turnover Rs:'],
    totalTradedShares: data['Total Traded Shares'],
    totalTransactions: data['Total Transactions'],
    totalScripsTraded: data['Total Scrips Traded'],
    totalCapitalization: data['Total Market Capitalization Rs:'],
  }));

// const IndexIntradayInputSchema = z.object({
// 	nepseIndex: NEPSEIndexAPISchema,
// 	nepseSummary: MarketSummarySchema,
// 	advanceDeclineData: AdvanceDeclineSchema,
// });

// export const IndexIntradayData = IndexIntradayInputSchema.transform((data) => {
// 	const { nepseIndex, nepseSummary, advanceDeclineData } = data;

// 	return indexIntradayBaseSchema.parse({
// 		time: nepseIndex.generatedTime ?? new Date().toISOString(),
// 		high: nepseIndex.high,
// 		low: nepseIndex.low,
// 		close: nepseIndex.currentValue,
// 		change: nepseIndex.change,
// 		previousClose: nepseIndex.previousClose,
// 		totalTradedShared: nepseSummary.totalTradedShares,
// 		totalTransactions: nepseSummary.totalTransactions,
// 		totalScripsTraded: nepseSummary.totalScripsTraded,
// 		turnover: formatTurnover(nepseSummary.turnover),
// 		totalCapitalization: formatTurnover(nepseSummary.totalCapitalization),
// 		percentageChange: nepseIndex.perChange,
// 		fiftyTwoWeekHigh: nepseIndex.fiftyTwoWeekHigh,
// 		fiftyTwoWeekLow: nepseIndex.fiftyTwoWeekLow,
// 		color: nepseIndex.perChange >= 0 ? "#00ff00" : "#ef4444",
// 		adLine: advanceDeclineData,
// 	});
// });
