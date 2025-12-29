import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { convex } from "@/convex-client";
import { getIndexPriceVolumeHistory } from "@/lib/nepse/worker";
import { EventType } from "@/types/error-types";
import { type IndexKey, nepseIndexes } from "@/types/indexes";
import type { IndexHistoricalDataArray } from "@/types/nepse";
import Track from "@/utils/analytics";
import { nepseIndexDailySpamKey } from "@/utils/keys/redisKeys";
import { isSpamBlocked, setSpamProtection } from "@/utils/spam-protection";
import { CalculateVersion } from "@/utils/version";
import {
	IndexHistoricalDataArraySchema,
	IndexHistoricalDataResponseSchema,
} from "./types";

export function parseChartArray(
	data: IndexHistoricalDataArray | null | undefined,
): [number, number][] | null {
	const result = IndexHistoricalDataArraySchema.safeParse(data);
	if (!result.success) {
		const message = `Failed to parse index historical data: ${result.error.message}`;
		logger.error(message);

		Track(EventType.NEPSE_API_ERROR, {
			function: "parseChartArray",
			message,
			data,
			error: result.error,
		});

		throw new Error("Invalid data or Nepse API dead again");
	}

	const parsedData = result.data.map(({ businessDate, closingIndex }) => {
		// Reject entries with zero or negative closing index values
		if (closingIndex <= 0) {
			Track(EventType.NEPSE_API_ERROR, {
				function: "parseChartArray",
				message: `Invalid closing index value: ${closingIndex} for date: ${businessDate}`,
				data,
			});

			throw new Error("Invalid data or Nepse API issues again");
		}

		return [
			Math.floor(new Date(businessDate).getTime() / 1000),
			closingIndex,
		] as [number, number];
	});

	return parsedData;
}

export function getFirstAndLastPrice(data: [number, number][]): number {
	return data.at(-1)?.[1] ?? 0;
}

// export async function patchMissingClose(
// 	index: IndexKey,
// 	data: [number, number][],
// ) {
// 	const patchFn =
// 		index === "NEPSE Index" ? getNepseIntraday : () => getIndexData();

// 	const live = await patchFn();
// 	const close =
// 		index === "NEPSE Index"
// 			? (live as IndexIntraday | undefined)?.close
// 			: (live as Record<IndexKeyWithoutNEPSE, IndexData> | undefined)?.[index]
// 					?.close;

// 	if (close) {
// 		const last = data.at(-1);
// 		if (last) {
// 			last[1] = close;
// 		}
// 	}

// 	return close ?? 0;
// }

type IndexDailyResult = {
	success: boolean;
	message: string;
};

export const getIndexDaily = async (
	index: IndexKey,
): Promise<IndexDailyResult> => {
	logger.info("[Cron] Starting getIndexDaily for index:", index);

	if (!nepseIndexes.includes(index)) {
		const message = "Invalid index";
		logger.error(`[getIndexDaily] ${message}: ${index}`);
		return { success: false, message };
	}

	// Check and set spam protection for this index
	const spamKey = nepseIndexDailySpamKey(index);
	const blocked = await isSpamBlocked(spamKey);

	if (blocked) {
		return { success: false, message: "Please try again later" };
	}

	try {
		// Single network call to get chart info and API data in parallel
		const [chartInfo, rawData] = await Promise.all([
			convex.query(api.indexChart.getLastTimestamp, {
				index,
				timeframe: "1d",
			}),
			//working
			getIndexPriceVolumeHistory(index),
		]);

		if (!rawData) {
			const message = "Failed to fetch index data";
			logger.error(`[getIndexDaily] ${message} for index: ${index}`);

			Track(EventType.NEPSE_API_ERROR, {
				function: "getIndexDaily",
				index,
				message: "No data received from Nepse API",
			});

			return { success: false, message };
		}

		let parsedArray: [number, number][] | null;
		try {
			parsedArray = parseChartArray(rawData);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";

			logger.error(message);
			Track(EventType.NEPSE_API_ERROR, {
				function: "getIndexDaily_parseChartArray",
				index,
				error,
				data: rawData,
			});
			return { success: false, message };
		}

		if (!parsedArray) {
			const message = "No valid data found";
			logger.warn(`${message} for ${index}`);
			return { success: false, message };
		}

		// Combined filtering and processing in single pass
		const lastTimestamp = chartInfo?.lastTimestamp;
		const newData: [number, number][] = [];

		if (!lastTimestamp) {
			// No data in convex, ingest all incoming data
			for (const [timestamp, value] of parsedArray) {
				newData.push([timestamp, value]);
			}
		} else {
			// Only ingest new data
			for (const [timestamp, value] of parsedArray) {
				if (timestamp > lastTimestamp) {
					newData.push([timestamp, value]);
				}
			}
		}

		// Calculate version only on new data
		const version = CalculateVersion(newData);

		// Direct validation on final data structure
		const validatedData = IndexHistoricalDataResponseSchema.parse({
			index,
			data: newData,
			version,
			timeframe: "1d",
		});

		if (!validatedData) {
			const message = "Validation failed for response data";
			logger.warn(`${message} for ${index}`);

			Track(EventType.SCHEMA_VALIDATION_FAILED, {
				function: "getIndexDaily",
				index,
				data: validatedData,
			});

			return { success: false, message };
		}

		// Single database operation
		await convex.mutation(api.indexChart.patchChart, validatedData);

		const message = `Updated ${index} with ${newData.length} new data points`;
		setSpamProtection(spamKey, index, 600);

		return { success: true, message };
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Unknown error";
		logger.error(`Error at getIndexDaily for ${index}: ${message}`);

		Track(EventType.EXCEPTION, {
			function: "getIndexDaily",
			index,
			message,
			error,
		});

		return { success: false, message: "An error occurred" };
	}
};
