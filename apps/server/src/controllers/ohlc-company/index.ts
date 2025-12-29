import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { convex } from "@/convex-client";
import { getStockDailyPrice } from "@/lib/nepse/worker";
import { EventType } from "@/types/error-types";
import Track from "@/utils/analytics";
import { stockDailySpamKey } from "@/utils/keys/redisKeys";
import { isSpamBlocked, setSpamProtection } from "@/utils/spam-protection";
import { isStockValid } from "@/utils/stock-mapper";
import { CalculateVersion } from "@/utils/version";
import {
	StockDailyPriceArraySchema,
	StockDailyPriceResponseSchema,
} from "./types";

type StockDailyResult = {
	success: boolean;
	message: string;
};

//get stock daily chart
export const getStockDaily = async (
	symbol: string,
): Promise<StockDailyResult> => {
	logger.info("[Cron] Starting getStockDaily for symbol:", symbol);

	if (!(symbol && isStockValid(symbol))) {
		const message = "Symbol is required or invalid";
		logger.error(`[stockDailyChart] ${message}`);
		return { success: false, message };
	}

	// Check and set spam protection for this symbol
	const spamKey = stockDailySpamKey(symbol);
	const blocked = await isSpamBlocked(spamKey);

	if (blocked) {
		return { success: false, message: "Please try again later" };
	}

	const now = Math.floor(Date.now() / 1000);

	try {
		// Single network call to get chart info and API data in parallel
		const [chartInfo, data] = await Promise.all([
			convex.query(api.company.getLastTimestamp, {
				symbol,
				timeframe: "1d",
			}),
			getStockDailyPrice(symbol),
		]);

		if (!data) {
			Track(EventType.NEPSE_API_ERROR, {
				function: "getStockDaily",
				symbol,
				message: "No data received from Nepse API",
			});

			return { success: false, message: "Failed to fetch stock data" };
		}

		// Fast validation and early parsing - fail fast approach
		const tryParse = StockDailyPriceArraySchema.safeParse(data);
		if (!tryParse.success) {
			const message = `Failed to parse data: ${tryParse.error.message}`;
			logger.error(message);

			Track(EventType.NEPSE_API_ERROR, {
				function: "getStockDaily",
				symbol,
				message,
				data,
				error: tryParse.error,
			});
			return { success: false, message };
		}

		// Combined parsing and filtering in single pass - reduce memory allocations
		const lastTimestamp = chartInfo?.lastTimestamp;
		const newData: [number, number][] = [];

		if (!lastTimestamp) {
			// No data in convex, ingest all incoming data
			for (const item of tryParse.data) {
				const timestamp = Math.floor(
					new Date(item.businessDate).getTime() / 1000,
				);
				newData.push([timestamp, item.closePrice]);
			}
		} else {
			// Only ingest new data
			for (const item of tryParse.data) {
				const timestamp = Math.floor(
					new Date(item.businessDate).getTime() / 1000,
				);
				if (timestamp > lastTimestamp) {
					newData.push([timestamp, item.closePrice]);
				}
			}
		}

		// Early exit if no new data
		if (newData.length === 0) {
			const message = "No new data to update";
			logger.info(`${message} for ${symbol}`);
			return { success: true, message };
		}

		// Calculate version only on new data
		const version = CalculateVersion(newData);

		// Direct validation on final data structure - skip intermediate objects
		const validatedData = StockDailyPriceResponseSchema.safeParse({
			symbol,
			data: newData,
			version,
			timeframe: "1d",
		});

		if (!validatedData.success) {
			const message = `Response validation failed: ${validatedData.error.message}`;
			logger.error(message);

			Track(EventType.SCHEMA_VALIDATION_FAILED, {
				function: "getStockDaily",
				symbol,
				message,
				data: validatedData.data,
				error: validatedData.error,
			});

			return {
				success: false,
				message: "Data validation error, Please contact support.",
			};
		}

		// Single database operation
		await convex.mutation(api.company.patchChart, validatedData.data);

		const message = `Updated ${symbol} with ${newData.length} new data points.`;
		logger.info(message);

		setSpamProtection(spamKey, symbol, 600);

		return { success: true, message };
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		logger.error(`Error at getStockDaily: ${message}`);

		Track(EventType.EXCEPTION, {
			function: "getStockDaily",
			symbol,
			message,
			error,
		});

		return { success: false, message: " An error occurred" };
	}
};
