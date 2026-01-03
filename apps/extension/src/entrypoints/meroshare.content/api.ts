import { track } from "@/lib/analytics";
import { Env, EventName } from "@/types/analytics-types";
import { logger } from "@/utils/logger";
import {
	clearWaccPendingError,
	setClientDetails,
	setPortfolioApi,
	setTransactions,
	setWacc,
	setWaccPendingError,
} from "../../lib/storage/meroshare-storage";
import type {
	ClientDetails,
	PortfolioApiItem,
	PortfolioApiResponse,
	RawHoldingTransaction,
	WaccApiItem,
	WaccApiResponse,
} from "../../types/meroshare-type";

// =============== API URLs ===============

const OWN_DETAIL_URL =
	"https://webbackend.cdsc.com.np/api/meroShare/ownDetail/";
const WACC_URL = "https://webbackend.cdsc.com.np/api/myPurchase/waccReport/";
const PORTFOLIO_URL =
	"https://webbackend.cdsc.com.np/api/meroShareView/myPortfolio/";
const TRANSACTION_URL =
	"https://webbackend.cdsc.com.np/api/meroShareView/report/myTransaction/csv";

// =============== Get Auth from Session Storage ===============

function getAuthorization(): string | null {
	try {
		return sessionStorage.getItem("Authorization");
	} catch {
		return null;
	}
}

// =============== CSV Parsing ===============

function parseTransactionCSV(csvText: string): RawHoldingTransaction[] {
	try {
		const lines = csvText.trim().split("\n");
		if (lines.length === 0) return [];

		// Skip header row - look for "S.N" which is the actual column name
		const startIndex =
			lines[0]?.includes("S.N") && lines[0]?.includes("Scrip") ? 1 : 0;
		const transactions: RawHoldingTransaction[] = [];

		for (let i = startIndex; i < lines.length; i++) {
			const line = lines[i].trim();
			if (!line) continue;

			const values = parseCSVLine(line);

			// CSV has 7 columns: S.N, Scrip, Transaction Date, Credit Quantity, Debit Quantity, Balance After Transaction, History Description
			if (values.length >= 7) {
				transactions.push({
					"S.N": values[0],
					Scrip: values[1],
					"Transaction Date": values[2],
					"Credit Quantity": values[3],
					"Debit Quantity": values[4],
					"Balance After Transaction": values[5],
					"History Description": values[6],
				});
			}
		}

		return transactions;
	} catch (e) {
		void track({
			context: Env.CONTENT,
			eventName: EventName.TRANSACTION_PARSE_FAILED,
			params: { error: e as string, location: "meroshare-content-api" },
		});

		logger.error("Meroshare: Failed to parse transaction CSV", e);

		throw e; // Rethrow to be handled by caller
	}
}

function parseCSVLine(line: string): string[] {
	const values: string[] = [];
	let current = "";
	let inQuotes = false;

	for (const char of line) {
		if (char === '"') {
			inQuotes = !inQuotes;
		} else if (char === "," && !inQuotes) {
			values.push(current.trim());
			current = "";
		} else {
			current += char;
		}
	}
	values.push(current.trim());

	return values;
}

// =============== API Results ===============

export interface FetchResult<T> {
	success: boolean;
	data?: T;
	error?: string;
	/** True when WACC calculation is pending - user needs to complete WACC on Meroshare */
	isWaccPending?: boolean;
}

// =============== API Calls ===============

/**
 * 1. Fetch client's own details from Meroshare
 */
export async function fetchClientDetails(): Promise<
	FetchResult<ClientDetails>
