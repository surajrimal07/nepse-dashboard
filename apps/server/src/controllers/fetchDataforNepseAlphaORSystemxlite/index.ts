import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { convex } from "@/convex-client";
import { EventType } from "@/types/error-types";
import type { Timeframe } from "@/types/timeframe";
import Track from "@/utils/analytics";
import { stockOHLCKey } from "@/utils/keys/redisKeys";
import { isSpamBlocked } from "@/utils/spam-protection";
import { fetchNaasaX } from "./naasax";
import { fetchnpstocks } from "./np-stocks";
import type { response } from "./schema";

export const fetchMissingOHLCData = async (
	timeFrame: Timeframe,
	type: "index" | "stock" = "index",
): Promise<response> => {
	try {
		let missing: string[] = [];

		if (type === "index") {
			missing = await convex.query(api.ohlc.existingIndexOHLC, {
				timeframe: timeFrame,
			});
		} else {
			missing = await convex.query(api.ohlc.existingStockOHLC, {
				timeframe: timeFrame,
			});
		}

		let successCount = 0;
		let failureCount = 0;

		for (const symbol of missing) {
			const spamKey = stockOHLCKey(symbol, timeFrame);
			const blocked = await isSpamBlocked(spamKey);

			if (blocked) {
				failureCount += 1;
				continue;
			}

			logger.info(
				`[fetchMissingOHLCData] Fetching missing OHLC data for symbol: ${symbol}`,
			);

			const res = await fetchnpstocks(symbol, timeFrame, true);
			if (res?.success) {
				successCount += 1;
			} else {
				logger.warn(
					`[fetchMissingOHLCData] fetchnpstocks failed for ${symbol}, trying Naasa fallback`,
				);
				try {
					const fallback = await fetchNaasaX(symbol, timeFrame, true);
					if (fallback?.success) {
						successCount += 1;
					} else {
						failureCount += 1;
						logger.warn(
							`[fetchMissingOHLCData] Naasa fallback also failed for ${symbol}`,
						);
					}
				} catch (err) {
					failureCount += 1;
					logger.error(
						`[fetchMissingOHLCData] Error running Naasa fallback for ${symbol}: ${err}`,
					);
				}
			}

			await new Promise((resolve) => setTimeout(resolve, 5000));
		}

		return {
			success: true,
			message: `Completed fetching missing data: ${successCount} succeeded, ${failureCount} failed`,
		};
	} catch (error) {
		const message = `Error fetching missing OHLC data for timeframe ${timeFrame}: ${error}`;

		logger.error(message);

		Track(EventType.OHLC_FETCH_ERROR, {
			timeFrame,
			error: message,
		});

		return { success: false, message: "Error fetching missing OHLC data" };
	}
};

export const fetchOhlcData = async (
	symbol: string,
	timeFrame: Timeframe,
	type: "index" | "stock" = "index",
): Promise<response> => {
	try {
		const spamKey = stockOHLCKey(symbol, timeFrame);
		const blocked = await isSpamBlocked(spamKey);

		if (blocked) {
			return { success: false, message: "Please try again later" };
		}

		const res = await fetchnpstocks(symbol, timeFrame, false, type);

		if (res?.success) {
			return res;
		} else {
			logger.warn(
				`[fetchOhlcData] fetchnpstocks failed for ${symbol}, trying Naasa fallback`,
			);
			try {
				const fallback = await fetchNaasaX(symbol, timeFrame, false, type);
				if (fallback?.success) {
					return fallback;
				} else {
					logger.warn(
						`[fetchOhlcData] Naasa fallback also failed for ${symbol}`,
					);
					return fallback;
				}
			} catch (err) {
				logger.error(
					`[fetchOhlcData] Error running Naasa fallback for ${symbol}: ${err}`,
				);
				return {
					success: false,
					message: "An error occured, please try again later",
				};
			}
		}
	} catch (error) {
		const message = `Error fetching OHLC data for ${symbol} (${timeFrame}): ${error}`;
		logger.error(message);

		Track(EventType.OHLC_FETCH_ERROR, {
			symbol,
			timeFrame,
			error: message,
		});

		return {
			success: false,
			message: "An error occured, please try again later",
		};
	}
};

