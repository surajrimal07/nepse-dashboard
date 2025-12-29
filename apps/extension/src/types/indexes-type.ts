import z from "@nepse-dashboard/zod";

export const nepseIndexes = [
	"Banking SubIndex",
	"Development Bank Ind.",
	"Finance Index",
	"Hotels And Tourism",
	"HydroPower Index",
	"Investment",
	"Life Insurance",
	"Manufacturing And Pr.",
	"Microfinance Index",
	"Mutual Fund",
	"NEPSE Index",
	"Non Life Insurance",
	"Others Index",
	"Trading Index",
] as const;

export const allIndexes: IndexKeys[] = [...nepseIndexes];

export type IndexKeys = (typeof nepseIndexes)[number];

export const indexKeySchema = z.enum(nepseIndexes);

export type IndexKey = z.infer<typeof indexKeySchema>;

export const nepseOnlyIndex = z.literal(nepseIndexes[10]); // 'NEPSE Index'
export type NepseOnlyIndex = z.infer<typeof nepseOnlyIndex>;

export const otherOnlyIndexes = indexKeySchema.exclude(["NEPSE Index"]);
export type OtherOnlyIndexes = z.infer<typeof otherOnlyIndexes>;

export const AdvanceDeclineSchema = z.object({
	advance: z.number(),
	decline: z.number(),
	neutral: z.number(),
});

export type AdvanceDecline = z.infer<typeof AdvanceDeclineSchema>;

export const ChartData = z.array(z.tuple([z.number(), z.number()]));
export type ChartData = z.infer<typeof ChartData>;

export const IndexIntradayData = z.object({
	time: z.string(),
	open: z.number(),
	high: z.number(),
	low: z.number(),
	close: z.number(),
	change: z.number(),
	previousClose: z.number(),
	totalTradedShared: z.number(),
	totalTransactions: z.number().default(0),
	totalScripsTraded: z.number().default(0),
	turnover: z.string(),
	totalCapitalization: z.string().optional().nullable(),
	percentageChange: z.number(),
	fiftyTwoWeekHigh: z.number().default(0),
	fiftyTwoWeekLow: z.number().default(0),
	color: z.string(),
	adLine: AdvanceDeclineSchema.optional(),
	version: z.number(),
});

export type IndexIntradayData = z.infer<typeof IndexIntradayData>;

export const IndexChart = z.object({
	index: indexKeySchema,
	data: ChartData,
	version: z.number(),
});

export type IndexChart = z.infer<typeof IndexChart>;

export const DailyIndexChartWithData = z.object({
	index: indexKeySchema,
	data: ChartData,
	version: z.number(),
	color: z.string().default("#00ff00"),
	change: z.number(),
	percentageChange: z.number(),
	open: z.number(),
	close: z.number(),
});

export type DailyIndexChartWithData = z.infer<typeof DailyIndexChartWithData>;

export const IndexData = z.object({
	IntradayData: IndexIntradayData.optional(),
	IntradayChart: IndexChart.optional(),
	DailyChartWithData: DailyIndexChartWithData.optional(),
});

export type IndexData = z.infer<typeof IndexData>;

export const WithOutNepse = z.record(
	indexKeySchema.exclude(["NEPSE Index"]),
	IndexIntradayData,
);
export type WithOutNepse = z.infer<typeof WithOutNepse>;

export const withNepse = z.record(z.literal("NEPSE Index"), IndexIntradayData);
export type WithNepse = z.infer<typeof withNepse>;

export type timeframe = "1d" | "1m";