> {
	const authorization = getAuthorization();
	if (!authorization) {
		return { success: false, error: "Not authenticated" };
	}

	try {
		const response = await fetch(OWN_DETAIL_URL, {
			method: "GET",
			headers: { authorization },
		});

		if (!response.ok) {
			void track({
				context: Env.CONTENT,
				eventName: EventName.FETCH_CLIENT_DETAILS_FAILED,
				params: {
					error: `Failed: ${response.status} ${response.statusText}`,
					location: "meroshare-content-api",
				},
			});
			return {
				success: false,
				error: `Failed: ${response.status} ${response.statusText}`,
			};
		}

		const data: ClientDetails = await response.json();
		await setClientDetails(data);

		return { success: true, data };
	} catch (error) {
		void track({
			context: Env.CONTENT,
			eventName: EventName.FETCH_CLIENT_DETAILS_FAILED,
			params: { error: error as string, location: "meroshare-content-api" },
		});

		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * 2. Fetch WACC data from Meroshare
 */
export async function fetchWacc(
	boid: string,
): Promise<FetchResult<WaccApiItem[]>> {
	const authorization = getAuthorization();
	if (!authorization) {
		return { success: false, error: "Not authenticated" };
	}

	try {
		const response = await fetch(WACC_URL, {
			method: "POST",
			headers: {
				authorization,
				"content-type": "application/json",
			},
			body: JSON.stringify({
				demat: boid,
			}),
		});

		if (!response.ok) {
			return {
				success: false,
				error: `Failed: ${response.status} ${response.statusText}`,
			};
		}

		const data: WaccApiResponse = await response.json();

		// Handle WACC pending state - user needs to complete WACC calculation on Meroshare
		if (data.isWaccPending === true) {
			// Store the pending state so UI can react
			await setWaccPendingError(boid, data.message);
			return {
				success: false,
				error: data.message || "WACC calculation pending",
				isWaccPending: true,
			};
		}

		if (data.message !== "SUCCESS.") {
			void track({
				context: Env.CONTENT,
				eventName: EventName.FETCH_WACC_FAILED,
				params: {
					error: `Failed: ${response.status} ${response.statusText}`,
					location: "meroshare-content-api",
				},
			});

			return {
				success: false,
				error: data.message || "WACC fetch failed",
			};
		}

		const waccItems = data.waccReportResponse || [];
		await setWacc(boid, waccItems);
		// Clear any pending error on success
		await clearWaccPendingError(boid);

		return { success: true, data: waccItems };
	} catch (error) {
		void track({
			context: Env.CONTENT,
			eventName: EventName.FETCH_WACC_FAILED,
			params: { error: error as string, location: "meroshare-content-api" },
		});

		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * 3. Fetch transaction history from Meroshare
 */
export async function fetchTransactionHistory(
	boid: string,
	clientCode: string,
): Promise<FetchResult<RawHoldingTransaction[]>> {
	const authorization = getAuthorization();
	if (!authorization) {
		return { success: false, error: "Not authenticated" };
	}

	try {
		const response = await fetch(TRANSACTION_URL, {
			method: "POST",
			headers: {
				authorization,
				"content-type": "application/json",
			},
			body: JSON.stringify({
				boid,
				clientCode,
				script: null,
				requestTypeScript: false,
				page: 1,
				size: 200,
			}),
		});

		if (!response.ok) {
			void track({
				context: Env.CONTENT,
				eventName: EventName.FETCH_TRANSACTIONS_FAILED,
				params: {
					error: `Failed: ${response.status} ${response.statusText}`,
					location: "meroshare-content-api",
				},
			});

			return {
				success: false,
				error: `Failed: ${response.status} ${response.statusText}`,
			};
		}

		const csvText = await response.text();

		if (!csvText || csvText.trim().length === 0) {
			await setTransactions(boid, clientCode, []);
			return { success: true, data: [] };
		}

		const transactions = parseTransactionCSV(csvText);
		await setTransactions(boid, clientCode, transactions);

		return { success: true, data: transactions };
	} catch (error) {
		void track({
			context: Env.CONTENT,
			eventName: EventName.FETCH_TRANSACTIONS_FAILED,
			params: { error: error as string, location: "meroshare-content-api" },
		});

		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * 4. Fetch portfolio data from Meroshare
 */
export async function fetchPortfolio(
	boid: string,
	clientCode: string,
): Promise<FetchResult<PortfolioApiItem[]>> {
	const authorization = getAuthorization();
	if (!authorization) {
		return { success: false, error: "Not authenticated" };
	}

	try {
		const response = await fetch(PORTFOLIO_URL, {
			method: "POST",
			headers: {
				authorization,
				"content-type": "application/json",
			},
			body: JSON.stringify({
				sortBy: "script",
				demat: [boid],
				clientCode,
				page: 1,
				size: 200,
				sortAsc: true,
			}),
		});

		if (!response.ok) {
			void track({
				context: Env.CONTENT,
				eventName: EventName.FETCH_PORTFOLIO_FAILED,
				params: {
					error: `Failed: ${response.status} ${response.statusText}`,
					location: "meroshare-content-api",
				},
			});

			return {
				success: false,
				error: `Failed: ${response.status} ${response.statusText}`,
			};
		}

		const data: PortfolioApiResponse = await response.json();
		const portfolioItems = data.meroShareMyPortfolio || [];

		await setPortfolioApi(
			boid,
			portfolioItems,
			data.totalValueOfLastTransPrice,
			data.totalValueOfPrevClosingPrice,
		);

		return { success: true, data: portfolioItems };
	} catch (error) {
		void track({
			context: Env.CONTENT,
			eventName: EventName.FETCH_PORTFOLIO_FAILED,
			params: { error: error as string, location: "meroshare-content-api" },
		});

		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

// =============== Sync All Data ===============

/**
 * Sync all Meroshare data - fire and forget
 * Order: fetchClientDetails first, then WACC + portfolio + transactions in parallel
 */
export async function syncMeroshareData(): Promise<void> {
	try {
		// Step 1: Get client details first (required for other calls)
		const clientResult = await fetchClientDetails();
		if (!clientResult.success || !clientResult.data) return;

		const { demat, clientCode } = clientResult.data;

		// Step 2: Fetch WACC, portfolio, and transactions in parallel (all independent)
		await Promise.all([
			fetchWacc(demat),
			fetchPortfolio(demat, clientCode),
			fetchTransactionHistory(demat, clientCode),
		]);
	} catch (error) {
		void track({
			context: Env.CONTENT,
			eventName: EventName.PORTFOLIO_SYNC_FAILED,
			params: { error: error as string, location: "meroshare-portfolio-sync" },
		});
	}
}
