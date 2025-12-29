// import z from "@nepse-dashboard/zod";
// import { companiesState } from "@/state/company-state";
// import { indexState } from "@/state/index-state";
// import { marketDepthState } from "@/state/market-depth-state";
// import { oddLotState } from "@/state/odd-state";
// import { rateLimitState } from "@/state/rate-limit-state";
// import { sentimentState } from "@/state/sentiment-state";
// import { supplyDemandState } from "@/state/supply-demand-state";
// import { topState } from "@/state/top-state";
// import type { CompanyData, StockIntradayChart } from "@/types/company-types";
// import {
// 	CompanyDataSchema,
// 	StockDailyChartWithData,
// 	StockIntradayChartSchema,
// } from "@/types/company-types";
// import { ConnectionStatus } from "@/types/connection-type";
// import type { ValidationErrorType } from "@/types/error-types";
// import { ValidationError } from "@/types/error-types";
// import type { NepseOnlyIndex, OtherOnlyIndexes } from "@/types/indexes-type";
// import {
// 	DailyIndexChartWithData,
// 	IndexChart,
// 	IndexIntradayData,
// 	nepseOnlyIndex,
// 	otherOnlyIndexes,
// } from "@/types/indexes-type";
// import {
// 	MarketClosedErrorSchema,
// 	MarketDepth,
// } from "@/types/market-depth-types";
// import type { MarketStatus } from "@/types/nepse-states-type";
// import { MarketStatesSchema } from "@/types/nepse-states-type";
// import { NewsSummarySchema } from "@/types/news-types";
// import type { Oddlot } from "@/types/odd-types";
// import { OddLotResponseSchema, OddLotType } from "@/types/odd-types";
// import type { RateLimit } from "@/types/rate-limit-types";
// import { RateLimitSchema } from "@/types/rate-limit-types";
// import type { MarketSentiment } from "@/types/sentiment-type";
// import { MarketSentimentSchema } from "@/types/sentiment-type";
// import {
// 	CUSTOM_EVENTS,
// 	ScreenshotResponseSchema,
// 	SOCKET_ROOMS,
// } from "@/types/socket-type";
// import type { SupplyDemand } from "@/types/supply-demand-types";
// import { SupplyDemandSchema } from "@/types/supply-demand-types";
// import type { DashboardData } from "@/types/top-types";
// import { DashboardDataSchema } from "@/types/top-types";

// export const messageHandlers = {
// 	[SOCKET_ROOMS.IS_OPEN]: (data: MarketStatus) =>
// 		indexState.getState().setNepseState(data),

// 	[SOCKET_ROOMS.NEPSE_INDEX]: (
// 		data: Record<NepseOnlyIndex, IndexIntradayData>,
// 	) => indexState.getState().updateIndexData(data),
// 	[SOCKET_ROOMS.DAILY_INDEX_CHART]: (data: DailyIndexChartWithData) =>
// 		indexState.getState().updateIndexDailyChartData(data),
// 	[SOCKET_ROOMS.DAILY_STOCK_CHART]: (data: StockDailyChartWithData) =>
// 		companiesState.getState().updateCompanyDailyChartData(data),
// 	[SOCKET_ROOMS.INTRADAY_CHART]: (data: IndexChart) =>
// 		indexState.getState().updateIndexChartData(data),
// 	[SOCKET_ROOMS.OTHER_INDEXES]: (
// 		data: Record<OtherOnlyIndexes, IndexIntradayData>,
// 	) => indexState.getState().updateIndexData(data),
// 	[SOCKET_ROOMS.SENTIMENT]: (data: MarketSentiment) =>
// 		sentimentState.getState().setSentimentData(data),
// 	[SOCKET_ROOMS.DASHBOARD]: (data: DashboardData) =>
// 		topState.getState().setTopData(data),
// 	[SOCKET_ROOMS.ALL_COMPANIES]: (data: CompanyData) =>
// 		companiesState.getState().updateCompaniesData(data),
// 	[SOCKET_ROOMS.SUPPLY_DEMAND]: (data: SupplyDemand | ValidationErrorType) => {
// 		if (isValidationError(data)) {
// 			supplyDemandState.getState().setSupplyDemandError(data.error.message);
// 		} else {
// 			supplyDemandState.getState().setSupplyDemand(data);
// 		}
// 	},
// 	[SOCKET_ROOMS.INTRADAY_STOCK_CHART]: (data: StockIntradayChart) =>
// 		companiesState.getState().updateCompanyChartData(data),

