import z from "@nepse-dashboard/zod";

export const StockPredictionSchema = z.object({
	ticker: z.string(),
	name: z.string(),
	impact: z.number(),
	ltp: z.number().nullable(),
	pointchange: z.number().nullable(),
	percentchange: z.number().nullable(),
	volume: z.number().nullable().optional(),
});

export type StockPrediction = z.infer<typeof StockPredictionSchema>;

export const MarketSentimentSchema = z.object({
	prediction: z.string(),
	strength: z.number(),
	version: z.number(),
	topCompanies: z.array(StockPredictionSchema),
});

export type MarketSentiment = z.infer<typeof MarketSentimentSchema>;
