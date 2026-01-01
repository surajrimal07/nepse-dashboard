import { storage } from "#imports";
import {
	prefix,
	type ClientDetails,
	type PortfolioApiItem,
	type PortfolioStats,
	type RawHoldingTransaction,
	type StoredClientData,
	type StoredPortfolioApiData,
	type StoredTransactionData,
	type StoredWaccData,
	type WaccApiItem,
} from "@/types/meroshare-type";
import type { AdvancedUserInsights } from "../../entrypoints/meroshare.content/calculation";


// =============== Client Details Storage (keyed by boid) ===============

export const clientDetailsStorage = storage.defineItem<
	Record<string, StoredClientData>
>(`local:${prefix}client-details`, {
	init: () => ({}),
});

/**
 * Get client details for a specific boid
 */
export async function getClientDetails(
	boid: string,
): Promise<StoredClientData | null> {
	const all = (await clientDetailsStorage.getValue()) || {};
	return all[boid] || null;
}

/**
 * Get all stored client details
 */
export async function getAllClientDetails(): Promise<
	Record<string, StoredClientData>
> {
	return (await clientDetailsStorage.getValue()) || {};
}

/**
 * Save client details (keyed by demat/boid)
 */
export async function setClientDetails(details: ClientDetails): Promise<void> {
	const all = (await clientDetailsStorage.getValue()) || {};
	all[details.demat] = {
		...details,
		syncedAt: Date.now(),
	};
	await clientDetailsStorage.setValue(all);
}

/**
 * Get the currently active client details (most recently synced)
 */
export async function getCurrentClientDetails(): Promise<StoredClientData | null> {
	const all = (await clientDetailsStorage.getValue()) || {};
	const entries = Object.values(all);
	if (entries.length === 0) return null;

	// Return most recently synced
	const sorted = entries.sort((a, b) => b.syncedAt - a.syncedAt);
	return sorted[0];
}

// =============== WACC Storage (keyed by boid) ===============

export const waccStorage = storage.defineItem<Record<string, StoredWaccData>>(
	`local:${prefix}wacc`,
	{ init: () => ({}) },
);

/**
 * Get WACC data for a specific boid
 */
export async function getWaccByBoid(
	boid: string,
): Promise<StoredWaccData | null> {
	const all = (await waccStorage.getValue()) || {};
	return all[boid] || null;
}

/**
 * Get WACC for current/most recent client
 */
export async function getCurrentWacc(): Promise<WaccApiItem[]> {
	const client = await getCurrentClientDetails();
	if (!client) return [];

	const all = (await waccStorage.getValue()) || {};
	const data = all[client.demat];
	return data?.wacc || [];
}

/**
 * Get WACC sync timestamp for current client
 */
export async function getWaccTimestamp(): Promise<number | null> {
	const client = await getCurrentClientDetails();
	if (!client) return null;

	const all = (await waccStorage.getValue()) || {};
	const data = all[client.demat];
	return data?.syncedAt || null;
}

/**
 * Save WACC for a specific boid
 */
export async function setWacc(
	boid: string,
	wacc: WaccApiItem[],
): Promise<void> {
	const all = (await waccStorage.getValue()) || {};
	all[boid] = {
		boid,
		wacc,
		syncedAt: Date.now(),
	};
	await waccStorage.setValue(all);
}

// =============== WACC Pending Error Storage (keyed by boid) ===============

export interface WaccPendingError {
	boid: string;
	message: string;
	timestamp: number;
}

export const waccPendingErrorStorage = storage.defineItem<
	Record<string, WaccPendingError>
>(`local:${prefix}wacc-pending-errors`, {
	init: () => ({}),
});

/**
 * Get WACC pending error for a specific boid
 */
export async function getWaccPendingError(
	boid: string,
): Promise<WaccPendingError | null> {
	const all = (await waccPendingErrorStorage.getValue()) || {};
	return all[boid] || null;
}

/**
 * Get WACC pending error for current client
 */
export async function getCurrentWaccPendingError(): Promise<WaccPendingError | null> {
	const client = await getCurrentClientDetails();
	if (!client) return null;

	const all = (await waccPendingErrorStorage.getValue()) || {};
	return all[client.demat] || null;
}

/**
 * Set WACC pending error for a specific boid
 */
export async function setWaccPendingError(
	boid: string,
	message: string,
): Promise<void> {
	const all = (await waccPendingErrorStorage.getValue()) || {};
	all[boid] = {
		boid,
		message,
		timestamp: Date.now(),
	};
	await waccPendingErrorStorage.setValue(all);
}

/**
 * Clear WACC pending error for a specific boid (when WACC succeeds)
 */
export async function clearWaccPendingError(boid: string): Promise<void> {
	const all = (await waccPendingErrorStorage.getValue()) || {};
	delete all[boid];
	await waccPendingErrorStorage.setValue(all);
}

// =============== Transaction Storage (keyed by boid) ===============

export const transactionStorage = storage.defineItem<
	Record<string, StoredTransactionData>
