import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { convex } from "@/convex-client";
import { redis } from "@/redis-client";
import { EventType } from "@/types/error-types";
import type { IndexKey } from "@/types/indexes";
import type { SectorAdvanceDecline } from "@/types/nepse";
import Track from "@/utils/analytics";
import { chukulHeaders } from "@/utils/headers";
import { allIndexDataKey } from "@/utils/keys/redisKeys";
import { formatTurnover } from "@/utils/time";
import { CalculateVersion } from "@/utils/version";
import { calculateAllAdvanceDeclineData } from "../utils/calculateAD";
import {
	type ChukulIndexResponse,
	chukulIndexDataSchema,
	chukulIndexResponse,
	type IndexData,
} from "./types";

// Pre-computed constants
const DEFAULT_AD_LINE = { advance: 0, decline: 0, neutral: 0 } as const;
const GREEN_COLOR = "#00ff00" as const;
const RED_COLOR = "#ef4444" as const;
const CHUKUL_API_URL =
	"https://chukul.com/api/data/intrahistorydata/performance/?type=index" as const;

// Utility function for error handling
function handleError(error: unknown, context: string): void {
	Track(EventType.EXCEPTION, {
		function: context,
		message: error instanceof Error ? error.message : String(error),
	});
	logger.error(`Error at ${context}: ${error}`);
}

export const symbolToIndexMap: Record<string, IndexKey> = {
	BANKINGIND: "Banking SubIndex",
	DEVBANKIND: "Development Bank Ind.",
	FINANCEIND: "Finance Index",
	HOTELIND: "Hotels And Tourism",
	HYDROPOWIND: "HydroPower Index",
	INVIDX: "Investment",
	LIFEINSUIND: "Life Insurance",
	MANUFACTUREIND: "Manufacturing And Pr.",
	MICROFININD: "Microfinance Index",
	MUTUALIND: "Mutual Fund",
	NEPSE: "NEPSE Index",
	NONLIFEIND: "Non Life Insurance",
	OTHERSIND: "Others Index",
	TRADINGIND: "Trading Index",
};

export function buildIndexData(
	item: ChukulIndexResponse[number],
	indexName: IndexKey,
	adLine?: SectorAdvanceDecline,
): IndexData {
	const version = CalculateVersion(item);
	return {
		index: indexName,
		turnover: formatTurnover(item.amount),
		close: item.close,
		high: item.high,
		low: item.low,
		percentageChange: item.percentage_change,
		change: item.point_change,
		open: item.open,
		time: item.date,
		previousClose: item.prev_close,
		totalTradedShared: item.volume,
		color: item.percentage_change >= 0 ? GREEN_COLOR : RED_COLOR,
		version,
		adLine: adLine || DEFAULT_AD_LINE,
	};
}

export async function fetchAndParseChukulData(): Promise<ChukulIndexResponse | null> {
	try {
		const response = await fetch(CHUKUL_API_URL, {
			headers: chukulHeaders,
			method: "GET",
		});

		if (!response.ok) {
			const err = new Error(
				`Chukul API fetch failed: ${response.status} ${response.statusText}`,
			);
			logger.error(`Error fetching Chukul data: ${err.message}`);

			Track(EventType.NEPSE_API_ERROR, {
				function: "fetchAndParseChukulData",
				message: err.message,
			});

			return null;
		}

		const result = chukulIndexResponse.safeParse(await response.json());

		if (!result.success) {
			logger.error(
				`Chukul response validation failed, ${result.error.message}`,
			);

			Track(EventType.SCHEMA_VALIDATION_FAILED, {
				function: "fetchAndParseChukulData",
				error: result.error,
			});

			return null;
		}

		return result.data;
	} catch (err) {
		handleError(err, "fetchAndParseChukulData");
		return null;
	}
}

export function transformIndexData(
	data: ChukulIndexResponse,
	advanceDeclineData?: Record<string, SectorAdvanceDecline>,
): IndexData[] {
	return data.flatMap((item) => {
		const indexName = symbolToIndexMap[item.symbol];
		return [buildIndexData(item, indexName, advanceDeclineData?.[indexName])];
	});
}

async function processAndValidateData(
	data: ChukulIndexResponse,
	advanceDeclineData?: Record<string, SectorAdvanceDecline>,
): Promise<IndexData[]> {
	const transformedData = transformIndexData(data, advanceDeclineData);

	const parsedData = chukulIndexDataSchema.safeParse(transformedData);

	if (!parsedData.success) {
		const error = new Error(
			`Failed to parse transformed index data: ${parsedData.error.message}`,
		);
		logger.error(error.message);

		Track(EventType.SCHEMA_VALIDATION_FAILED, {
			function: "processAndValidateData",
			error: parsedData.error,
			data: transformedData,
		});

		throw error;
	}

	return parsedData.data;
}

export async function getIndexData() {
	logger.info("[Cron] Starting getIndexData");

	try {
		const data = await fetchAndParseChukulData();

		if (!data) {
			return;
		}

		const advanceDeclineData = await calculateAllAdvanceDeclineData();

		const processedData = await processAndValidateData(
			data,
			advanceDeclineData,
		);

		// Run Convex update and Redis save in parallel
		await convex.mutation(api.IndexData.patchOtherIndexData, {
			data: processedData,
		});

		redis.json.set(allIndexDataKey(), "$", processedData);
	} catch (error: unknown) {
		handleError(error, "getIndexData");
		return;
	}
}
