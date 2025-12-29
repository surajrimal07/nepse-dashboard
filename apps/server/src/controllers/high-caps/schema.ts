import z from "@nepse-dashboard/zod";

export const highCapStockSchema = z.object({
	symbol: z.string(),
	core_capital: z.number(),
	public_shares: z.number(),
	date: z.string(), // ISO date string, e.g., "2025-12-22"
	volume: z.number(),
	close: z.number(),
	float_cap: z.number(),
});

export const highCapStocksResponseSchema = z.object({
	high_cap_stocks: z.array(highCapStockSchema),
});
