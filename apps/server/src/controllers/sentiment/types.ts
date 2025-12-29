import z from '@nepse-dashboard/zod';

export const PredictionResultSchema = z.union([
  z.literal('Market likely to increase significantly'),
  z.literal('Market may increase'),
  z.literal('Market likely to decrease significantly'),
  z.literal('Market may decrease'),
  z.literal('Market may remain stable'),
]);

export type PredictionResult = z.infer<typeof PredictionResultSchema>;

// Zod schema for StockPrediction interface
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

// Zod schema for NepsePredictionResult type
export const NepsePredictionResultSchema = z.object({
  prediction: PredictionResultSchema,
  strength: z.number(),
  version: z.string(),
  topCompanies: z.array(StockPredictionSchema),
});

export type NEPSEPrediction = z.infer<typeof NepsePredictionResultSchema>;
