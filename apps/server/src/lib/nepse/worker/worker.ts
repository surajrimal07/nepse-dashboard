declare const self: Worker;

// Fix TLS certificate issue for NEPSE API
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import type { StockDailyPriceArray } from "@/controllers/companies-daily-chart/types";
import type { MarketDepthResponse } from "@/controllers/market-depth/types";
import type { SupplyDemandData } from "@/controllers/supply-demand/types";
import type { IndexKey } from "@/types/indexes";
import type {
	DisclosureResponse,
	IndexHistoricalDataArray,
	LiveMarket,
	PriceVolumeHistory,
	SecurityDailyChart,
} from "../../../types/nepse";
import { isStockValid } from "../../../utils/stock-mapper";
import API_ENDPOINTS from "../api/API_ENDPOINTS.json" with { type: "json" };
import { BASE_URL } from "../api/constants";
import { createNepseHeaders } from "../api/headers";
import type { MarketStatus } from "../api/marketStatus";
import type {
	CompanyList,
	IndexIntradayData,
	NepseIndex,
	PriceVolume,
	SecurityDetailResponse,
	SecurityList,
	Summary,
	TopGainerLoosers,
	TopTradeScrips,
	TopTransaction,
	TopTurnover,
} from "../api/securityDetail";
import { TokenManager } from "../api/token-manager";

// Required to work inside Bun Worker
self.onmessage = async (event) => {
	const task = event.data;

	try {
		const tokenManager = await TokenManager.getInstance();
		let result: unknown;

		switch (task.action) {
			case "get_market_status":
				result = await get_market_status(tokenManager);
				break;
			case "getSummary":
				result = await getSummary(tokenManager);
				break;
			case "disclosure":
				result = await disclosure(tokenManager);
				break;
			case "getTopTenTradeScrips":
				result = await getTopTenTradeScrips(tokenManager);
				break;
			case "getTopTenTransactions":
				result = await getTopTenTransactions(tokenManager);
				break;
			case "getTopTenTurnover":
				result = await getTopTenTurnover(tokenManager);
				break;
			case "getTopGainers":
				result = await getTopGainers(tokenManager);
				break;
			case "getTopLoosers":
				result = await getTopLoosers(tokenManager);
				break;
			case "getNepseIndex":
				result = await getNepseIndex(tokenManager);
				break;
			case "getNepseIndexIntraday":
				result = await getNepseIndexIntraday(tokenManager, task.payload?.index);
				break;
			case "stockIntraday":
				result = await stockIntraday(tokenManager, task.payload?.stock);
				break;
			case "getPriceVolume":
				result = await getPriceVolume(tokenManager);
				break;
			case "getSecurityList":
				result = await getSecurityList(tokenManager);
				break;
			case "getMarket_depth":
				result = await getMarket_depth(tokenManager, task.payload?.symbol);
				break;
			case "getSupplyDemand":
				result = await getSupplyDemand(tokenManager);
				break;
			case "getPriceVolumeHistory":
				result = await getPriceVolumeHistory(
					tokenManager,
					task.payload?.symbol,
					task.payload?.size,
				);
				break;
			case "getIndexPriceVolumeHistory":
				result = await getIndexPriceVolumeHistory(
					tokenManager,
					task.payload?.index,
					task.payload?.size,
				);
				break;
			case "getStockDailyPrice":
				result = await getStockDailyPrice(tokenManager, task.payload?.symbol);
				break;
			case "getCompaniesList":
				result = await getCompaniesList(tokenManager);
				break;
			case "liveMarketData":
				result = await liveMarketData(tokenManager);
				break;
			case "get_security_detail":
				result = await get_security_detail(tokenManager, task.payload?.symbol);
				break;
			default:
				throw new Error(`Unknown action: ${task.action}`);
		}

		postMessage({
			taskId: task.taskId,
			result,
			success: true,
		});
	} catch (error) {
		postMessage({
			taskId: task.taskId,
			error: error instanceof Error ? error.message : "Unknown error",
			success: false,
		});
	}
};