// 	[SOCKET_ROOMS.MARKET_DEPTH]: (data: MarketDepth | ValidationErrorType) => {
// 		if (isValidationError(data)) {
// 			marketDepthState.getState().setMarketDepthError(data.error.message);
// 		} else {
// 			marketDepthState.getState().setMarketDepthData(data);
// 		}
// 	},

// 	[SOCKET_ROOMS.RATE_LIMIT_ERROR]: (data: unknown) =>
// 		rateLimitState
// 			.getState()
// 			.setRateLimit((data as { rateLimit: RateLimit }).rateLimit),
// };

// export const oddLotHandlers = {
// 	[OddLotType.ALL]: (data: Oddlot[]) =>
// 		oddLotState.getState().addAllOddlot(data),
// 	[OddLotType.MODIFY]: (data: Oddlot) =>
// 		oddLotState.getState().updateOddlot(data as Oddlot),
// 	[OddLotType.ADD]: (data: Oddlot) => oddLotState.getState().addOddlot(data),
// 	[OddLotType.MY]: (data: Oddlot | Oddlot[] | null) =>
// 		oddLotState.getState().addMyOddlot(data),
// 	[OddLotType.NOTIFICATION]: (message?: string) => {
// 		if (message) {
// 			oddLotState.getState().showNotification(message);
// 		}
// 	},
// };

// export const messageSchemas = {
// 	[SOCKET_ROOMS.IS_OPEN]: MarketStatesSchema,
// 	[SOCKET_ROOMS.NEPSE_INDEX]: z.record(nepseOnlyIndex, IndexIntradayData), // only nepse index
// 	[SOCKET_ROOMS.DAILY_INDEX_CHART]: DailyIndexChartWithData,
// 	[SOCKET_ROOMS.DAILY_STOCK_CHART]: StockDailyChartWithData,
// 	[SOCKET_ROOMS.INTRADAY_CHART]: IndexChart,
// 	[SOCKET_ROOMS.OTHER_INDEXES]: z.record(otherOnlyIndexes, IndexIntradayData), // remaning other indexes
// 	[SOCKET_ROOMS.SENTIMENT]: MarketSentimentSchema,
// 	[SOCKET_ROOMS.DASHBOARD]: DashboardDataSchema,
// 	[SOCKET_ROOMS.ALL_COMPANIES]: CompanyDataSchema,
// 	[SOCKET_ROOMS.SUPPLY_DEMAND]: z.union([
// 		SupplyDemandSchema,
// 		MarketClosedErrorSchema,
// 	]),
// 	[SOCKET_ROOMS.INTRADAY_STOCK_CHART]: StockIntradayChartSchema,
// 	[SOCKET_ROOMS.MARKET_DEPTH]: z.union([MarketDepth, MarketClosedErrorSchema]),
// 	[CUSTOM_EVENTS.CONNECTION_STATUS_RESPONSE]: ConnectionStatus,
// 	[SOCKET_ROOMS.RATE_LIMIT_ERROR]: z.object({ rateLimit: RateLimitSchema }),
// 	[SOCKET_ROOMS.ODD_LOT]: OddLotResponseSchema,
// 	[CUSTOM_EVENTS.VALIDATION_ERROR]: ValidationError,
// 	[CUSTOM_EVENTS.SCREENSHOT]: ScreenshotResponseSchema,
// 	[CUSTOM_EVENTS.NEWS_SUMMARY]: NewsSummarySchema,
// };
