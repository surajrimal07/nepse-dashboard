import { logger } from "@nepse-dashboard/logger";
import type z from "@nepse-dashboard/zod";
import { getWorkerPool } from "@/lib/nepse/worker";
import { EventType } from "@/types/error-types";
import Track from "@/utils/analytics";
import { CalculateVersion } from "@/utils/version";
import type { TopDashboard } from "./types";
import {
	TopGainersLosersSchema,
	TopTradedSchema,
	TopTransactionSchema,
	TopTurnoverSchema,
} from "./types";

export const getTopDashboardData = async (
	limit = 15,
): Promise<TopDashboard | null> => {
	try {
		// Fetch all data in parallel directly from workers
		const [gainersRaw, losersRaw, transactionsRaw, turnoversRaw, tradedRaw] =
			await Promise.all([
				getWorkerPool().runTask("getTopGainers") as Promise<unknown[] | null>,
				getWorkerPool().runTask("getTopLoosers") as Promise<unknown[] | null>,
				getWorkerPool().runTask("getTopTenTransactions") as Promise<
					unknown[] | null
				>,
				getWorkerPool().runTask("getTopTenTurnover") as Promise<
					unknown[] | null
				>,
				getWorkerPool().runTask("getTopTenTradeScrips") as Promise<
					unknown[] | null
				>,
			]);

		// Validate and process each category
		const gainers = validateAndProcess(
			gainersRaw,
			TopGainersLosersSchema,
			"gainers",
			limit,
		);
		const losers = validateAndProcess(
			losersRaw,
			TopGainersLosersSchema,
			"losers",
			limit,
		);
		const transactions = validateAndProcess(
			transactionsRaw,
			TopTransactionSchema,
			"transactions",
			limit,
		);
		const turnovers = validateAndProcess(
			turnoversRaw,
			TopTurnoverSchema,
			"turnovers",
			limit,
		);
		const traded = validateAndProcess(
			tradedRaw,
			TopTradedSchema,
			"traded",
			limit,
		);

		// Return null if any data is missing
		if (!(gainers && losers && transactions && turnovers && traded)) {
			logger.error("Failed to fetch or validate some dashboard data");

			Track(EventType.NEPSE_API_ERROR, {
				function: "getTopDashboardData",
				message: "Failed to fetch or validate some dashboard data",
				data: {
					gainers,
					losers,
					transactions,
					turnovers,
					traded,
				},
			});

			return null;
		}

		const data = {
			gainers,
			losers,
			transactions,
			turnovers,
			traded,
		};

		const version = CalculateVersion(data);

		return {
			...data,
			version,
		};
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : "Unknown error occurred";

		Track(EventType.EXCEPTION, {
			function: "getTopDashboardData",
			message,
		});

		logger.error(message);
		return null;
	}
};

function validateAndProcess<T>(
	rawData: unknown[] | null,
	schema: z.ZodSchema<T>,
	category: string,
	limit: number,
): T[] | null {
	if (!(rawData && Array.isArray(rawData))) {
		logger.error(`Invalid data for category: ${category}`);
		return null;
	}

	try {
		return rawData.slice(0, limit).map((item) => {
			const parsed = schema.safeParse(item);
			if (!parsed.success) {
				Track(EventType.SCHEMA_VALIDATION_FAILED, {
					function: "getTopDashboardData_validateAndProcess",
					category,
					error: parsed.error,
					data: item,
				});

				logger.error(
					`Validation error in ${category}: ${parsed.error.format()}`,
				);
				throw new Error(`Invalid ${category} data`);
			}
			return parsed.data;
		});
	} catch (error: unknown) {
		logger.error(`Error processing ${category} data: ${error}`);
		return null;
	}
}
