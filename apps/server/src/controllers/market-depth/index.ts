import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { convex } from "@/convex-client";
import { getMarket_depth } from "@/lib/nepse/worker";
import { EventType } from "@/types/error-types";
import Track from "@/utils/analytics";
import { isStockValid } from "@/utils/stock-mapper";
import { CalculateVersion } from "@/utils/version";
import { getLatestMarketStatus } from "../cron";
import { marketDepthResponse } from "./types";

export const marketDepth = async (
	symbol: string,
): Promise<
	| {
			success: boolean;
			message: string;
	  }
	| undefined
> => {
	logger.info("[Cron] Starting getMarketDepth for symbol:", symbol);

	if (!(symbol && isStockValid(symbol))) {
		logger.error("[marketDepth] Symbol is required");
		return {
			success: false,
			message: "Symbol is required or invalid",
		};
	}

	try {
		const marketStatus = getLatestMarketStatus();
		if (!marketStatus?.isOpen) {
			logger.info(
				`[marketDepth] Market is closed, skipping market depth update for symbol: ${symbol}`,
			);
			return {
				success: false,
				message: "Market is closed",
			};
		}

		const [cachedData, data] = await Promise.all([
			convex.query(api.marketDepth.get, { symbol }),
			getMarket_depth(symbol),
		]);

		if (!data) {
			Track(EventType.NEPSE_API_ERROR, {
				function: "marketDepth",
				symbol,
				message: "No data received from Nepse API",
			});

			return {
				success: false,
				message: "No data received from Nepse API",
			};
		}

		const version = CalculateVersion(data);

		const validatedData = marketDepthResponse.parse({
			...data,
			symbol,
			version,
		});

		//if fresh update redis and convex else return
		if (cachedData?.version === validatedData.version) {
			logger.info(`[marketDepth] No update needed for symbol: ${symbol}`);
			return {
				success: true,
				message: "No update needed",
			};
		}

		logger.info("[marketDepth] Market depth data for symbol saved");

		await convex.mutation(api.marketDepth.update, validatedData);

		return {
			success: true,
			message: "Market depth data updated successfully",
		};
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : "Unknown error occurred";

		Track(EventType.EXCEPTION, {
			function: "marketDepth",
			symbol,
			message,
		});

		logger.error(message);

		return {
			success: false,
			message,
		};
	}
};