// Business logic functions - these run in the worker
async function get_market_status(
	tokenManager: TokenManager,
): Promise<MarketStatus | null> {
	const token = await tokenManager.getAccessToken();
	return await fetch(`${BASE_URL}${API_ENDPOINTS.nepse_open_url}`, {
		headers: createNepseHeaders(token),
		method: "GET",
		credentials: "include",
	})
		.then((resp) => resp.json() as Promise<MarketStatus>)
		.then((data: MarketStatus) => data)
		.catch(() => {
			return null;
		});
}

async function getSummary(tokenManager: TokenManager): Promise<Summary | null> {
	try {
		const token = await tokenManager.getAccessToken();

		const response = await fetch(`${BASE_URL}${API_ENDPOINTS.summary_url}`, {
			headers: createNepseHeaders(token),
			method: "GET",
			credentials: "include",
		});

		if (!response.ok) {
			return null;
		}

		const data = await response.json();

		if (Array.isArray(data)) {
			return data.reduce((acc, item) => {
				acc[item.detail] = item.value;
				return acc;
			}, {} as Summary);
		}

		return data;
	} catch {
		return null;
	}
}

async function disclosure(
	tokenManager: TokenManager,
): Promise<DisclosureResponse | null> {
	try {
		const token = await tokenManager.getAccessToken();

		const response = await fetch(`${BASE_URL}${API_ENDPOINTS.disclosure}`, {
			headers: createNepseHeaders(token),
			method: "GET",
			credentials: "include",
		});

		if (!response.ok) {
			return null;
		}

		const data = await response.json();

		return data as DisclosureResponse;
	} catch {
		return null;
	}
}

async function getTopTenTradeScrips(
	tokenManager: TokenManager,
): Promise<TopTradeScrips | null> {
	const token = await tokenManager.getAccessToken();
	return await fetch(`${BASE_URL}${API_ENDPOINTS.top_ten_trade_url}`, {
		headers: createNepseHeaders(token),
		method: "GET",
		credentials: "include",
	})
		.then((resp) => resp.json() as Promise<TopTradeScrips>)
		.then((data: TopTradeScrips) => data)
		.catch(() => {
			return null;
		});
}

async function getTopTenTransactions(
	tokenManager: TokenManager,
): Promise<TopTransaction | null> {
	const token = await tokenManager.getAccessToken();
	return await fetch(`${BASE_URL}${API_ENDPOINTS.top_ten_transaction_url}`, {
		headers: createNepseHeaders(token),
		method: "GET",
		credentials: "include",
	})
		.then((resp) => resp.json() as Promise<TopTransaction>)
		.then((data: TopTransaction) => data)
		.catch(() => {
			return null;
		});
}

async function getTopTenTurnover(
	tokenManager: TokenManager,
): Promise<TopTurnover | null> {
	const token = await tokenManager.getAccessToken();
	return await fetch(`${BASE_URL}${API_ENDPOINTS.top_ten_turnover_url}`, {
		headers: createNepseHeaders(token),
		method: "GET",
		credentials: "include",
	})
		.then((resp) => resp.json() as Promise<TopTurnover>)
		.then((data: TopTurnover) => data)
		.catch(() => {
			return null;
		});
}

async function getTopGainers(
	tokenManager: TokenManager,
): Promise<TopGainerLoosers | null> {
	const token = await tokenManager.getAccessToken();
	return await fetch(`${BASE_URL}${API_ENDPOINTS.top_gainers_url}`, {
		headers: createNepseHeaders(token),
		method: "GET",
		credentials: "include",
	})
		.then((resp) => resp.json() as Promise<TopGainerLoosers>)
		.then((data: TopGainerLoosers) => data)
		.catch(() => {
			return null;
		});
}

async function getTopLoosers(
	tokenManager: TokenManager,
): Promise<TopGainerLoosers | null> {
	const token = await tokenManager.getAccessToken();
	return await fetch(`${BASE_URL}${API_ENDPOINTS.top_losers_url}`, {
		headers: createNepseHeaders(token),
		method: "GET",
		credentials: "include",
	})
		.then((resp) => resp.json() as Promise<TopGainerLoosers>)
		.then((data: TopGainerLoosers) => data)
		.catch(() => {
			return null;
		});
}

