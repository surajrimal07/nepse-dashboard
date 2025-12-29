"use node";
import { v } from "convex/values";
import { deserializeVapidKeys, sendPushNotification } from "web-push-browser";
import { api, internal } from "./_generated/api";

import { internalAction } from "./_generated/server";
import { notificationVariant } from "./utils/types";

export const send = internalAction({
	args: {
		title: v.string(),
		body: v.string(),
		variant: v.optional(notificationVariant),
		icon: v.optional(v.string()),
		userId: v.optional(v.string()),
	},
	returns: { success: v.boolean(), message: v.string() },
	handler: async (
		ctx,
		{ title, body, variant, icon, userId },
	): Promise<{ success: boolean; message: string }> => {
		const keyPair = await deserializeVapidKeys({
			publicKey:
				"BAy4jrd9vgmEZNvBJMQVDmpWxATVPC7Qdb6AMdB138QCFkl4zdOHHrMugntLcBBcwNa1sBl4kGIor6tXAGKwkJw",
			privateKey:
				"MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgHiBjZrVdCj3HHSHyOnfj5d-h1Fl8hFd3peijG7xNweChRANCAAQMuI63fb4JhGTbwSTEFQ5qVsQE1Twu0HW-gDHQdd_EAhZJeM3Thx6zLoJ7S3AQXMDWtbAZeJBiKK-rVwBisJCc",
		});

		let subscriptions = [];

		if (userId) {
			subscriptions = await ctx.runQuery(
				internal.notification.getSubscriptionsByUserId,
				{ userId },
			);
		} else {
			subscriptions = await ctx.runQuery(
				internal.notification.getAllSubscriptions,
			);
		}

		const subscriptionLength = subscriptions.length;

		if (subscriptionLength === 0) {
			return { success: false, message: "No subscriptions found" };
		}

		const message = JSON.stringify({
			title,
			body,
			variant,
			icon,
		});

		let sent = false;
		let count = 0;

		for (const subscription of subscriptions) {
			try {
				const { auth, p256dh } = subscription.keys;

				const res = await sendPushNotification(
					keyPair,
					{
						endpoint: subscription.endpoint,
						keys: {
							auth: auth,
							p256dh: p256dh,
						},
					},
					"hello@nepsechatbot.com",
					message,
				);

				if (!res.ok) {
					await ctx.runMutation(api.notification.unsubscribe, {
						userId: subscription.userId,
					});
					continue;
				}
				sent = true;
				count++;
			} catch (err) {
				console.error(
					"Push notification error for subscription",
					subscription,
					err,
				);
			}
		}
		return {
			success: sent,
			message: `Notified ${count} out of ${subscriptionLength} subscriptions`,
		};
	},
});
