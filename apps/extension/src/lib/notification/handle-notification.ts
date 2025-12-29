import { sendMessage } from "@/lib/messaging/extension-messaging";
import { Env, EventName } from "@/types/analytics-types";
import type { stateResult } from "@/types/misc-types";
import type { NotificationVariant } from "@/types/notification-types";
import { isRestrictedUrl } from "@/utils/is-allowed";
import { Track } from "../analytics/analytics";

const defaultImage = browser.runtime.getURL("/icons/48.png");

export async function handleNotification(
	title: string,
	body: string,
	variant?: NotificationVariant,
	icon?: string,
): Promise<stateResult> {
	try {
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});

		// Explicitly handle undefined tab
		if (!tab) {
			const permissionLevel = await browser.notifications.getPermissionLevel();

			if (permissionLevel === "granted") {
				// biome-ignore lint/suspicious/noExplicitAny: <iknow>
				const data: any = {
					type: "basic",
					title: title,
					iconUrl: icon ?? (icon || defaultImage),
					message: body,
				};

				browser.notifications.create(
					`notif-${Date.now()}`,
					data,
					(notificationId) => {
						if (notificationId) {
							return {
								success: true,
								message: "Browser notification shown successfully",
							};
						} else {
							Track({
								context: Env.BACKGROUND,
								eventName: EventName.NOTIFICATION_ERROR,
								params: {
									error: "Failed to create browser notification",
									data: data,
								},
							});

							return {
								success: false,
								message: "Failed to show browser notification",
							};
						}
					},
				);
			}
		} else if ((tab.id || tab.url) && (!tab.url || !isRestrictedUrl(tab.url))) {
			await sendMessage(
				"showNotification",
				{ title, body, variant, icon },
				tab.id,
			);
			return { success: true, message: "Notification sent" };
		}

		Track({
			context: Env.BACKGROUND,
			eventName: EventName.PERMISSION_DENIED,
			params: {
				permission: "notifications",
			},
		});

		return {
			success: false,
			message: "An error occurred while showing notification",
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);

		Track({
			context: Env.BACKGROUND,
			eventName: EventName.NOTIFICATION_ERROR,
			params: {
				error: errorMessage,
				stack: error instanceof Error ? error.stack : undefined,
			},
		});

		return { success: false, message: "Failed to show notification" };
	}
}
