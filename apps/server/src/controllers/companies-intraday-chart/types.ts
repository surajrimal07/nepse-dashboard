import z from '@nepse-dashboard/zod';
import { timeframes } from '../index-daily-chart/types';

export const stockIntraday = z.object({
  contractRate: z.number(),
  time: z.number(),
});

export const stockIntradayType = z.array(stockIntraday).min(1);

export const IntradayChartSchema = z.array(z.tuple([z.number(), z.number()]));

export const IntradayStockChartResponse = z.object({
  symbol: z.string(),
  version: z.string(),
  data: IntradayChartSchema,
  timeframe: timeframes,
});
