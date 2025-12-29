import type {
	DisclosureResponse,
	IndexHistoricalDataArray,
	LiveMarket,
	PriceVolumeHistory,
	SecurityDailyChart,
} from "../../../types/nepse";
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

// Export the worker pool system for advanced users
export { WorkerPool, type WorkerPoolOptions } from "./workerPool";

import { logger } from "@nepse-dashboard/logger";
import type { StockDailyPriceArray } from "@/controllers/companies-daily-chart/types";
import type { MarketDepthResponse } from "@/controllers/market-depth/types";
import type { SupplyDemandData } from "@/controllers/supply-demand/types";
import type { IndexKey } from "@/types/indexes";
import { WorkerPool, type WorkerPoolOptions } from "./workerPool";

/**
 * Worker pool instance management for NEPSE API operations
 */
let workerPoolInstance: WorkerPool | null = null;

/**
 * Get or create the worker pool instance
 */
export function getWorkerPool(): WorkerPool {
	if (!workerPoolInstance) {
		const defaultOptions: WorkerPoolOptions = {
			minWorkers: 1,
			maxWorkers: 10,
			idleTimeout: 30_000, // 30 seconds
			taskTimeout: 60_000, // 60 seconds
			maxRetries: 3,
			scalingThreshold: 0.8, // Scale when 80% of workers are busy
			logger: {
				log: (message: string) => logger.info(`[WorkerPool] ${message}`),
				warn: (message: string) => logger.warn(`[WorkerPool] ${message}`),
				error: (message: string, error?: unknown) =>
					logger.error(`[WorkerPool] ${message}`, error),
			},
		};

		workerPoolInstance = new WorkerPool(defaultOptions);
	}
	return workerPoolInstance;
}

/**
 * Shutdown the worker pool
 */
export async function shutdownWorkerPool(): Promise<void> {
	if (workerPoolInstance) {
		await workerPoolInstance.shutdown();
		workerPoolInstance = null;
	}
}

/**
 * Get worker pool statistics
 */
export function getWorkerPoolStats() {
	return workerPoolInstance?.getStats() || null;
}

async function get_market_status(): Promise<MarketStatus | null> {
	try {
		return (await getWorkerPool().runTask(
			"get_market_status",
		)) as MarketStatus | null;
	} catch {
		return null;
	}
}

async function getSummary(): Promise<Summary | null> {
	try {
		return (await getWorkerPool().runTask("getSummary")) as Summary | null;
	} catch {
		return null;
	}
}

async function getTopTenTradeScrips(): Promise<TopTradeScrips | null> {
	try {
		return (await getWorkerPool().runTask(
			"getTopTenTradeScrips",
		)) as TopTradeScrips | null;
	} catch {
		return null;
	}
}

async function getTopTenTransactions(): Promise<TopTransaction | null> {
	try {
		return (await getWorkerPool().runTask(
			"getTopTenTransactions",
		)) as TopTransaction | null;
	} catch {
		return null;
	}
}

async function getTopTenTurnover(): Promise<TopTurnover | null> {
	try {
		return (await getWorkerPool().runTask(
			"getTopTenTurnover",
		)) as TopTurnover | null;
	} catch {
		return null;
	}
}

async function getTopGainers(): Promise<TopGainerLoosers | null> {
	try {
		return (await getWorkerPool().runTask(
			"getTopGainers",
		)) as TopGainerLoosers | null;
	} catch {
		return null;
	}
}

async function getTopLoosers(): Promise<TopGainerLoosers | null> {
	try {
		return (await getWorkerPool().runTask(
			"getTopLoosers",
		)) as TopGainerLoosers | null;
	} catch {
		return null;
	}
}

async function getNepseIndex(): Promise<NepseIndex | null> {
	try {
		return (await getWorkerPool().runTask(
			"getNepseIndex",
		)) as NepseIndex | null;
	} catch {
		return null;
	}
}

