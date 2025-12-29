import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { captureException } from "@sentry/bun";
import { convex } from "@/convex-client";
import { CalculateVersion } from "@/utils/version";
import { StockDailyArraySchema } from "./type";

export async function patchCompaniesWithMonthInfo() {
	try {
		const response = await fetch(
			"https://chukul.com/api/data/v2/market-summary/?type=stock",
			{
				headers: {
					accept: "application/json, text/plain, */*",
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
					"sec-fetch-site": "same-origin",
				},
				referrer: "https://chukul.com/",
				body: null,
				method: "GET",
				mode: "cors",
				credentials: "include",
			},
		);

		const data = await response.json();

		const validatedData = StockDailyArraySchema.parse(data);

		await convex.mutation(api.company.patchdailyCompanyData, {
			companies: validatedData,
		});

		const todayTimeInEpoch = Math.floor(Date.now() / 1000);
		const version = CalculateVersion(validatedData);

		await convex.mutation(api.company.patchChartInBulk, {
			items: validatedData.map((item) => ({
				symbol: item.symbol,
				version, // use the same version for all companies in this batch
				timeframe: "1d" as const,
				data: [[todayTimeInEpoch, item.close]],
			})),
		});
	} catch (error: unknown) {
		captureException(error);
		logger.error(
			`Error at listedStocks: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
}
