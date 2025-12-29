import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { convex } from "@/convex-client";
import { getNepseIndexIntraday } from "@/lib/nepse/worker";
import { EventType } from "@/types/error-types";
import type { IndexKey } from "@/types/indexes";
import Track from "@/utils/analytics";
import { CalculateVersion } from "@/utils/version";
import { IntradayChartResponseSchema, IntradayIndexSchema } from "./types";

type IndexIntradayResult = {
	success: boolean;
	message: string;
};

export const indexIntradayChart = async (
	index: IndexKey,
): Promise<IndexIntradayResult> => {
	logger.info("[Cron] Starting getNepseIndexIntraday for index:", index);

	try {
		// Get chart info and API data in parallel
		const [chartInfo, rawData] = await Promise.all([
			convex.query(api.indexChart.getLastTimestamp, {
				index,
				timeframe: "1m",
			}),
			getNepseIndexIntraday(index),
		]);

		if (!rawData) {
			const message = "No data found";
			logger.error(`[indexIntradayChart] ${message} for index: ${index}`);

			Track(EventType.NEPSE_API_ERROR, {
				function: "indexIntradayChart",
				index,
			});

			return { success: false, message };
		}

		// Parse and validate the raw data
		const parsed = IntradayIndexSchema.safeParse(rawData);
		if (!parsed.success) {
			const message = `Failed to parse data: ${parsed.error.message}`;

			logger.error(message);

			Track(EventType.SCHEMA_VALIDATION_FAILED, {
				function: "indexIntradayChart",
				index,
				data: rawData,
			});

			return {
				success: false,
				message: "Invalid data or Nepse API dead again",
			};
		}

		// Calculate version of the new data
		const newVersion = CalculateVersion(parsed.data);

		// Compare versions - skip if same version
		if (chartInfo.version && chartInfo.version === newVersion) {
			const message = `No version change`;
			logger.info(`${message} for ${index}, skipping update`);
			return { success: true, message };
		}

		// Prepare data for convex update
		const validatedData = IntradayChartResponseSchema.safeParse({
			index,
			data: parsed.data,
			version: newVersion,
			timeframe: "1m",
		});

		if (!validatedData.success) {
			const message = `Response validation failed: ${validatedData.error.message}`;
			logger.error(message);

			Track(EventType.SCHEMA_VALIDATION_FAILED, {
				function: "indexIntradayChart",
				index,
				data: validatedData.data,
			});

			return { success: false, message: "Data validation failed" };
		}

		// Update the entire chart data in convex
		await convex.mutation(api.indexChart.patchChart, validatedData.data);

		const message = `Updated ${index}  chart`;

		return { success: true, message };
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Unknown error";
		Track(EventType.EXCEPTION, {
			function: "indexIntradayChart",
			index,
			message,
			error,
		});
		return { success: false, message: "An error occurred" };
	}
};
