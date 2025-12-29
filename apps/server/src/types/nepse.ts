import z from "@nepse-dashboard/zod";
import type { IndexKey } from "./indexes";

//end of dashboard data

// export const openAtSchema = z.object({
// 	date: z.string(),
// 	open: z.number(),
// });
// export type OpenAt = z.infer<typeof openAtSchema>;

// export type IndexKey = (typeof nepseIndexes)[number];

// export type NepseIndex = (typeof nepseIndexes)[number];
// export type IndexKeyWithoutNEPSE = Exclude<NepseIndex, "NEPSE Index">;

// export const indexKeySchema = z.enum(nepseIndexes);
// export const indexKeySchemaWithoutNEPSE = z.enum(
//   nepseIndexes.filter((key) => key !== "NEPSE Index") as [string, ...string[]]
// );

// // Define a type-safe cache key enum or constants
// export const CacheKeys = {
//   TOP_LOSERS: 'topLosersShare',
//   NEPSE_DASHBOARD: 'nepseDashboard',
//   TOP_GAINERS: 'topgainersShare',
//   TOP_TURNOVERS: 'topTurnoversShare',
//   TOP_TRADED: 'topTradedShares',
//   TOP_TRANSACTIONS: 'topTransactions',
//   NEPSE_INDEX_DATA: 'nepseIndexData',
//   INDEXS_COMPLETE_DATA: 'indexsCompleteData',
//   LIVE_STOCK_DATA: 'livestockdata',
//   LIVE_INDEX_DATA: 'liveIndexData',
//   LIVE_LAST_UPDATED: 'liveLastUpdated',
//   TODAY_NEPSE_OPENED_AT: 'todayNepseOpenAt',
//   LIVE_INDEX_DATA_BACKUP: 'liveIndexDataBackup',
//   LIVE_MARKET_RESPONSE_DATA: 'liveMarketResponseData',
//   LISTED_COMPANIES: 'listedStocks',
//   IS_OPEN: 'isOpen',
//   ADVANCE_DECLINE: 'advanceDecline',
//   NEPSE_SENTIMENT: 'nepseSentiment',
//   SUPPLY_DEMAND: 'supplyDemand',
// } as const;

// export type CacheKey = keyof typeof CacheKeys;

export interface TopTransactions {
	symbol: string;
	name: string;
	ltp: number;
	transactions: number;
}

// export type IntradayChartData = z.infer<typeof IntradayChartSchema>;
// export type IntradayChartResponseType = z.infer<
// 	typeof IntradayStockChartResponse
// >;

//
export const INDEX_URL_MAP: Record<IndexKey, string> = {
	"Banking SubIndex": "DailyBankSubindexGraph",
	"Development Bank Ind.": "DailyDevelopmentBankSubindexGraph",
	"Finance Index": "DailyFinanceSubindexGraph",
	"Hotels And Tourism": "DailyHotelTourismSubindexGraph",
	"HydroPower Index": "DailyHydroPowerSubindexGraph",
	Investment: "DailyInvestmentSubindexGraph",
	"Life Insurance": "DailyLifeInsuranceSubindexGraph",
	"Manufacturing And Pr.": "DailyManufacturingProcessingSubindexGraph",
	"Microfinance Index": "DailyMicrofinanceSubindexGraph",
	"Mutual Fund": "DailyMutualFundSubindexGraph",
	"NEPSE Index": "DailyNepseIndexGraph",
	"Non Life Insurance": "DailyNonLifeInsuranceSubindexGraph",
	"Others Index": "DailyOthersSubindexGraph",
	"Trading Index": "DailyTradingSubindexGraph",
} as const;

//exp zod

export const stockDataSchema = z.object({
	symbol: z.string().min(1),
	ltp: z.number().default(0),
	pointchange: z.number().default(0),
	percentchange: z.number().default(0),
	open: z.number().default(0),
	high: z.number().default(0),
	low: z.number().default(0),
	volume: z.number().default(0),
	previousclose: z.number().default(0),
});

export const AdvanceDeclineSchema = z.object({
	advance: z.number().optional().nullable().default(0),
	decline: z.number().optional().nullable().default(0),
	neutral: z.number().optional().nullable().default(0),
});

export type StockData = z.infer<typeof stockDataSchema>;

export interface SectorAdvanceDecline {
	advance: number;
	decline: number;
	neutral: number;
}

export type AdvanceDeclineResult = {
	[K in IndexKey]: SectorAdvanceDecline;
};
//end of listed companies

//exp nepse index

// Final output schema with defaults and transformations

//base schema of index intraday

// export type IndexIntraday = z.infer<typeof indexIntradayBaseSchema>;

//end of nepse index

//isOpen

//

