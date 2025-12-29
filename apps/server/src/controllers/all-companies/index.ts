import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { captureException } from "@sentry/bun";
import { convex } from "@/convex-client";
import { redis } from "../../redis-client";
import { chukulHeaders } from "../../utils/headers";
import { listedCompaniesDataKey } from "../../utils/keys/redisKeys";
import { CompanyListDataSchema } from "./type";

export async function listedStocks() {
	try {
		const response = await fetch(
			"https://chukul.com/api/data/intrahistorydata/performance/?type=stock",
			{
				headers: chukulHeaders,
				method: "GET",
			},
		);

		const data = await response.json();

		const validatedData = CompanyListDataSchema.parse(data);

		await convex.mutation(api.company.patchCompany, {
			companies: validatedData, // Nothing to worry here
		});

		redis.json.set(listedCompaniesDataKey(), "$", validatedData);
	} catch (error: unknown) {
		captureException(error);
		logger.error(
			`Error at listedStocks: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
}
