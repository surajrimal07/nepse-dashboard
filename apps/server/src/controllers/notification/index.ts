import { api } from "@nepse-dashboard/convex/convex/_generated/api.js";
import { logger } from "@nepse-dashboard/logger";
import { convex } from "@/convex-client.js";
import { EventType } from "@/types/error-types.js";
import Track from "@/utils/analytics.js";
import {
	NotificationPriority,
	type NotificationVariant,
} from "../../types/notification.js";
import { telegramBot } from "../../utils/telegram/telegram.js";

function formatTelegramMessage(
	title: string,
	body: string,
	link?: string,
): string {
	return `<b>${title}</b>\n${body}${link ? `\n\n<a href="${link}">View Details</a>` : ""}`;
}

// Main notification function
export async function sendNotification(
	title: string,
	body: string,
	variant: NotificationVariant,
	priority: NotificationPriority = NotificationPriority.MEDIUM,
	link?: string,
	userId?: string,
	icon?: string,
	expiresAt?: number,
): Promise<void> {
	try {
		// Send to Telegram if enabled
		if (telegramBot.isEnabled()) {
			await telegramBot.sendMessage(formatTelegramMessage(title, body, link), {
				parseMode: "HTML",
				disableNotification: priority === NotificationPriority.LOW,
			});
		}
		// Send to Convex (triggers web push notifications)
		await convex.mutation(api.notification.create, {
			title,
			body,
			variant,
			userId, // Optional - if provided, notification is targeted to specific user
			icon,
			expiresAt,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);

		Track(EventType.UNKNOWN_ERROR, {
			location: "sendNotification",
			details: errorMessage,
		});

		logger.error(errorMessage);
	}
}
