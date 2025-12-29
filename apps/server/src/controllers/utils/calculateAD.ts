import { logger } from "@nepse-dashboard/logger";
import { captureException } from "@sentry/bun";
import { redis } from "@/redis-client";
import { ADVANCE_THRESHOLD, DECLINE_THRESHOLD } from "@/types/constants";
import { type IndexKey, nepseIndexes } from "@/types/indexes";
import type { AdvanceDeclineResult, SectorAdvanceDecline } from "@/types/nepse";
import { listedCompaniesDataKey } from "@/utils/keys/redisKeys";
import type { CompanyListData } from "../all-companies/type";

export function createEmptyAdvanceDeclineResult(): AdvanceDeclineResult {
	return nepseIndexes.reduce((acc, key) => {
		acc[key] = { advance: 0, decline: 0, neutral: 0 };
		return acc;
	}, {} as AdvanceDeclineResult);
}

export function getStockAdvanceDeclineStatus(
	percentageChange: number,
): keyof SectorAdvanceDecline {
	if (percentageChange > ADVANCE_THRESHOLD) {
		return "advance";
	}
	if (percentageChange < DECLINE_THRESHOLD) {
		return "decline";
	}
	return "neutral";
}

export function isValidIndexKey(sector: unknown): sector is IndexKey {
	return (
		typeof sector === "string" && nepseIndexes.includes(sector as IndexKey)
	);
}

export async function calculateAllAdvanceDeclineData() {
	try {
		const stockList = (await redis.json.get(
			listedCompaniesDataKey(),
		)) as CompanyListData | null;

		if (!stockList) {
			return;
		}

		// Initialize the result object
		const result = createEmptyAdvanceDeclineResult();

		// First, ensure all indexes are initialized in sectors
		const filteredSectors = nepseIndexes.filter(
			(sector) => sector !== "NEPSE Index",
		);
		for (const sector of filteredSectors) {
			result[sector] = { advance: 0, decline: 0, neutral: 0 };
		}

		for (const stock of stockList) {
			const status = getStockAdvanceDeclineStatus(stock.percentageChange);
			const sector = isValidIndexKey(stock.internalSector)
				? stock.internalSector
				: "Others Index";

			result["NEPSE Index"][status]++;
			if (sector !== "NEPSE Index") {
				result[sector as keyof AdvanceDeclineResult][status]++;
			}
		}

		return result;
	} catch (error: unknown) {
		captureException(error);
		logger.error(
			`Error at calculateAllAdvanceDeclineData : ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
}
