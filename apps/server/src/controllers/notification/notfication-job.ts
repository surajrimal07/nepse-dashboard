import { logger } from "@nepse-dashboard/logger";
import { isNepseOpen } from "@/controllers/event-listners/index.js";
import { generateMarketSummary } from "../../data/market-summary.js";
import {
	NotificationPriority,
	NotificationVariant,
} from "../../types/notification.js";
import { sendNotification } from "./index.js";

export async function triggerMarketSummaryAlert() {
	if (!isNepseOpen) {
		logger.info("Nepse is closed, skipping market summary alert.");
		return;
	}

	const message = await generateMarketSummary();

	const nepalTime = new Date().toLocaleString("en-US", {
		timeZone: "Asia/Kathmandu",
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	});

	const title = `${nepalTime} NEPSE Update`;

	await sendNotification(
		title,
		message,
		NotificationVariant.INFO,
		NotificationPriority.LOW,
	);
}
