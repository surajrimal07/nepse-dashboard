import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { convex } from "@/convex-client";
import { disclosure } from "@/lib/nepse/worker";
import { EventType } from "@/types/error-types";
import Track from "@/utils/analytics";
import { MarketApiResponseSchema } from "./schema";

export async function getDisclosure(): Promise<{
	Success: boolean;
	message: string;
}> {
	logger.info("[Cron] Starting getDisclosure");

	try {
		const [exchangeMessages, companyNews, disclosureData] = await Promise.all([
			convex.query(api.exchangeMessages.getAll, {}),
			convex.query(api.companyNews.getAll, {}),
			disclosure(),
		]);

		if (!disclosureData) {
			logger.error("[getDisclosure] No data found from Nepse API");
			Track(EventType.NEPSE_API_ERROR, {
				function: "getDisclosure",
				message: "No data received from Nepse API",
			});
			return { Success: false, message: "No data found" };
		}

		const validatedData = MarketApiResponseSchema.safeParse(disclosureData);

		if (!validatedData.success) {
			Track(EventType.SCHEMA_VALIDATION_FAILED, {
				function: "getDisclosure",
				data: validatedData,
			});

			logger.warn("[getDisclosure] Validation failed:", validatedData.error);
			return { Success: false, message: "Invalid data received" };
		}

		// filter out already existing disclosures based on externalId
		const newExchangeMessages = validatedData.data.exchangeMessages.filter(
			(msg) => !exchangeMessages.some((cachedItem) => cachedItem.id === msg.id),
		);

		const newCompanyNews = validatedData.data.companyNews.filter(
			(news) => !companyNews.some((cachedItem) => cachedItem.id === news.id),
		);

		if (newExchangeMessages.length === 0 && newCompanyNews.length === 0) {
			logger.info("[getDisclosure] No new disclosures to add");
			return { Success: true, message: "No new disclosures to add" };
		}

		await convex.mutation(api.exchangeMessages.addExchangeMessages, {
			items: newExchangeMessages,
		});

		await convex.mutation(api.companyNews.addCompanyNews, {
			items: newCompanyNews,
		});

		logger.info(`[getDisclosure] Added new disclosures`);
		return {
			Success: true,
			message: "Added new disclosures",
		};
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Unknown error";
		Track(EventType.EXCEPTION, {
			function: "getDisclosure",
			message,
		});

		logger.info("[getDisclosure] Error:", message);

		return { Success: false, message: "Internal server error" };
	}
}
