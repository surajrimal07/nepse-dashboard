import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { captureException } from "@sentry/bun";
import { Cron } from "croner";
import { triggerMarketSummaryAlert } from "@/controllers/notification/notfication-job";
import { convex } from "@/convex-client";
import { type IndexKey, indexKeySchema } from "@/types/indexes";
import { listedStocks } from "./all-companies";
import { getStockDaily } from "./companies-daily-chart";
import { getStockIntraday } from "./companies-intraday-chart";
import { indexIntradayChart } from "./index-intraday-chart";
import { marketDepth } from "./market-depth";
import { getMarketStatus } from "./market-status";
import { getNepseDashboard } from "./nepse-dashboard";
import { getNepseIntraday } from "./nepse-index-data";
import { getIndexData } from "./other-index-data";
import { getSentiment } from "./sentiment";
import { getSupplyDemandData } from "./supply-demand";

const timezone = "Asia/Kathmandu";
const delayInMS = 2000;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Store and export the latest market status result (shared across modules)
export let latestMarketStatus:
	| Awaited<ReturnType<typeof getMarketStatus>>
	| undefined;
export function getLatestMarketStatus() {
	return latestMarketStatus;
}

// Market open hours: Sun-Thu, between 10:45 AM–3:05 PM
// getMarketStatus runs from 10:45 AM, everything else from 11:00 AM
// Single cron pattern that runs every minute from 10 AM to 3 PM, with filtering inside
const cronPatterns =
	process.env.NODE_ENV === "development"
		? "* * * * *"
		: "0 * 10-15 * * 0,1,2,3,4";

const notificationCronPatterns = "0 */15 * * * *"; // Every 15 minutes for market updates

// Helper function to check if current time is within market hours for getMarketStatus
function isMarketStatusHours(): boolean {
	const now = new Date();
	const hour = now.getHours();
	const minute = now.getMinutes();

	// Check if current time is within 10:45 AM to 3:05 PM for getMarketStatus
	const isInRange =
		(hour === 10 && minute >= 45) || // 10:45 AM onwards
		(hour >= 11 && hour <= 14) || // 11:00 AM to 2:59 PM
		(hour === 15 && minute <= 5); // 3:00 PM to 3:05 PM

	return process.env.NODE_ENV === "development" ? true : isInRange;
}

// Helper function to check if current time is within market hours for other functions
function isFullMarketHours(): boolean {
	const now = new Date();
	const hour = now.getHours();
	const minute = now.getMinutes();

	// Check if current time is within 11:00 AM to 3:05 PM for all other functions
	const isInRange =
		(hour >= 11 && hour <= 14) || // 11:00 AM to 2:59 PM
		(hour === 15 && minute <= 5); // 3:00 PM to 3:05 PM

	return process.env.NODE_ENV === "development" ? true : isInRange;
}

async function executeMarketDataUpdate() {
	const shouldRunMarketStatus = isMarketStatusHours();
	const shouldRunOtherFunctions = isFullMarketHours();

	if (!(shouldRunMarketStatus || shouldRunOtherFunctions)) {
		logger.info(
			"[Cron][MarketData] Skipping execution - outside all market hours",
			{
				currentTime: new Date().toLocaleString("en-US", { timeZone: timezone }),
			},
		);
		return;
	}

	const startTime = Date.now();

	try {
		logger.info("[Cron][MarketData] Starting market data update", {
			currentTime: new Date().toLocaleString("en-US", { timeZone: timezone }),
			runMarketStatus: shouldRunMarketStatus,
			runOtherFunctions: shouldRunOtherFunctions,
		});

		let marketOpen = false;

		// Always run getMarketStatus if within its time range (10:45 AM - 3:05 PM)
		if (shouldRunMarketStatus) {
			console.log("Running getMarketStatus");
			latestMarketStatus = await getMarketStatus();
			marketOpen = latestMarketStatus?.isOpen ?? false;
		}

		// Only run other functions if within 11:00 AM - 3:05 PM AND market is open
		if (shouldRunOtherFunctions && marketOpen) {
			const items = await convex.query(api.rooms.getUniqueItems, {});

			logger.info(
				"[Cron][MarketData] Running full market data update with items:",
				items,
			);

			await delay(delayInMS);

			await getNepseDashboard();
			await delay(delayInMS);

			for (const item of items.marketDepth) {
				await marketDepth(item);
				await delay(delayInMS);
			}

			for (const item of items.stockCharts) {
				await getStockIntraday(item);
				await delay(delayInMS);
				await getStockDaily(item);
				await delay(delayInMS);
			}

			for (const item of indexKeySchema.options) {
				//regardless of subscribed index, try to fetch all
				await indexIntradayChart(item as IndexKey);
				await delay(delayInMS);
			}

			await getNepseIntraday();
			await delay(delayInMS);

			await getIndexData();
			await delay(delayInMS);

			await getSupplyDemandData();
			await delay(delayInMS);

			await listedStocks();
			await delay(delayInMS);

			await getSentiment();
		} else if (shouldRunOtherFunctions && !marketOpen) {
			logger.info(
				"[Cron][MarketData] Market is closed, skipping other functions.",
			);
		}

		const duration = Date.now() - startTime;
		const durationInMinutes = (duration / 1000 / 60).toFixed(2);
		logger.info(
			`[Cron][MarketData] Completed successfully in ${durationInMinutes} minutes`,
			{
				ranMarketStatus: shouldRunMarketStatus,
				ranOtherFunctions: shouldRunOtherFunctions && marketOpen,
			},
		);
	} catch (err) {
		logger.error("[Cron][MarketData] Error:", err);
		captureException(err);
	}
}

export const cronJob = new Cron(
	cronPatterns,
	{
		name: "MarketDataUpdate",
		timezone,
		catch: (err) => {
			logger.error("[Cron][MarketData] Cron job error:", err);
			captureException(err);
		},
	},
	executeMarketDataUpdate,
);

export const notificationCronJob = new Cron(
	notificationCronPatterns,
	{
		name: "MarketNotificationUpdate",
		timezone,
		catch: (err) => {
			logger.error("[Cron][MarketData] Cron job error:", err);
			captureException(err);
		},
	},
	triggerMarketSummaryAlert,
);
