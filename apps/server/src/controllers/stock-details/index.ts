import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { convex } from "@/convex-client";
import { get_security_detail } from "@/lib/nepse/worker";
import { redis } from "@/redis-client";
import { EventType } from "@/types/error-types";
import Track from "@/utils/analytics";
import { stockDetailsKey, stockDetailsSpamKey } from "@/utils/keys/redisKeys";
import { isSpamBlocked, setSpamProtection } from "@/utils/spam-protection";
import { isStockValid } from "@/utils/stock-mapper";
import { formatTurnover } from "@/utils/time";
import { CalculateVersion } from "@/utils/version";
import { SingleCompanySchema } from "./types";

type result = {
	success: boolean;
	message: string;
};

export const StockDetails = async (symbol: string): Promise<result> => {
	if (!(symbol && isStockValid(symbol))) {
		return { success: false, message: "Invalid symbol" };
	}

	// Check and set spam protection for this symbol
	const spamKey = stockDetailsSpamKey(symbol);

	const blocked = await isSpamBlocked(spamKey);

	if (blocked) {
		return { success: false, message: "Please try again later" };
	}

	const cacheKey = stockDetailsKey(symbol);

	const existingVersion = await convex.query(api.company.getCompanyVersion, {
		symbol,
	});

	try {
		const apiData = await get_security_detail(symbol);

		if (
			!apiData ||
			Array.isArray(apiData) ||
			!apiData.security ||
			!apiData.securityDailyTradeDto
		) {
			const message = "No data received from Nepse API";

			Track(EventType.NEPSE_API_ERROR, {
				function: "StockDetails",
				symbol,
				message,
			});

			logger.error(`[StockDetails] ${message}`);

			return {
				success: false,
				message: "An error occurred, Please try later",
			};
		}

		const validatedData = SingleCompanySchema.parse({
			symbol: apiData.security.symbol,
			totalTradeQuantity: apiData.securityDailyTradeDto.totalTradeQuantity,
			totalTrades: apiData.securityDailyTradeDto.totalTrades,
			lastTradedPrice: apiData.securityDailyTradeDto.lastTradedPrice,
			fiftyTwoWeekHigh: apiData.securityDailyTradeDto.fiftyTwoWeekHigh,
			fiftyTwoWeekLow: apiData.securityDailyTradeDto.fiftyTwoWeekLow,
			lastUpdatedDateTime: apiData.securityDailyTradeDto.lastUpdatedDateTime,
			listingDate: apiData.security.listingDate,
			companyName: apiData.security.companyId.companyName,
			email: apiData.security.companyId.email,
			companyWebsite: apiData.security.companyId.companyWebsite,
			companyContactPerson: apiData.security.companyId.companyContactPerson,
			stockListedShares: formatTurnover(apiData.stockListedShares),
			paidUpCapital: formatTurnover(apiData.paidUpCapital),
			issuedCapital: formatTurnover(apiData.issuedCapital),
			marketCapitalization: formatTurnover(apiData.marketCapitalization),
			publicShares: formatTurnover(apiData.publicShares),
			publicPercentage: apiData.publicPercentage,
			promoterShares: formatTurnover(apiData.promoterShares),
			promoterPercentage: apiData.promoterPercentage,
			faceValue: apiData.security?.faceValue,
			tradingStartDate: apiData.security?.tradingStartDate,
		});

		const version = CalculateVersion(validatedData);

		// If existingVersion is undefined (first time or error), always ingest
		if (existingVersion !== undefined && version === existingVersion) {
			logger.info(`[StockDetails] No update needed for ${symbol}.`);
			return {
				success: true,
				message: "No update needed",
			};
		}

		redis.json.set(cacheKey, "$", validatedData);

		await convex.mutation(api.company.patchCompanyFull, {
			...validatedData,
			version,
		});

		setSpamProtection(spamKey, symbol, 600);

		return { success: true, message: "Company data updated successfully" };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";

		logger.error(message);

		Track(EventType.EXCEPTION, {
			function: "StockDetails",
			symbol,
			message,
			error,
		});

		return { success: false, message: "An error occurred" };
	}
};
