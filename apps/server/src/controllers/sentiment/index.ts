import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import { logger } from "@nepse-dashboard/logger";
import { captureException } from "@sentry/bun";
import { convex } from "@/convex-client";
import { redis } from "@/redis-client";
import topCompanies from "@/utils/capitalization";
import {
	allIndexDataKey,
	listedCompaniesDataKey,
	nepseIndexDataKey,
} from "@/utils/keys/redisKeys";
import { loadSectorWeights } from "@/utils/sector-weight";
import { CalculateVersion } from "@/utils/version";
import type { CompanyListData } from "../all-companies/type";
import type { IndexIntradayData } from "../index-intraday-chart/types";
import type { StockIndexData } from "../other-index-data/types";
import {
	type NEPSEPrediction,
	NepsePredictionResultSchema,
	type PredictionResult,
	type StockPrediction,
	StockPredictionSchema,
} from "./types";

export async function getSentiment() {
	logger.info("[Cron] Starting getSentiment");

	try {
		const [cachedData, allIndicesData, nepseIndexData, stockData] =
			(await Promise.all([
				convex.query(api.nepsePredictions.get, {}),
				redis.json.get(allIndexDataKey()),
				redis.json.get(nepseIndexDataKey()),
				redis.json.get(listedCompaniesDataKey()),
			])) as [
				Doc<"nepsePredictions"> | undefined | null,
				StockIndexData | null,
				IndexIntradayData | null,
				CompanyListData | null,
			];
		if (!(allIndicesData && stockData && nepseIndexData)) {
			throw new Error("Failed to fetch trading data");
		}

		const result = buildStockPredictions(stockData);
		const overallStrength = calculateOverallStrength(
			result,
			stockData,
			allIndicesData,
		);

		const responseData: NEPSEPrediction = {
			prediction: calculateOverallPrediction(overallStrength),
			strength: Number(overallStrength.toFixed(2)),
			version: CalculateVersion({
				prediction: calculateOverallPrediction(overallStrength),
				strength: Number(overallStrength.toFixed(2)),
				topCompanies: result,
			}),
			topCompanies: result,
		};

		const validated = NepsePredictionResultSchema.safeParse(responseData);

		if (!validated.success) {
			logger.error(`Prediction validation failed: ${validated.error.message}`);
			return;
		}

		if (cachedData?.version === validated.data.version) {
			logger.info("[getSentiment] No update needed.");
			return;
		}

		await convex.mutation(api.nepsePredictions.patch, validated.data);
	} catch (error) {
		captureException(error);

		logger.error(`Error fetching sentiment data: ${error}`);
	}
}

function buildStockPredictions(stockData: CompanyListData): StockPrediction[] {
	return topCompanies().map((stock) => {
		const match = stockData.find((d) => d.symbol === stock.ticker);
		const base = {
			ticker: stock.ticker,
			name: stock.name,
			impact: stock.impact,
			ltp: match?.closePrice ?? null,
			pointchange: match?.change ?? null,
			percentchange: match?.percentageChange ?? null,
			volume: match?.totalTradedShared ?? null,
		};

		const validated = StockPredictionSchema.safeParse(base);
		return validated.success
			? validated.data
			: {
					...base,
					ltp: null,
					pointchange: null,
					percentchange: null,
					volume: null,
				};
	});
}

// Helper function to map sector names to index keys
function mapSectorToIndexKey(sectorName: string): string {
	const sectorMappings: Record<string, string> = {
		"Banking SubIndex": "Banking SubIndex",
		"HydroPower Index": "HydroPower Index",
		"Life Insurance": "Life Insurance",
		"Non Life Insurance": "Non Life Insurance",
		"Finance Index": "Finance Index",
		"Development Bank Ind.": "Development Bank Ind.",
		"Manufacturing And Pr.": "Manufacturing And Pr.",
		"Hotels And Tourism": "Hotels And Tourism",
		"Microfinance Index": "Microfinance Index",
		Investment: "Investment",
		"Others Index": "Others Index",
		"Trading Index": "Trading Index",
		"Mutual Fund": "Mutual Fund",
	};

	return sectorMappings[sectorName] || sectorName;
}

// Calculate sector-weighted impact (50% of prediction)
function calculateSectorImpact(allIndicesData: StockIndexData): number {
	const sectorWeights = loadSectorWeights();
	let weightedSectorChange = 0;
	let totalWeight = 0;

	for (const [sectorName, weight] of Object.entries(sectorWeights)) {
		const mappedSectorName = mapSectorToIndexKey(sectorName);
		const sectorData = allIndicesData.find(
			(data) => data.index === mappedSectorName,
		);

		if (sectorData && typeof sectorData.percentageChange === "number") {
			const normalizedChange = Math.tanh(sectorData.percentageChange / 100);
			const weightDecimal = weight / 100;

			weightedSectorChange += weightDecimal * normalizedChange;
			totalWeight += weightDecimal;
		}
	}

	return totalWeight > 0 ? weightedSectorChange / totalWeight : 0;
}

