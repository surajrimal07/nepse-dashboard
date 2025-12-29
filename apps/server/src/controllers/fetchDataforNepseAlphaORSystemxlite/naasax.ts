import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@sentry/bun";
import { convex } from "@/convex-client";
import { EventType } from "@/types/error-types";
import type { Timeframe } from "@/types/timeframe";
import Track from "@/utils/analytics";
import { ohlcApiSchema } from "./schema";

const indexNameMap: Record<string, string> = {
	"NEPSE Index": "NEPSE",
	"Banking SubIndex": "BANKSUBIND",
	"Development Bank Ind.": "DEVBANKIND",
	"Finance Index": "FININD",
	"Hotels And Tourism": "HOTELIND",
	"HydroPower Index": "HYDPOWIND",
	"Life Insurance": "LIFINSIND",
	"Manufacturing And Pr.": "MANPROCIND",
	"Microfinance Index": "MICRFININD",
	"Non Life Insurance": "NONLIFIND",
	"Others Index": "OTHERSIND",
	"Trading Index": "Trading",
	"Mutual Fund": "Mutual%20Fund",
	Investment: "INVIDX",
};

export const fetchNaasaX = async (
	symbolIndex: string,
	timeFrame: Timeframe,
	force: boolean = false,
	type: "index" | "stock" = "index",
): Promise<{ success: boolean; message: string }> => {
	let mappedSymbolIndex = symbolIndex;
	if (type === "index" && indexNameMap[symbolIndex]) {
		mappedSymbolIndex = indexNameMap[symbolIndex];
	}

	let to: number;
	let from: number;
	const now = Math.floor(Date.now() / 1000);

	if (force) {
		if (timeFrame === "1D") {
			from = 1022284800;
			to = now;
		} else if (timeFrame === "60") {
			from = 1763902466;
			to = now;
		} else {
			return { success: false, message: "Unsupported timeframe" };
		}
	} else {
		let lastTime = await convex.query(api.ohlc.getFinalizedTime, {
			symbol: symbolIndex,
			timeframe: timeFrame,
		});

		// i mistakenly added milliseconds time instead of epoch seconds
		if (typeof lastTime === "number" && lastTime.toString().length === 13) {
			// handle if lastTime is a number in milliseconds
			lastTime = Math.floor(lastTime / 1000);
		}

		if (timeFrame === "1D") {
			from = lastTime !== undefined && lastTime !== 0 ? lastTime : 1022284800;
			to = now;

			if (to <= from) {
				return { success: true, message: "No new data to fetch" };
			}
		} else if (timeFrame === "60") {
			from = lastTime !== undefined && lastTime !== 0 ? lastTime : 1763902466;
			to = now;

			if (to <= from) {
				return { success: true, message: "No new data to fetch" };
			}
		} else {
			return { success: false, message: "Unsupported timeframe" };
		}
	}

	try {
		const url = `https://api-charts.naasasecurities.com.np/api/v1/datafeed/1/history?symbol=${mappedSymbolIndex}&resolution=${timeFrame}&from=${from}&to=${to}&countback=329`;

		const fetchResponse = await fetch(url, {
			headers: {
				accept: "*/*",
				"accept-language": "en-US,en;q=0.9",
				"cache-control": "no-cache",
				pragma: "no-cache",
				priority: "u=1, i",
				"sec-ch-ua":
					'"Microsoft Edge";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": '"Windows"',
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-site",
			},
			referrer: "https://charts.naasasecurities.com.np/",
			method: "GET",
			mode: "cors",
			credentials: "omit",
		});

		const data = await fetchResponse.json();

		if (data.s === "no_data") {
			return { success: true, message: "Data is up to date" };
		}

		if (data.s !== "ok") {
			Track(EventType.NEPSE_API_ERROR, {
				function: "fetchNepseAlphaStocks",
				symbolIndex,
				message: "Response status not ok from Naasa",
			});
			return { success: false, message: "Invalid status received" };
		}

		// Validate against ohlcApiSchema
		let parsedData = null;
		try {
			parsedData = ohlcApiSchema.parse(data);
		} catch (validationError) {
			const message = `Naasa API data validation failed for ${symbolIndex} (${timeFrame}): ${
				validationError instanceof Error
					? validationError.message
					: String(validationError)
			}`;

			logger.warn(`[fetchNepseAlphaStocks] ${message}`);

			Track(EventType.OHLC_FETCH_ERROR, {
				function: "fetchNepseAlphaStocks",
				symbolIndex,
				message,
			});

			return { success: false, message: "Data validation failed" };
		}

		const length = parsedData.t.length;
		const ohlcArray = Array.from({ length }, (_, i) => ({
			t: parsedData.t[i],
			c: parsedData.c[i],
			o: parsedData.o[i],
			h: parsedData.h[i],
			l: parsedData.l[i],
			v: parsedData.v[i],
			s: parsedData.s,
		}));

		const lastFinalizedTime = ohlcArray[ohlcArray.length - 1].t;

		const dataInjest = {
			symbol: symbolIndex,
			timeframe: timeFrame,
			data: ohlcArray,
			lastFinalizedTime,
		};

		logger.info(
			`[fetchNepseAlphaStocks] Fetched ${ohlcArray.length} new data points for ${symbolIndex} in timeframe ${timeFrame}`,
		);

		await convex.mutation(api.ohlc.upsertOHLCData, dataInjest);

		return { success: true, message: "Data fetched successfully" };
	} catch (error) {
		logger.warn(
			`[fetchNepseAlphaStocks] Fetching data from Naasa failed ${error}`,
		);
		Track(EventType.EXCEPTION, {
			function: "fetchNepseAlphaStocks",
			symbolIndex,
			message: "Fetching data failed",
			error,
		});
		return { success: false, message: "Fetching data failed" };
	}
};
