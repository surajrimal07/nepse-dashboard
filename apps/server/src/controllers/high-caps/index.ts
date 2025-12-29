import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { captureException } from "@sentry/bun";
import { convex } from "@/convex-client";
import { highCapStocksResponseSchema } from "./schema";

export async function highCaps() {
	try {
		const response = await fetch(
			"https://chukul.com/api/data/v2/market-cap-category",
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

		const validatedData = highCapStocksResponseSchema.parse(data);

		console.log("High Caps fetched:", validatedData.high_cap_stocks);

		await convex.mutation(api.companyNames.addHighCaps, {
			high_cap_stocks: validatedData.high_cap_stocks,
		});
	} catch (error: unknown) {
		captureException(error);
		logger.error(
			`Error at highCaps: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
}