>(`local:${prefix}transactions`, {
	init: () => ({}),
});

/**
 * Get transactions for a specific boid
 */
export async function getTransactions(
	boid: string,
): Promise<StoredTransactionData | null> {
	const all = (await transactionStorage.getValue()) || {};
	return all[boid] || null;
}

/**
 * Get transactions for current/most recent client
 */
export async function getCurrentTransactions(): Promise<RawHoldingTransaction[]> {
	const client = await getCurrentClientDetails();
	if (!client) return [];

	const all = (await transactionStorage.getValue()) || {};
	const data = all[client.demat];
	return data?.transactions || [];
}

/**
 * Get transaction sync timestamp for current client
 */
export async function getTransactionTimestamp(): Promise<number | null> {
	const client = await getCurrentClientDetails();
	if (!client) return null;

	const all = (await transactionStorage.getValue()) || {};
	const data = all[client.demat];
	return data?.syncedAt || null;
}

/**
 * Save transactions for a specific boid
 */
export async function setTransactions(
	boid: string,
	clientCode: string,
	transactions: RawHoldingTransaction[],
): Promise<void> {
	const all = (await transactionStorage.getValue()) || {};
	all[boid] = {
		boid,
		clientCode,
		transactions,
		syncedAt: Date.now(),
	};
	await transactionStorage.setValue(all);
}

// =============== Portfolio Stats Storage (calculated) ===============

export const portfolioStatsStorage = storage.defineItem<PortfolioStats | null>(
	`local:${prefix}portfolio-stats`,
	{ init: () => null },
);

export const getPortfolioStats = () => portfolioStatsStorage.getValue();

export async function setPortfolioStats(portfolio: PortfolioStats) {
	await portfolioStatsStorage.setValue(portfolio);
}

// =============== Portfolio API Storage (keyed by boid) ===============

export const portfolioApiStorage = storage.defineItem<
	Record<string, StoredPortfolioApiData>
>(`local:${prefix}portfolio-api`, {
	init: () => ({}),
});


/**
 * Get Raw portfolio API data for current client
 */
export async function getRawPortfolioApi(): Promise<StoredPortfolioApiData | null> {
	const client = await getCurrentClientDetails();
	if (!client) return null;

	const all = (await portfolioApiStorage.getValue()) || {};
	const data = all[client.demat];
	return data || null;
}


/**
 * Get portfolio API data for current client
 */
export async function getCurrentPortfolioApi(): Promise<PortfolioApiItem[]> {
	const client = await getCurrentClientDetails();
	if (!client) return [];

	const all = (await portfolioApiStorage.getValue()) || {};
	const data = all[client.demat];
	return data?.portfolio || [];
}

/**
 * Get portfolio API sync timestamp for current client
 */
export async function getPortfolioApiTimestamp(): Promise<number | null> {
	const client = await getCurrentClientDetails();
	if (!client) return null;

	const all = (await portfolioApiStorage.getValue()) || {};
	const data = all[client.demat];
	return data?.syncedAt || null;
}

/**
 * Save portfolio API data for a specific boid
 */
export async function setPortfolioApi(
	boid: string,
	portfolio: PortfolioApiItem[],
	totalValueOfLastTransPrice: number,
	totalValueOfPrevClosingPrice: number,
): Promise<void> {
	const all = (await portfolioApiStorage.getValue()) || {};
	all[boid] = {
		boid,
		portfolio,
		totalValueOfLastTransPrice,
		totalValueOfPrevClosingPrice,
		syncedAt: Date.now(),
	};
	await portfolioApiStorage.setValue(all);
}

// =============== Cached Insights Storage (keyed by boid) ===============

/** Stored insights data with sync timestamp */
export interface StoredInsightsData {
	boid: string;
	insights: AdvancedUserInsights;
	calculatedAt: number;
}

export const insightsStorage = storage.defineItem<
	Record<string, StoredInsightsData>
>(`local:${prefix}insights-cache`, {
	init: () => ({}),
});

/**
 * Get cached insights for current client
 */
export async function getCachedInsights(): Promise<AdvancedUserInsights | null> {
	const client = await getCurrentClientDetails();
	if (!client) return null;

	const all = (await insightsStorage.getValue()) || {};
	const data = all[client.demat];
	return data?.insights || null;
}

/**
 * Get insights cache timestamp for current client
 */
export async function getInsightsTimestamp(): Promise<number | null> {
	const client = await getCurrentClientDetails();
	if (!client) return null;

	const all = (await insightsStorage.getValue()) || {};
	const data = all[client.demat];
	return data?.calculatedAt || null;
}

/**
 * Save cached insights for a specific boid
 */
export async function setCachedInsights(
	boid: string,
	insights: AdvancedUserInsights,
): Promise<void> {
	const all = (await insightsStorage.getValue()) || {};
	all[boid] = {
		boid,
		insights,
		calculatedAt: Date.now(),
	};
	await insightsStorage.setValue(all);
}