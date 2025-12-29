import z from "@nepse-dashboard/zod";

export const GainerLoserDataSchema = z.object({
	symbol: z.string(),
	name: z.string(),
	ltp: z.number(),
	pointchange: z.number(),
	percentchange: z.number(),
});
export type GainerLoserData = z.infer<typeof GainerLoserDataSchema>;

export const TransactionDataSchema = z.object({
	symbol: z.string(),
	name: z.string(),
	ltp: z.number(),
	transactions: z.number(),
});
export type TransactionData = z.infer<typeof TransactionDataSchema>;

export const TurnoverDataSchema = z.object({
	symbol: z.string(),
	name: z.string(),
	ltp: z.number(),
	turnover: z.string(),
});
export type TurnoverData = z.infer<typeof TurnoverDataSchema>;

export const TradedDataSchema = z.object({
	symbol: z.string(),
	name: z.string(),
	ltp: z.number(),
	shareTraded: z.number(),
});
export type TradedData = z.infer<typeof TradedDataSchema>;

export function DashboardSectionSchema<T extends z.ZodTypeAny>(itemSchema: T) {
	return z.object({
		data: z.array(itemSchema),
		version: z.number(),
	});
}

export const DashboardDataSchema = z.object({
	gainers: DashboardSectionSchema(GainerLoserDataSchema),
	losers: DashboardSectionSchema(GainerLoserDataSchema),
	transactions: DashboardSectionSchema(TransactionDataSchema),
	turnovers: DashboardSectionSchema(TurnoverDataSchema),
	traded: DashboardSectionSchema(TradedDataSchema),
});
export type DashboardData = z.infer<typeof DashboardDataSchema>;

export const TopTab = {
	GAINERS: "gainers" as const,
	LOSERS: "losers" as const,
	TRANSACTIONS: "transactions" as const,
	TURNOVERS: "turnovers" as const,
	TRADED: "traded" as const,
} as const;

export const TopTabTypeSchema = z.enum([
	TopTab.GAINERS,
	TopTab.LOSERS,
	TopTab.TRANSACTIONS,
	TopTab.TURNOVERS,
	TopTab.TRADED,
]);

export type TopTabType = z.infer<typeof TopTabTypeSchema>;

export const TopTypeSchema = z.array(TopTabTypeSchema);
export const TopType = TopTabTypeSchema.options;

export const topTradersSearchSchema = z.object({
	initialTab: TopTabTypeSchema,
});
