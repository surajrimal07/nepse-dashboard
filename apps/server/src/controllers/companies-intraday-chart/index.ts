import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { convex } from "@/convex-client";
import { stockIntraday } from "@/lib/nepse/worker";
import { EventType } from "@/types/error-types";
import Track from "@/utils/analytics";
import { stockIntradaySpamKey } from "@/utils/keys/redisKeys";
import { isSpamBlocked, setSpamProtection } from "@/utils/spam-protection";
import { isStockValid } from "@/utils/stock-mapper";
import { CalculateVersion } from "@/utils/version";
import { IntradayStockChartResponse, stockIntradayType } from "./types";

type StockIntradayResult = {
	success: boolean;
	message: string;
};

//Stock Intraday Chart
export const getStockIntraday = async (
	symbol: string,
): Promise<StockIntradayResult> => {
	logger.info("[Cron] Starting getStockIntraday for symbol:", symbol);

	if (!(symbol && isStockValid(symbol))) {
		const message = "Symbol is required or invalid";
		logger.error(`[stockIntraday] ${message}`);
		return { success: false, message };
	}

	const spamKey = stockIntradaySpamKey(symbol);
	const blocked = await isSpamBlocked(spamKey);

	if (blocked) {
		return { success: false, message: "Please try again later" };
	}

	try {
		// Single network call to get chart info and API data in parallel
		const [chartInfo, data] = await Promise.all([
			convex.query(api.company.getLastTimestamp, {
				symbol,
				timeframe: "1m",
			}),
			stockIntraday(symbol),
		]);

		if (!data) {
			return { success: false, message: "Failed to fetch intraday data" };
		}

		// Fast validation and early parsing - fail fast approach
		const tryParse = stockIntradayType.safeParse(data);
		if (!tryParse.success) {
			const message = `Failed to parse data: ${tryParse.error.message}`;
			logger.error(message);

			Track(EventType.NEPSE_API_ERROR, {
				function: "getStockIntraday",
				symbol,
				message: "No data received from Nepse API",
				data,
			});

			return {
				success: false,
				message: "Invalid data or Nepse API dead again",
			};
		}

		// Combined parsing and filtering in single pass - reduce memory allocations
		const lastTimestamp = chartInfo?.lastTimestamp;
		const newData: [number, number][] = [];

		if (!lastTimestamp) {
			// No data in convex, ingest all incoming data
			for (const item of tryParse.data) {
				newData.push([item.time, item.contractRate]);
			}
		} else {
			// Only ingest new data
			for (const item of tryParse.data) {
				if (item.time > lastTimestamp) {
					newData.push([item.time, item.contractRate]);
				}
			}
		}

		// Calculate version only on new data
		const version = CalculateVersion(newData);

		// Direct validation on final data structure - skip intermediate objects
		const validatedData = IntradayStockChartResponse.safeParse({
			symbol,
			data: newData,
			version,
			timeframe: "1m",
		});

		if (!validatedData.success) {
			const message = `Response validation failed: ${validatedData.error.message}`;
			logger.error(message);

			Track(EventType.SCHEMA_VALIDATION_FAILED, {
				function: "getStockIntraday",
				symbol,
				message,
				data: validatedData.data,
				error: validatedData.error,
			});

			return { success: false, message: "Data validation failed" };
		}

		// Single database operation
		await convex.mutation(api.company.patchChart, validatedData.data);

		const message = `Updated ${symbol} with ${newData.length} new data points`;
		logger.info(message);

		setSpamProtection(spamKey, symbol, 30);

		return { success: true, message: `${symbol} updated successfully` };
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Unknown error";
		logger.error(`Error at stock Intraday Chart: ${message}`);

		Track(EventType.EXCEPTION, {
			function: "getStockIntraday",
			symbol,
			message,
			error,
		});

		return { success: false, message: "An error occurred" };
	}
};