// Calculate top companies impact (40% of prediction)
function calculateTopCompaniesImpact(companies: StockPrediction[]): number {
	const topCompaniesList = topCompanies();
	let weightedCompanyChange = 0;
	let totalImpact = 0;

	for (const topCompany of topCompaniesList) {
		const companyData = companies.find((c) => c.ticker === topCompany.ticker);

		if (companyData && companyData.percentchange !== null) {
			// Normalize percentage change using tanh
			const normalizedChange = Math.tanh(companyData.percentchange / 100);
			const impactWeight = topCompany.impact / 100; // Convert to decimal

			weightedCompanyChange += impactWeight * normalizedChange;
			totalImpact += impactWeight;
		}
	}

	return totalImpact > 0 ? weightedCompanyChange / totalImpact : 0;
}

// Calculate NEPSE index direct impact (10% of prediction)
function calculateNepseIndexImpact(allIndicesData: StockIndexData): number {
	const nepseData = allIndicesData.find((data) => data.index === "NEPSE Index");
	if (nepseData && typeof nepseData.percentageChange === "number") {
		return Math.tanh(nepseData.percentageChange / 100);
	}
	return 0;
}

// Main prediction calculation
function calculateMarketPrediction(
	companies: StockPrediction[],
	allIndicesData: StockIndexData,
): number {
	// Calculate individual components
	const sectorImpact = calculateSectorImpact(allIndicesData);
	const companiesImpact = calculateTopCompaniesImpact(companies);
	const nepseImpact = calculateNepseIndexImpact(allIndicesData);

	// Weighted combination
	const prediction =
		0.5 * sectorImpact + 0.4 * companiesImpact + 0.1 * nepseImpact; // 50% sector performance, 40% top companies performance, 10% direct NEPSE impact

	// Ensure result is between -1 and +1
	return Math.max(-1, Math.min(1, prediction));
}

// Enhanced prediction with volume signals
function calculateEnhancedPrediction(
	basePrediction: number,
	companies: StockPrediction[],
): number {
	// Calculate volume momentum signal
	const topCompaniesList = topCompanies();
	let volumeSignal = 0;
	let validVolumeCount = 0;

	for (const topCompany of topCompaniesList.slice(0, 10)) {
		// Top 10 companies
		const companyData = companies.find((c) => c.ticker === topCompany.ticker);

		if (
			companyData?.volume &&
			companyData.volume > 0 &&
			companyData.percentchange !== null
		) {
			// Volume momentum: if volume is above average and price is up, positive signal
			const priceDirection = companyData.percentchange > 0 ? 1 : -1;
			const volumeWeight = Math.min(companyData.volume / 100_000, 1); // Normalize volume

			volumeSignal += priceDirection * volumeWeight * (topCompany.impact / 100);
			validVolumeCount++;
		} else if (companyData && companyData.percentchange !== null) {
			// Fallback to price momentum if volume not available
			const priceDirection = companyData.percentchange > 0 ? 1 : -1;
			volumeSignal += priceDirection * (topCompany.impact / 100);
			validVolumeCount++;
		}
	}

	const normalizedVolumeSignal =
		validVolumeCount > 0 ? Math.tanh(volumeSignal / validVolumeCount) : 0;

	// Add volume momentum (10% weight)
	const enhancedPrediction = basePrediction + 0.1 * normalizedVolumeSignal;

	// Keep bounded between -1 and +1
	return Math.max(-1, Math.min(1, enhancedPrediction));
}

function calculateOverallStrength(
	companies: StockPrediction[],
	todayData: CompanyListData,
	allIndicesData: StockIndexData,
): number {
	// Calculate base prediction using our new algorithm
	const basePrediction = calculateMarketPrediction(companies, allIndicesData);

	// Enhance with volume signals - add volume data from todayData to companies
	const companiesWithVolume = companies.map((company) => {
		const matchingData = todayData.find(
			(data) => data.symbol === company.ticker,
		);
		return {
			...company,
			volume: matchingData?.totalTradedShared || null,
		};
	});

	// Enhance with volume signals
	const enhancedPrediction = calculateEnhancedPrediction(
		basePrediction,
		companiesWithVolume,
	);

	// Return the enhanced prediction value
	return enhancedPrediction;
}

function calculateOverallPrediction(overallStrength: number): PredictionResult {
	if (overallStrength > 0.6) {
		return "Market likely to increase significantly";
	}
	if (overallStrength > 0.2 && overallStrength <= 0.6) {
		return "Market may increase";
	}
	if (overallStrength < -0.6) {
		return "Market likely to decrease significantly";
	}
	if (overallStrength < -0.2 && overallStrength >= -0.6) {
		return "Market may decrease";
	}
	return "Market may remain stable";
}
