import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import type {
	PortfolioApiItem,
	WaccApiItem,
	WidgetData,
} from "@/types/meroshare-type";
import type { ProcessedStats } from "./type";

export function getValueType(value: number): "profit" | "loss" | "neutral" {
	if (value > 0) return "profit";
	if (value < 0) return "loss";
	return "neutral";
}

export function parseNumber(
	text: string | null | undefined,
	removeCommas = false,
): number {
	if (!text) return 0;
	const cleaned = removeCommas
		? text.replace(/,/g, "")
		: text.replace(/[^0-9.-]/g, "");
	return Number.parseFloat(cleaned) || 0;
}

export function updateWidgetData(
	widgetData: WidgetData,
	ticker: string,
	pldiff: number,
	overallPL: number,
	cost: number,
	yesterdayClosingValue: number,
): void {
	const todayType = pldiff > 0 ? "gain" : "loss";
	const todayPercentage =
		yesterdayClosingValue !== 0 ? (pldiff / yesterdayClosingValue) * 100 : 0;

	if (
		(todayType === "gain" && pldiff > widgetData.today.gain.amount) ||
		(todayType === "loss" && pldiff < widgetData.today.loss.amount)
	) {
		widgetData.today[todayType] = {
			ticker,
			amount: pldiff,
			percentage: todayPercentage,
		};
	}

	const overallType = overallPL > 0 ? "gain" : "loss";
	const overallPercentage = cost !== 0 ? (overallPL / cost) * 100 : 0;

	if (
		(overallType === "gain" && overallPL > widgetData.most.gain.amount) ||
		(overallType === "loss" && overallPL < widgetData.most.loss.amount)
	) {
		widgetData.most[overallType] = {
			ticker,
			amount: overallPL,
			percentage: overallPercentage,
		};
	}
}

export function createWaccMap(
	waccData: WaccApiItem[],
): Map<string, WaccApiItem> {
	const map = new Map<string, WaccApiItem>();
	for (const item of waccData) {
		if (item?.scrip) {
			map.set(item.scrip, item);
		}
	}
	return map;
}

// Create companies lookup map for O(1) access
export function createCompaniesMap(
	companiesList: Doc<"company">[],
): Map<string, Doc<"company">> {
	const map = new Map<string, Doc<"company">>();
	for (const company of companiesList) {
		if (company?.symbol) {
			map.set(company.symbol, company);
		}
	}
	return map;
}

export function processPortfolioData(
	waccData: WaccApiItem[],
	portfolioData: PortfolioApiItem[],
	companiesList: Doc<"company">[],
): ProcessedStats | null {

	if (!portfolioData || portfolioData.length === 0) return null;

	// Create lookup maps for O(1) access
	const waccMap = createWaccMap(waccData);
	const companiesMap = createCompaniesMap(companiesList);

	const widgetData: WidgetData = {
		today: {
			loss: { ticker: "none", amount: 0, percentage: 0 },
			gain: { ticker: "none", amount: 0, percentage: 0 },
		},
		most: {
			loss: { ticker: "none", amount: 0, percentage: 0 },
			gain: { ticker: "none", amount: 0, percentage: 0 },
		},
		todayTotal: {
			amount: 0,
			percentage: 0,
		},
		mostTraded: {
			ticker: "none",
			count: 0,
		},
	};

	// Count ticker occurrences for most traded
	const tickerCounts = new Map<string, number>();
	for (const item of waccData) {
		if (item?.scrip) {
			const ticker = item.scrip;
			tickerCounts.set(ticker, (tickerCounts.get(ticker) || 0) + 1);
		}
	}

	// Find the most traded (most repeated) ticker
	let maxCount = 0;
	let mostTradedTicker = "none";
	for (const [ticker, count] of tickerCounts) {
		if (count > maxCount) {
			maxCount = count;
			mostTradedTicker = ticker;
		}
	}
	widgetData.mostTraded = { ticker: mostTradedTicker, count: maxCount };

	let totalCost = 0;
	let yesterdayTotalValue = 0;
	let todayTotalValue = 0;
	let allWaccsAvailable = true;

	for (const item of portfolioData) {
		const ticker = item.script;
		// Number() handles both string and number inputs correctly in this context if we just cast,
		// but since parseNumber expects string | null | undefined, and currentBalance is number,
		// we can just use it directly.
		const quantity = item.currentBalance;

		// O(1) lookup instead of O(n) find
		const waccItem = waccMap.get(ticker);

		if (!waccItem?.averageBuyRate) {
			allWaccsAvailable = false;
			continue;
		}

		const waccRate = waccItem.averageBuyRate;
		const cost = waccRate * quantity;
		totalCost += cost;

		// O(1) lookup instead of O(n) find
		const companyData = companiesMap.get(ticker);

		// Get current LTP - use lastTradedPrice, fallback to closePrice, fallback to 0
		const currentLTP =
			companyData?.lastTradedPrice ?? companyData?.closePrice ?? 0;

		// Get previous close - if null/undefined, use currentLTP (meaning 0 daily change)
		const previousClose = companyData?.previousClose ?? currentLTP;

		// Calculate values
		const todayValue = currentLTP * quantity;
		const yesterdayValue = previousClose * quantity;

		todayTotalValue += todayValue;
		yesterdayTotalValue += yesterdayValue;

		// Daily P/L = (currentLTP - previousClose) × quantity
		const dailyPL = todayValue - yesterdayValue;

		// Overall P/L = current value - cost (from WACC)
		const overallPL = todayValue - cost;

		updateWidgetData(
			widgetData,
			ticker,
			dailyPL,
			overallPL,
			cost,
			yesterdayValue,
		);
	}

	if (!allWaccsAvailable || totalCost === 0) {
		// Even if not all WACC available, we might still want partial stats?
		// For now keeping strict check to match original logic
		return null;
	}

	const dailyDiff = todayTotalValue - yesterdayTotalValue;
	const dailyPercentage =
		yesterdayTotalValue > 0 ? (dailyDiff / yesterdayTotalValue) * 100 : 0;
	const overallPL = todayTotalValue - totalCost;
	const overallPercentage = totalCost > 0 ? (overallPL / totalCost) * 100 : 0;

	// Set todayTotal in widgetData
	widgetData.todayTotal = {
		amount: dailyDiff,
		percentage: dailyPercentage,
	};

	return {
		diff: { total: dailyDiff, percentage: dailyPercentage },
		overall: { total: overallPL, percentage: overallPercentage },
		widgetData,
	};
}
