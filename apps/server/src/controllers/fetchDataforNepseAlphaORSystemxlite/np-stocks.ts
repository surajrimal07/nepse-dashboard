import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { convex } from "@/convex-client";
import { EventType } from "@/types/error-types";
import type { Timeframe } from "@/types/timeframe";
import Track from "@/utils/analytics";

import { ohlcApiSchema, type response } from "./schema";

// map from these
// export const internalSector = v.union(
//     v.literal("Banking SubIndex"),
//     v.literal("Investment"),
//     v.literal("Mutual Fund"),
//     v.literal("Others Index"),
//     v.literal("Manufacturing And Pr."),
//     v.literal("Life Insurance"),
//     v.literal("Non Life Insurance"),
//     v.literal("Finance Index"),
//     v.literal("Development Bank Ind."),
//     v.literal("Hotels And Tourism"),
//     v.literal("Microfinance Index"),
//     v.literal("Trading Index"),
//     v.literal("HydroPower Index"),
//     v.literal("Promoter Share"),
// );

//to for incoming symbol if its type = index

// map these
//NEPSE Index  to NEPSE_index
// Banking SubIndex            to Banking_index
//    Development Bank Ind.            to Development%20Bank_index
//Finance Index to Finance_index
// Hotels And Tourism  to Hotels%20and%20Tourism_index
// HydroPower Index     to HydroPower_index
//    to Life%20Insurance_index
// to Manu.%26%20Pro._index
// to Microfinance_index
// to Non%20Life%20Insurance_index
//   to Others_index
// to Trading_index

// to Mutual%20Fund_index
//   to Investment_index
// Mapping for incoming index names to desired symbol names
const indexNameMap: Record<string, string> = {
	"NEPSE Index": "NEPSE_index",
	"Banking SubIndex": "Banking_index",
	"Development Bank Ind.": "Development%20Bank_index",
	"Finance Index": "Finance_index",
	"Hotels And Tourism": "Hotels%20and%20Tourism_index",
	"HydroPower Index": "HydroPower_index",
	"Life Insurance": "Life%20Insurance_index",
	"Manufacturing And Pr.": "Manu.%26%20Pro._index",
	"Microfinance Index": "Microfinance_index",
	"Non Life Insurance": "Non%20Life%20Insurance_index",
	"Others Index": "Others_index",
	"Trading Index": "Trading_index",
	"Mutual Fund": "Mutual%20Fund_index",
	Investment: "Investment_index",
};

export const fetchnpstocks = async (
	symbolIndex: string,
	timeFrame: Timeframe,
	force = false,
	type: "index" | "stock" = "index",
): Promise<response> => {
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
			from = 1678940500;
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
			from = lastTime !== undefined && lastTime !== 0 ? lastTime : 1678940500;
			to = now;

			if (to <= from) {
				return { success: true, message: "No new data to fetch" };
			}
		} else {
			return { success: false, message: "Unsupported timeframe" };
		}
	}

	try {
		const fetchResponse = await fetch(
			`https://api.npstocks.com/tv/tv/history?symbol=${mappedSymbolIndex}&resolution=${timeFrame}&from=${from}&to=${to}&countback=18`,
			{
				headers: {
					accept: "*/*",
					"accept-language": "en-US,en;q=0.9,ne;q=0.8",
					"if-none-match": 'W/"107d7-CkFswx0Zr81sX6ZUbikPAlgnJBA"',
					"sec-ch-ua":
						'"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
					"sec-ch-ua-mobile": "?0",
					"sec-ch-ua-platform": '"Windows"',
					"sec-fetch-dest": "empty",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "same-site",
					"sec-gpc": "1",
					Referer: "https://chart.npstocks.com/",
					"Referrer-Policy": "strict-origin-when-cross-origin",
				},
				method: "GET",
			},
		);

		const data = await JSON.parse(await fetchResponse.text());

		if (data.s === "no_data") {
			return { success: true, message: "Data is up to date" };
		}

		// check s field it should be 'ok'
		if (data.s !== "ok") {
			Track(EventType.NEPSE_API_ERROR, {
				function: "fetchnpstocks",
				symbolIndex,
				message: "Response status not ok",
			});
			return { success: false, message: "Invalid data recieved from server" };
		}

		// Validate data against ohlcApiSchema
		let parsedData = null;
		try {
			parsedData = ohlcApiSchema.parse(data);
		} catch (validationError) {
			const message = `npstocks.com API data validation failed for ${symbolIndex} (${timeFrame}): ${
				validationError instanceof Error
					? validationError.message
					: String(validationError)
			}`;

			logger.warn(`[fetchnpstocks] ${message}`);

			Track(EventType.NEPSE_API_ERROR, {
				function: "fetchnpstocks",
				symbolIndex,
				message,
			});
			return { success: false, message: "Invalid data recieved from server" };
		}

		// Transform parsedData (object of arrays) to array of objects for convex
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
			`Fetched ${ohlcArray.length} new data points for ${symbolIndex} in timeframe ${timeFrame}`,
		);

		await convex.mutation(api.ohlc.upsertOHLCData, dataInjest);

		return { success: true, message: "Data fetched successfully" };
	} catch (error) {
		logger.warn(`Fetching data from npstocks.com failed ${error}`);

		Track(EventType.EXCEPTION, {
			function: "fetchnpstocks",
			symbolIndex,
			message: "Fetching data failed",
			error,
		});

		return {
			success: false,
			message: "Fetching data failed",
		};
	}
};