export type IndexHighLow = {
	[key in IndexKey]?: {
		high: number;
		low: number;
	};
};
export type DashboardData = {
	gainers: Array<{
		symbol: string;
		name: string;
		ltp: number;
		pointchange: number;
		percentchange: number;
	}>;
	losers: Array<{
		symbol: string;
		name: string;
		ltp: number;
		pointchange: number;
		percentchange: number;
	}>;
	transactions: Array<{
		symbol: string;
		name: string;
		ltp: number;
		transactions: number;
	}>;
	turnovers: Array<{
		symbol: string;
		name: string;
		ltp: number;
		turnover: number;
	}>;
	traded: Array<{
		symbol: string;
		name: string;
		ltp: number;
		shareTraded: number;
	}>;
};

export interface TopCompany {
	ticker: string;
	name: string;
	impact: number;
}

// Enum for NEPSE sources to provide type safety
export enum NepseSources {
	AbhiyanDaily = "Abhiyan Daily",
	Arthasarokar = "Arthasarokar",
	KarobarDaily = "Karobar Daily",
	Bizmandu = "Bizmandu",
	Arthapath = "Arthapath",
	Clickmandu = "Clickmandu",
	CapitalNepal = "Capital Nepal",
	BizKhabar = "BizKhabar",
	ArthaKendraNepali = "ArthaKendra Nepali",
	ArthaKendraEnglish = "ArthaKendra English",
	ShareSansar = "Share Sansar",
	MeroLagani = "Mero Lagani",
}

export interface RestartResponse {
	success: boolean;
	message: string;
	statusCode?: number;
}

export interface TopGainersApiResponse {
	symbol: string;
	securityName: string;
	ltp: number;
	pointChange: number;
	percentageChange: number;
}

export const SummarySchema = z.object({
	"Total Turnover Rs:": z.number(),
	"Total Traded Shares": z.number(),
	"Total Transactions": z.number(),
	"Total Scrips Traded": z.number(),
});

export interface TopTurnoversApiResponse {
	symbol: string;
	securityName: string;
	closingPrice: number;
	turnover: number;
}

// export interface SupplyDemandResponse {
//   highestQuantityperOrder: HighestOrderWithSupplyDemandData[];
//   highestSupply: SupplyDemand[];
//   highestDemand: SupplyDemand[];
//   updated: boolean;
//   version: string;
// }

//zod schema //swich to zod later

//end of supply demand

//stock intraday

// export const MarketClosedError = z.object({
// 	error: z.string().default("Market is closed"),
// });

// export type MarketClosedErrorType = z.infer<typeof MarketClosedError>;

export interface SecurityDailyChart {
	contractRate: number;
	time: number;
}

//used in lib
export interface PriceVolumeHistory {
	businessDate: string;
	totalTrades: number;
	totalTradedQuantity: number;
	totalTradedValue: number;
	highPrice: number;
	lowPrice: number;
	closePrice: number;
}

//used in lib
export interface LiveMarket {
	securityId: string;
	securityName: string;
	symbol: string;
	indexId: number;
	openPrice: number;
	highPrice: number;
	lowPrice: number;
	totalTradeQuantity: number;
	totalTradeValue: number;
	lastTradedPrice: number;
	percentageChange: number;
	lastUpdatedDateTime: string;
	lastTradedVolume: number;
	previousClose: number;
	averageTradedPrice: number;
	totalTradedVolume: number;
	numberOfTrades: number;
}

//used in lib
export interface IndexHistoricalData {
	id: number;
	businessDate: string;
	exchangeIndexId: number;
	closingIndex: number;
	openIndex: number;
	highIndex: number;
	lowIndex: number;
	fiftyTwoWeekHigh: number;
	fiftyTwoWeekLow: number;
	turnoverValue: number;
	turnoverVolume: number;
	totalTransaction: number;
	absChange: number;
	percentageChange: number;
}

export type IndexHistoricalDataArray = IndexHistoricalData[];

//disclosure
export interface DisclosureResponse {
	exchangeMessages: ExchangeMessage[];
	companyNews: CompanyNewsItem[];
}

export interface ExchangeMessage {
	id: number;
	messageTitle: string;
	messageBody: string; // HTML from API (before sanitization)
	encryptedId: string | null;
	expiryDate: string; // YYYY-MM-DD
	filePath: string | null;
	remarks: string | null;
	addedDate: string | null; // ISO string
	modifiedDate: string | null;
	approvedDate: string | null;
}

export interface CompanyNewsDocument {
	id: number;
	activeStatus: string;
	modifiedBy: string;
	modifiedDate: string;
	application: number;
	documentType: number;
	submittedDate: string;
	filePath: string;
	encryptedId: string;
}

export interface CompanyNewsItem {
	id: number;
	newsHeadline: string;
	newsBody: string; // HTML from API (before sanitization)
	newsSource: string;
	addedDate: string;
	modifiedDate: string;
	approvedDate: string | null;
	applicationDocumentDetailsList: CompanyNewsDocument[];
}
