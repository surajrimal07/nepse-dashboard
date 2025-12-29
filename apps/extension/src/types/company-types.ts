import z from "@nepse-dashboard/zod";

import { ChartData } from "@/types/indexes-type";

export const CompanySchema = z.object({
	time: z.string(),
	openPrice: z.number(),
	highPrice: z.number(),
	lowPrice: z.number(),
	closePrice: z.number(),
	turnover: z.number(),
	previousClose: z.number(),
	percentageChange: z.number(),
	totalTradedShared: z.number(),
	change: z.number(),
	symbol: z.string(),
	securityName: z.string(),
	sectorName: z.string(),
	color: z.string(),
});

export type Company = z.infer<typeof CompanySchema>;
export type CompanyArray = z.infer<typeof CompanySchema>[];

export const CompanyDataSchema = z.object({
	data: z.array(CompanySchema),
	version: z.string(),
});

export type CompanyData = z.infer<typeof CompanyDataSchema>;

export const CompanyDetailsSchema = z.object({
	openPrice: z.number(),
	highPrice: z.number(),
	lowPrice: z.number(),
	closePrice: z.number(),
	totalTrades: z.number(),
	totalTradeQuantity: z.number(),
	lastTradedPrice: z.number(),
	previousClose: z.number(),
	fiftyTwoWeekHigh: z.number(),
	fiftyTwoWeekLow: z.number(),
	lastUpdatedDateTime: z.string(),
	listingDate: z.string(),
	companyName: z.string(),
	email: z.string(),
	companyWebsite: z.string(),
	companyContactPerson: z.string(),
	stockListedShares: z.string(),
	paidUpCapital: z.string(),
	issuedCapital: z.string(),
	marketCapitalization: z.string(),
	publicShares: z.string(),
	publicPercentage: z.number(),
	promoterShares: z.number(),
	promoterPercentage: z.number(),
	change: z.number(),
	percentageChange: z.number(),
});

export type CompanyDetails = z.infer<typeof CompanyDetailsSchema>;

export const StockIntradayChartSchema = z.object({
	symbol: z.string(),
	data: ChartData,
	version: z.string(),
});
export type StockIntradayChart = z.infer<typeof StockIntradayChartSchema>;

export const StockDailyChartWithData = z.object({
	symbol: z.string(),
	data: ChartData,
	version: z.string(),
	color: z.string().default("#00ff00"),
	change: z.number().default(0),
	percentageChange: z.number().default(0),
	open: z.number().default(0),
	close: z.number().default(0),
});

export type StockDailyChartWithData = z.infer<typeof StockDailyChartWithData>;

export const CompanyChartSchema = z.object({
	intraday: StockIntradayChartSchema.optional().nullable(),
	daily: StockDailyChartWithData.optional().nullable(),
});

export type CompanyChart = z.infer<typeof CompanyChartSchema>;
