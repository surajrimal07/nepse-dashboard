import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { browser } from "#imports";
import { Track } from "@/lib/analytics/analytics";
import { handleNotification } from "@/lib/notification/handle-notification";
import { getUser } from "@/lib/storage/user-storage";
import { Env, EventName } from "@/types/analytics-types";
import { logger } from "@/utils/logger";
import { getAppState, getConvexClient } from ".";
import { urlB64ToUint8Array } from "./urlB64ToUint8Array";

let pushSubscription: PushSubscription | null = null;

const notificationVapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

if (!notificationVapidPublicKey) {
	void Track({
		context: Env.BACKGROUND,
		eventName: EventName.EXCEPTION,
		params: {
			error: "Missing VAPID_PUBLIC_KEY environment variable",
			name: "Web Push Subscription",
		},
	});

	throw new Error("VAPID public key is not defined");
}

// Helper function to handle Web Push subscription
export async function handleWebPushSubscription(checkPermission = true) {
	if (checkPermission) {
		const enabled = getAppState().get().notification;
		if (!enabled) {
			return;
		}

		const permission = await browser.notifications.getPermissionLevel();
		if (permission !== "granted") {
			logger.info("Notifications permission not granted");
			return;
		}
	}

	const applicationServerKey = urlB64ToUint8Array(notificationVapidPublicKey);

	pushSubscription = await self.registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey,
	});

	if (!pushSubscription) {
		return;
	}

	const json = pushSubscription.toJSON();

	if (!json.endpoint || !json.keys) {
		void Track({
			context: Env.BACKGROUND,
			eventName: EventName.EXCEPTION,
			params: {
				error: "Invalid push subscription",
				name: "Web Push Subscription",
			},
		});
		return;
	}

	// send the subscription to convex
	await getConvexClient().mutation(api.notification.subscribe, {
		userId: (await getUser()).randomId,
		subscription: {
			endpoint: json.endpoint,
			keys: json.keys as { p256dh: string; auth: string },
			userAgent: navigator.userAgent,
		},
	});
}

export async function setupNotification() {
	getAppState().subscribe(async (_state, changes) => {
		if ("notification" in changes) {
			const enabled = changes.notification;

			const permission = await browser.notifications.getPermissionLevel();
			if (enabled && permission === "granted") {
				// Run your notification setup if enabled
				await handleWebPushSubscription(false);
				await notificationListener();
			} else if ((!enabled || permission === "denied") && pushSubscription) {
				try {
					// remove data from convex if disabled
					await getConvexClient().mutation(api.notification.unsubscribe, {
						userId: (await getUser()).randomId,
					});

					await pushSubscription.unsubscribe();
					logger.info("Push subscription disabled due to revoked permissions");
					pushSubscription = null;
				} catch (error) {
					void Track({
						context: Env.BACKGROUND,
						eventName: EventName.NOTIFICATION_ERROR,
						params: {
							error: `Failed to unsubscribe push subscription: ${String(error)}`,
							name: "Push Unsubscribe",
						},
					});
				}
			}
		}
	});
}

async function notificationListener() {
	self.addEventListener("push", async (event) => {
		const notificationData = JSON.parse(event?.data?.text());

		const title = notificationData?.title;
		const body = notificationData?.body;
		const variant = notificationData?.variant || "info";
		const icon = notificationData?.icon || undefined;

		if (!title || !body) {
			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.NOTIFICATION_ERROR,
				params: {
					error: "Invalid notification data",
					name: "Push Event",
					data: notificationData,
				},
			});

			return;
		}

		await handleNotification(title, body, variant, icon);
	});
}
