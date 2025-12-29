import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { convex } from "@/convex-client";
import { getNepseIndex, getSummary } from "@/lib/nepse/worker";
import { redis } from "@/redis-client";
import { EventType } from "@/types/error-types";
import Track from "@/utils/analytics";
import { nepseIndexDataKey } from "@/utils/keys/redisKeys";
import { formatTurnover, NepalTime } from "@/utils/time";
import { CalculateVersion } from "@/utils/version";
import { IndexIntradayData } from "../index-intraday-chart/types";
import { MarketSummarySchema } from "./types";

export async function getNepseIntraday() {
	logger.info("[Cron] Starting getNepseIntraday");

	try {
		const [cachedData, nepseIndexData, nepseSummaryData] = await Promise.all([
			convex.query(api.IndexData.get, {
				index: "NEPSE Index",
			}),
			getNepseIndex(),
			getSummary(),
		]);

		if (!(nepseIndexData && nepseSummaryData)) {
			Track(EventType.NEPSE_API_ERROR, {
				function: "getNepseIntraday",
				message: "No data received from Nepse API",
			});

			logger.error("Failed to fetch Nepse index or summary data");

			return;
		}

		const transformedSummary = MarketSummarySchema.parse(nepseSummaryData);

		const computedData = {
			time: nepseIndexData?.["NEPSE Index"].generatedTime ?? NepalTime,
			totalTradedShared: transformedSummary.totalTradedShares,
			totalTransactions: transformedSummary.totalTransactions,
			totalScripsTraded: transformedSummary.totalScripsTraded,
			totalCapitalization: formatTurnover(
				transformedSummary.totalCapitalization,
			),
			fiftyTwoWeekHigh: nepseIndexData["NEPSE Index"].fiftyTwoWeekHigh,
			fiftyTwoWeekLow: nepseIndexData["NEPSE Index"].fiftyTwoWeekLow,
		};

		const version = CalculateVersion(computedData);

		const validatedData = IndexIntradayData.parse({
			...computedData,
			version,
		});

		if (cachedData?.version === validatedData.version) {
			logger.info("[getNepseIntraday] No update needed.");
			return;
		}

		await convex.mutation(api.IndexData.patchNepseIndexData, validatedData);

		redis.json.set(nepseIndexDataKey(), "$", validatedData);
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : "Unknown error occurred";

		Track(EventType.EXCEPTION, {
			function: "getNepseIntraday",
			message,
		});

		logger.error(message);
	}
}