// export const fetchDataforNepseAlphaORSystemxlite = async (
// 	symbolIndex: string,
// 	timeFrame: string,
// 	fromEpochTime: number,
// 	currentEpochTime: number,
// 	force_key: string,
// ) => {
// 	let response: {
// 		t: number[];
// 		o: number[];
// 		h: number[];
// 		l: number[];
// 		c: number[];
// 		v: number[];
// 	};
// 	try {
// 		const fetchResponse = await fetch(
// 			`https://api.npstocks.com/tv/tv/history?symbol=${symbolIndex}&resolution=${timeFrame}&from=${fromEpochTime}&to=${currentEpochTime}&countback=18`,
// 			{
// 				headers: {
// 					accept: "*/*",
// 					"accept-language": "en-US,en;q=0.9,ne;q=0.8",
// 					"if-none-match": 'W/"107d7-CkFswx0Zr81sX6ZUbikPAlgnJBA"',
// 					"sec-ch-ua":
// 						'"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
// 					"sec-ch-ua-mobile": "?0",
// 					"sec-ch-ua-platform": '"Windows"',
// 					"sec-fetch-dest": "empty",
// 					"sec-fetch-mode": "cors",
// 					"sec-fetch-site": "same-site",
// 					"sec-gpc": "1",
// 					Referer: "https://chart.npstocks.com/",
// 					"Referrer-Policy": "strict-origin-when-cross-origin",
// 				},
// 				method: "GET",
// 			},
// 		);
// 		response = await fetchResponse.json();

// 		if (!(response && isValidData(response))) {
// 			Track(EventType.NEPSE_API_ERROR, {
// 				function: "fetchDataforNepseAlphaORSystemxlite",
// 				symbolIndex,
// 			});

// 			throw new Error("Invalid data recieved from npstocks.com");
// 		}
// 	} catch (error) {
// 		logger.warn(
// 			`Fetching data from npstocks.com failed. Trying nepsealpha.com ${error}`,
// 		);

// 		const fetchResponse = await fetch(
// 			`https://www.nepsealpha.com/trading/1/history?force_key=${force_key}&symbol=${symbolIndex}&resolution=${timeFrame}&pass=ok&fs=${force_key}`,
// 			{
// 				headers: {
// 					accept: "application/json, text/plain, */*",
// 					"sec-ch-ua":
// 						'"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
// 					"sec-ch-ua-arch": '"x86"',
// 					"sec-ch-ua-bitness": '"64"',
// 					"sec-ch-ua-full-version": '"124.0.2478.67"',
// 					"sec-ch-ua-full-version-list":
// 						'"Chromium";v="124.0.6367.91", "Microsoft Edge";v="124.0.2478.67", "Not-A.Brand";v="99.0.0.0"',
// 					"sec-ch-ua-mobile": "?0",
// 					"sec-ch-ua-model": '""',
// 					"sec-ch-ua-platform": '"Windows"',
// 					"sec-ch-ua-platform-version": '"15.0.0"',
// 					"x-requested-with": "XMLHttpRequest",
// 					Referer: "https://www.nepsealpha.com/trading/chart?symbol=NEPSE",
// 					"Referrer-Policy": "strict-origin-when-cross-origin",
// 				},
// 				method: "GET",
// 			},
// 		);
// 		response = await fetchResponse.json();

// 		Track(EventType.NEPSE_API_ERROR, {
// 			function: "fetchDataforNepseAlphaORSystemxlite_fallback",
// 			symbolIndex,
// 			error,
// 		});
// 	}

// 	return response;
// };