async function getNepseIndex(
	tokenManager: TokenManager,
): Promise<NepseIndex | null> {
	try {
		const token = await tokenManager.getAccessToken();
		const response = await fetch(
			`${BASE_URL}${API_ENDPOINTS.nepse_index_url}`,
			{
				headers: createNepseHeaders(token),
				method: "GET",
				credentials: "include",
			},
		);

		if (!response.ok) {
			return null;
		}

		const data = await response.json();

		if (Array.isArray(data)) {
			return data.reduce((acc, item) => {
				acc[item.index] = item;
				return acc;
			}, {} as NepseIndex);
		}

		return data;
	} catch {
		return null;
	}
}

async function getNepseIndexIntraday(
	tokenManager: TokenManager,
	index: IndexKey = "NEPSE Index",
): Promise<IndexIntradayData | null> {
	try {
		const token = await tokenManager.getAccessToken();

		const finalBodyId = tokenManager.getPOSTPayloadID();

		const response = await fetch(`${BASE_URL}${API_ENDPOINTS[index]}`, {
			headers: createNepseHeaders(token),
			body: JSON.stringify({ id: finalBodyId }),
			method: "POST",
		});

		if (!response.ok) {
			return null;
		}
		return (await response.json()) as IndexIntradayData;
	} catch {
		return null;
	}
}

async function stockIntraday(
	tokenManager: TokenManager,
	stock = "NABIL",
): Promise<SecurityDailyChart | null> {
	try {
		const token = await tokenManager.getAccessToken();

		const finalBodyId = tokenManager.get_valid_body_id();

		const symbolMap = await tokenManager.getSecuritySymbolIdMap();

		const response = await fetch(
			`${BASE_URL}${API_ENDPOINTS.company_daily_graph}${symbolMap[stock]}`,
			{
				headers: createNepseHeaders(token),
				body: JSON.stringify({ id: finalBodyId }),
				method: "POST",
			},
		);

		if (!response.ok) {
			return null;
		}

		return (await response.json()) as SecurityDailyChart;
	} catch {
		return null;
	}
}

async function getPriceVolume(
	tokenManager: TokenManager,
): Promise<PriceVolume | null> {
	const token = await tokenManager.getAccessToken();
	return await fetch(`${BASE_URL}/api/nots/securityDailyTradeStat/58`, {
		headers: createNepseHeaders(token),
		method: "GET",
		credentials: "include",
	})
		.then((resp) => resp.json() as Promise<PriceVolume>)
		.then((data: PriceVolume) => data)
		.catch(() => {
			return null;
		});
}

async function getSecurityList(
	tokenManager: TokenManager,
): Promise<SecurityList | null> {
	const token = await tokenManager.getAccessToken();
	return await fetch(`${BASE_URL}${API_ENDPOINTS.security_list_url}`, {
		headers: createNepseHeaders(token),
		method: "GET",
	})
		.then((resp) => resp.json() as Promise<SecurityList>)
		.then((data: SecurityList) => data)
		.catch(() => {
			return null;
		});
}

async function getCompaniesList(
	tokenManager: TokenManager,
): Promise<CompanyList | null> {
	const token = await tokenManager.getAccessToken();
	return await fetch(`${BASE_URL}${API_ENDPOINTS.company_list_url}`, {
		headers: createNepseHeaders(token),
		method: "GET",
	})
		.then((resp) => resp.json() as Promise<CompanyList>)
		.then((data: CompanyList) => data)
		.catch(() => {
			return null;
		});
}

async function getMarket_depth(
	tokenManager: TokenManager,
	symbol: string,
): Promise<MarketDepthResponse | null> {
	if (!isStockValid(symbol)) {
		return null;
	}
	const token = await tokenManager.getAccessToken();
	const symbolMap = await tokenManager.getSecuritySymbolIdMap();

	return await fetch(
		`${BASE_URL}${API_ENDPOINTS["market-depth"]}${symbolMap[symbol]}`,
		{
			headers: createNepseHeaders(token),
			method: "GET",
		},
	)
		.then((resp) => resp.json())
		.then((data: MarketDepthResponse) => data)
		.catch(() => {
			return null;
		});
}

