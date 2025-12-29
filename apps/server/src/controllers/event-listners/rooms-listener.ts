import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { captureException } from "@sentry/bun";
import { convex } from "@/convex-client";
import { EventType } from "@/types/error-types";
import { type IndexKey, indexKeySchema } from "@/types/indexes";
import Track from "@/utils/analytics";
import { getStockDaily } from "../companies-daily-chart";
import { getStockIntraday } from "../companies-intraday-chart";
import { getIndexDaily } from "../index-daily-chart";
import { indexIntradayChart } from "../index-intraday-chart";
import { marketDepth } from "../market-depth";

const delayInMS = 3000;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface RoomsData {
	stockCharts: string[];
	indexCharts: string[];
	marketDepth: string[];
}

let previousData: RoomsData = {
	stockCharts: [],
	indexCharts: [],
	marketDepth: [],
};

let isProcessing = false;

/**
 * Detects newly added items by comparing current data with previous data
 */
function detectNewItems(current: string[], previous: string[]): string[] {
	return current.filter((item) => !previous.includes(item));
}

/**
 * Processes newly added stock charts by fetching intraday and daily data
 */
async function processNewStockCharts(newStocks: string[]): Promise<void> {
	if (newStocks.length === 0) return;

	logger.info(
		`[RoomsListener] Processing ${newStocks.length} newly added stock(s)`,
		{ stocks: newStocks },
	);

	for (const stock of newStocks) {
		try {
			logger.info(`[RoomsListener] Fetching data for stock: ${stock}`);
			await getStockIntraday(stock);
			await delay(delayInMS);
			await getStockDaily(stock); // to be replaced with fetchOhlcData
			await delay(delayInMS);
			// await fetchOhlcData(stock, "1D", "stock"); //main
			// await delay(delayInMS);
			// await fetchOhlcData(stock, "60", "stock"); // main
			// await delay(delayInMS);
			logger.info(
				`[RoomsListener] Successfully fetched data for stock: ${stock}`,
			);
		} catch (error) {
			logger.error(
				`[RoomsListener] Error fetching data for stock ${stock}:`,
				error,
			);
			captureException(error);
		}
	}
}

/**
 * Processes newly added index charts by fetching daily and intraday data
 */
async function processNewIndexCharts(newIndexes: string[]): Promise<void> {
	if (newIndexes.length === 0) return;

	logger.info(
		`[RoomsListener] Processing ${newIndexes.length} newly added index(es)`,
		{ indexes: newIndexes },
	);

	for (const index of newIndexes) {
		try {
			logger.info(`[RoomsListener] Fetching data for index: ${index}`);
			await getIndexDaily(index as IndexKey);
			await delay(delayInMS);
			await indexIntradayChart(index as IndexKey); // to be replaced with fetchOhlcData
			await delay(delayInMS);
			// await fetchOhlcData(index, "1D", "index"); //main
			// await delay(delayInMS);
			// await fetchOhlcData(index, "60", "index"); // main
			// await delay(delayInMS);
			logger.info(
				`[RoomsListener] Successfully fetched data for index: ${index}`,
			);
		} catch (error) {
			logger.error(
				`[RoomsListener] Error fetching data for index ${index}:`,
				error,
			);
			captureException(error);
		}
	}
}

/**
 * Processes newly added market depth items
 */
async function processNewMarketDepth(newSymbols: string[]): Promise<void> {
	if (newSymbols.length === 0) return;

	logger.info(
		`[RoomsListener] Processing ${newSymbols.length} newly added market depth symbol(s)`,
		{ symbols: newSymbols },
	);

	for (const symbol of newSymbols) {
		try {
			logger.info(`[RoomsListener] Fetching market depth for: ${symbol}`);
			await marketDepth(symbol);
			await delay(delayInMS);
			logger.info(
				`[RoomsListener] Successfully fetched market depth for: ${symbol}`,
			);
		} catch (error) {
			logger.error(
				`[RoomsListener] Error fetching market depth for ${symbol}:`,
				error,
			);
			captureException(error);
		}
	}
}

/**
 * Handles updates from the rooms query
 */
