import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { captureException } from "@sentry/bun";
import { convex } from "@/convex-client";
import { get_market_status } from "@/lib/nepse/worker";
import { EventType } from "@/types/error-types";
import Track from "@/utils/analytics";
import { CalculateVersion } from "@/utils/version";
import {
	MarketStatusResponseSchema,
	NepseOpenState,
	NepseOpenStateMap,
} from "./types";

export async function getMarketStatus() {

	try {
		const [cachedData, status] = await Promise.all([
			convex.query(api.marketStatus.get, {}),
			get_market_status(),
		]);

		if (!status) {
			logger.error("[getMarketStatus] No data found from Nepse API");
			Track(EventType.NEPSE_API_ERROR, {
				function: "getMarketStatus",
				message: "No data received from Nepse API",
			});
			return null;
		}

		const response = {
			state: NepseOpenStateMap[status.isOpen as NepseOpenState],
			isOpen: status.isOpen === NepseOpenState.OPEN,
		};

		const version = CalculateVersion(response);
		const validatedData = MarketStatusResponseSchema.safeParse({
			...response,
			version,
			asOf: status.asOf,
		});

		if (!validatedData.success) {
			Track(EventType.SCHEMA_VALIDATION_FAILED, {
				function: "getMarketStatus",
				data: validatedData,
			});

			logger.warn("[getMarketStatus] Validation failed:", validatedData.error);
			return null;
		}

		// Explicit field comparison for update decision
		// Always ingest if cachedData is missing
		if (
			!cachedData ||
			cachedData.state !== validatedData.data.state ||
			cachedData.asOf !== validatedData.data.asOf ||
			cachedData.isOpen !== validatedData.data.isOpen
		) {
			logger.info("[getMarketStatus] New market status", validatedData.data);
			await convex.mutation(api.marketStatus.update, validatedData.data);
		} else {
			logger.info("[getMarketStatus] No update needed");
		}
		return validatedData.data;
	} catch (error: unknown) {
		captureException(error);
		logger.error("[getMarketStatus] Error:", error);
		return null;
	}
}