async function getSupplyDemand(
	tokenManager: TokenManager,
): Promise<SupplyDemandData | null> {
	try {
		const token = await tokenManager.getAccessToken();

		const response = await fetch(
			`${BASE_URL}${API_ENDPOINTS.supply_demand_url}`,
			{
				headers: createNepseHeaders(token),
				method: "GET",
			},
		);

		if (!response.ok) {
			return null;
		}

		return (await response.json()) as SupplyDemandData;
	} catch {
		return null;
	}
}

async function getPriceVolumeHistory(
	tokenManager: TokenManager,
	symbol: string,
	size = 500,
): Promise<PriceVolumeHistory | null> {
	try {
		if (!isStockValid(symbol)) {
			return null;
		}

		const token = await tokenManager.getAccessToken();
		const symbolMap = await tokenManager.getSecuritySymbolIdMap();
		const end = new Date();
		const start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);

		const formattedEndDate = end.toISOString().split("T")[0];
		const formattedStartDate = start.toISOString().split("T")[0];

		const response = await fetch(
			`${BASE_URL}${API_ENDPOINTS.company_price_volume_history}${symbolMap[symbol]}?&size=${size}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
			{
				headers: createNepseHeaders(token),
				method: "GET",
			},
		);

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		return data.content as PriceVolumeHistory;
	} catch {
		return null;
	}
}

async function getIndexPriceVolumeHistory(
	tokenManager: TokenManager,
	index: IndexKey,
	size = 500,
): Promise<IndexHistoricalDataArray | null> {
	try {
		const token = await tokenManager.getAccessToken();

		const response = await fetch(
			`${BASE_URL}${API_ENDPOINTS.index_history[index]}?&size=${size}`,
			{
				headers: createNepseHeaders(token),
				method: "GET",
			},
		);

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		return data.content.reverse() as IndexHistoricalDataArray;
	} catch {
		return null;
	}
}

async function getStockDailyPrice(
	tokenManager: TokenManager,
	symbol: string,
): Promise<StockDailyPriceArray | null> {
	try {
		if (!isStockValid(symbol)) {
			return null;
		}

		const token = await tokenManager.getAccessToken();
		const symbolMap = await tokenManager.getSecuritySymbolIdMap();
		const finalBodyId = tokenManager.get_valid_body_id();

		const response = await fetch(
			`${BASE_URL}${API_ENDPOINTS.stock_daily_price}${symbolMap[symbol]}`,
			{
				headers: createNepseHeaders(token),
				method: "POST",
				body: JSON.stringify({ id: finalBodyId }),
			},
		);

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		return data as StockDailyPriceArray;
	} catch {
		return null;
	}
}

async function liveMarketData(
	tokenManager: TokenManager,
): Promise<LiveMarket | null> {
	try {
		const token = await tokenManager.getAccessToken();

		const response = await fetch(`${BASE_URL}${API_ENDPOINTS["live-market"]}`, {
			headers: createNepseHeaders(token),
			method: "GET",
		});

		if (!response.ok) {
			return null;
		}

		return (await response.json()) as LiveMarket;
	} catch {
		return null;
	}
}

async function get_security_detail(
	tokenManager: TokenManager,
	symbol: string,
): Promise<SecurityDetailResponse | null> {
	if (!isStockValid(symbol)) {
		return null;
	}
	const symbolMap = await tokenManager.getSecuritySymbolIdMap();
	const bodyId = tokenManager.get_valid_body_id();
	const token = await tokenManager.getAccessToken();
	const securityDetail: SecurityDetailResponse | null = await fetch(
		`${BASE_URL}/api/nots/security/${symbolMap[symbol]}`,
		{
			headers: createNepseHeaders(token),
			body: JSON.stringify({ id: bodyId }),
			method: "POST",
		},
	)
		.then((resp) => resp.json() as Promise<SecurityDetailResponse>)
		.then((sec: SecurityDetailResponse) => {
			return sec;
		})
		.catch(() => {
			return null;
		});
	return securityDetail;
}