async function handleRoomsUpdate(data: RoomsData): Promise<void> {
	// Prevent concurrent processing
	if (isProcessing) {
		logger.info("[RoomsListener] Already processing an update, skipping...");
		return;
	}

	isProcessing = true;

	try {
		// Detect newly added items
		const newStockCharts = detectNewItems(
			data.stockCharts,
			previousData.stockCharts,
		);
		const newIndexCharts = detectNewItems(
			data.indexCharts,
			previousData.indexCharts,
		);
		const newMarketDepth = detectNewItems(
			data.marketDepth,
			previousData.marketDepth,
		);

		const hasNewItems =
			newStockCharts.length > 0 ||
			newIndexCharts.length > 0 ||
			newMarketDepth.length > 0;

		if (hasNewItems) {
			logger.info("[RoomsListener] Detected new items:", {
				newStockCharts: newStockCharts.length,
				newIndexCharts: newIndexCharts.length,
				newMarketDepth: newMarketDepth.length,
			});

			// Process all new items
			await Promise.all([
				processNewStockCharts(newStockCharts),
				processNewIndexCharts(newIndexCharts),
				processNewMarketDepth(newMarketDepth),
			]);

			logger.info("[RoomsListener] Completed processing all new items");
		}

		// Update previous data for next comparison
		previousData = {
			stockCharts: [...data.stockCharts],
			indexCharts: [...data.indexCharts],
			marketDepth: [...data.marketDepth],
		};
	} catch (error) {
		logger.error("[RoomsListener] Error handling rooms update:", error);
		captureException(error);
	} finally {
		isProcessing = false;
	}
}

/**
 * Starts listening to rooms query changes
 */
export async function startRoomsListener(): Promise<void> {
	logger.info("[RoomsListener] Starting rooms listener");

	try {
		// Initialize previousData with current state to avoid treating existing items as "new" on startup
		const initialData = await convex.query(api.rooms.getUniqueItems, {});
		previousData = {
			stockCharts: [...initialData.stockCharts],
			indexCharts: [...initialData.indexCharts],
			marketDepth: [...initialData.marketDepth],
		};

		logger.info("[RoomsListener] Initialized with existing state:", {
			stockCharts: previousData.stockCharts.length,
			indexCharts: previousData.indexCharts.length,
			marketDepth: previousData.marketDepth.length,
		});

		// Watch for changes in the rooms query using Convex onUpdate
		convex.onUpdate(api.rooms.getUniqueItems, {}, async (data) => {
			if (data) {
				await handleRoomsUpdate(data);
			}
		});

		logger.info("[RoomsListener] Successfully started rooms listener");
	} catch (error) {
		logger.error("[RoomsListener] Error starting rooms listener:", error);
		captureException(error);
	}
}

export async function getAllIntradayStockCharts(): Promise<void> {
	const companies = await convex.query(api.companyNames.getAllStockNames, {});

	for (const company of companies) {
		try {
			logger.info(
				`[IntradayChartOfTheDay] Fetching intraday chart of the day for: ${company.symbol}`,
			);
			await getStockIntraday(company.symbol);
			await delay(delayInMS);
			logger.info(
				`[IntradayChartOfTheDay] Successfully fetched intraday chart of the day for: ${company.symbol}`,
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);

			logger.info(message);

			Track(EventType.NEPSE_API_ERROR, {
				function: "getAllCompaniesIntradayChartOfTheDay",
				symbol: company.symbol,
				message,
				error,
			});
		}
	}
}

export async function getAllDailyIndexCharts(): Promise<void> {
	for (const indexKey of indexKeySchema.options) {
		try {
			logger.info(
				`[getAllDailyIndexCharts] Fetching daily chart of the day for: ${indexKey}`,
			);
			await getIndexDaily(indexKey);
			await delay(delayInMS);
			logger.info(
				`[getAllDailyIndexCharts] Successfully fetched daily chart of the day for: ${indexKey}`,
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);

			logger.info(message);

			Track(EventType.NEPSE_API_ERROR, {
				function: "getAllDailyIndexCharts",
				symbol: indexKey,
				message,
				error,
			});
		}
	}
}
