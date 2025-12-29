import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { sendNotification } from "@/controllers/notification";
import { convex } from "@/convex-client";
import { generateMarketSummary } from "@/data/market-summary";
import {
	NotificationPriority,
	NotificationVariant,
} from "@/types/notification";
import { patchCompaniesWithMonthInfo } from "../all-companies-daily";
import { latestMarketStatus } from "../cron";
import {
	getAllIntradayStockCharts,
	startRoomsListener,
} from "./rooms-listener";

export const isNepseOpen = await convex.query(api.marketStatus.isOpen, {});

// Start the rooms listener to watch for watchlist updates
await startRoomsListener();

// Only trigger notification if isOpen or state changes compared to latestMarketStatus from cron
convex.onUpdate(api.marketStatus.get, {}, async (messages) => {
	if (
		!messages ||
		typeof messages.isOpen !== "boolean" ||
		typeof messages.state !== "string"
	)
		return;

	const current = { isOpen: messages.isOpen, state: messages.state };

	if (
		latestMarketStatus &&
		latestMarketStatus.isOpen === current.isOpen &&
		latestMarketStatus.state === current.state
	) {
		// Only asOf or other fields changed, ignore
		return;
	}

	// Update the shared latestMarketStatus for consistency
	if (latestMarketStatus) {
		latestMarketStatus.isOpen = current.isOpen;
	}

	if (current.isOpen === true) {
		await sendNotification(
			"Market Opened",
			"Market is open for trading",
			NotificationVariant.INFO,
			NotificationPriority.LOW,
		);
	}

	if (current.isOpen === false) {
		const message = await generateMarketSummary();

		await sendNotification(
			"Market Closed",
			message,
			NotificationVariant.INFO,
			NotificationPriority.LOW,
		);

		await getAllIntradayStockCharts();
		await patchCompaniesWithMonthInfo(); //@@ to do, do we need to patch the index daily as well?
		//notice if adjusted price is reflected in last refresh of index intraday chart
	}
});
