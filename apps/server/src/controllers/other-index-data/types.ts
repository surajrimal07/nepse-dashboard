import z from '@nepse-dashboard/zod';
import { indexKeySchema } from '@/types/indexes';

export const indexEntrySchema = z.object({
  date: z.string(),
  symbol: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  amount: z.number(),
  prev_close: z.number(),
  point_change: z.number(),
  percentage_change: z.number(),
  volume: z.number(),
});

export const chukulIndexResponse = z.array(indexEntrySchema);

export type ChukulIndexResponse = z.infer<typeof chukulIndexResponse>;

export const indexDataSchema = z.object({
  index: indexKeySchema,
  turnover: z.string().default('-'), //amount
  close: z.number().default(0),
  high: z.number().default(0),
  low: z.number().default(0),
  percentageChange: z.number().default(0),
  change: z.number().default(0),
  open: z.number().default(0),
  time: z.string().default('-'), //date

  previousClose: z.number().default(0),
  totalTradedShared: z.number().default(0), //volume
  color: z.string().default('#00ff00'), //computed
  version: z.string(), //no default
  adLine: z.object({
    advance: z.number(),
    decline: z.number(),
    neutral: z.number(),
  }), //advance decline data
});

export const stockIndexDataSchema = z.array(indexDataSchema);
export const chukulIndexDataSchema = z.array(indexDataSchema);

export type IndexData = z.infer<typeof indexDataSchema>;
export type StockIndexData = z.infer<typeof stockIndexDataSchema>;