//works
async function getNepseIndexIntraday(
	index: IndexKey = "NEPSE Index",
): Promise<IndexIntradayData | null> {
	try {
		return (await getWorkerPool().runTask("getNepseIndexIntraday", {
			index,
		})) as IndexIntradayData | null;
	} catch {
		return null;
	}
}
//broken []
async function stockIntraday(
	stock = "NABIL",
): Promise<SecurityDailyChart | null> {
	try {
		return (await getWorkerPool().runTask("stockIntraday", {
			stock,
		})) as SecurityDailyChart | null;
	} catch {
		return null;
	}
}

//works
async function getPriceVolume(): Promise<PriceVolume | null> {
	try {
		return (await getWorkerPool().runTask(
			"getPriceVolume",
		)) as PriceVolume | null;
	} catch {
		return null;
	}
}

async function getSecurityList(): Promise<SecurityList | null> {
	try {
		return (await getWorkerPool().runTask(
			"getSecurityList",
		)) as SecurityList | null;
	} catch {
		return null;
	}
}

async function getCompaniesList(): Promise<CompanyList | null> {
	try {
		return (await getWorkerPool().runTask(
			"getCompaniesList",
		)) as CompanyList | null;
	} catch {
		return null;
	}
}

//works
async function getMarket_depth(
	symbol: string,
): Promise<MarketDepthResponse | null> {
	try {
		return (await getWorkerPool().runTask("getMarket_depth", {
			symbol,
		})) as MarketDepthResponse | null;
	} catch {
		return null;
	}
}

//works
async function getSupplyDemand(): Promise<SupplyDemandData | null> {
	try {
		return (await getWorkerPool().runTask(
			"getSupplyDemand",
		)) as SupplyDemandData | null;
	} catch {
		return null;
	}
}

async function getPriceVolumeHistory(
	symbol: string,
	size = 500,
): Promise<PriceVolumeHistory | null> {
	try {
		return (await getWorkerPool().runTask("getPriceVolumeHistory", {
			symbol,
			size,
		})) as PriceVolumeHistory | null;
	} catch {
		return null;
	}
}

//working
async function getIndexPriceVolumeHistory(
	index: IndexKey,
	size = 500,
): Promise<IndexHistoricalDataArray | null> {
	try {
		return (await getWorkerPool().runTask("getIndexPriceVolumeHistory", {
			index,
			size,
		})) as IndexHistoricalDataArray | null;
	} catch {
		return null;
	}
}

//works
async function getStockDailyPrice(
	symbol: string,
): Promise<StockDailyPriceArray | null> {
	try {
		return (await getWorkerPool().runTask("getStockDailyPrice", {
			symbol,
		})) as StockDailyPriceArray | null;
	} catch {
		return null;
	}
}

//works
async function liveMarketData(): Promise<LiveMarket | null> {
	try {
		return (await getWorkerPool().runTask(
			"liveMarketData",
		)) as LiveMarket | null;
	} catch {
		return null;
	}
}

async function disclosure(): Promise<DisclosureResponse | null> {
	try {
		return (await getWorkerPool().runTask(
			"disclosure",
		)) as DisclosureResponse | null;
	} catch {
		return null;
	}
}

//works
async function get_security_detail(
	symbol: string,
): Promise<SecurityDetailResponse | null> {
	try {
		return (await getWorkerPool().runTask("get_security_detail", {
			symbol,
		})) as SecurityDetailResponse | null;
	} catch {
		return null;
	}
}

export {
	get_market_status,
	get_security_detail,
	getIndexPriceVolumeHistory,
	getMarket_depth,
	getNepseIndex,
	getNepseIndexIntraday,
	getPriceVolume,
	getPriceVolumeHistory,
	getSecurityList,
	getStockDailyPrice,
	disclosure,
	getSummary,
	getSupplyDemand,
	getTopGainers,
	getTopLoosers,
	getTopTenTradeScrips,
	getTopTenTransactions,
	getTopTenTurnover,
	liveMarketData,
	stockIntraday,
	getCompaniesList,
};
