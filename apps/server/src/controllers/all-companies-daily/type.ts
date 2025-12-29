import z from "@nepse-dashboard/zod";

export const StockDailySchema = z.object({
	symbol: z.string(),
	percentage_change_monthly: z.number(),
	point_change_monthly: z.number(),
    close: z.number(),
});

export const StockDailyArraySchema = z.array(StockDailySchema).min(1);
