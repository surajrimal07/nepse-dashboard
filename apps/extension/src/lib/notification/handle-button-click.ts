// import { CONFIG } from "@/constants/app-config";
// import { URLS } from "@/constants/app-urls";
// import {
// 	MEROSHARE_IPO_URL,
// 	MEROSHARE_PORTFOLIO_URL,
// } from "@/constants/content-url";
// import { getAppState } from "@/entrypoints/background";
// import { EventName } from "@/types/analytics-types";
// import type { NotificationType } from "@/types/notification-types";
// import { OpenPanelSDK } from "@/utils/open-panel-sdk";
// import { handleNotification } from "./handle-notification";

// export async function handleNotificationButtonAccept(
// 	notification: NotificationType,
// ): Promise<void> {
// 	const firstButtonAction = notification.buttons?.[0]?.action;

// 	if (!firstButtonAction) {
// 		OpenPanelSDK.track(EventName.NOTIFICATION_BUTTON_ACCEPT_NO_ACTION, {
// 			notification,
// 		});
// 		return;
// 	}

// 	// Handle all NotificationActionTypeEnum cases for the accept button
// 	switch (firstButtonAction) {
// 		case "view_news":
// 		case "open_link": {
// 			const link = notification.data?.link;
// 			if (link) {
// 				OpenPanelSDK.track(EventName.LINK_OPENED, { link });
// 				await browser.tabs.create({ url: link, active: true });
// 			}
// 			break;
// 		}

// 		case "remind_ipo": {
// 			// By default 24 hour reminder
// 			const appState = getAppState();

// 			const existingReminders = appState.get()
// 				.remainderNotification as NotificationType[];

// 			// Check if the notification already exists in the reminders
// 			const existingReminder = existingReminders.find(
// 				(reminder) => reminder.id === notification.id,
// 			);

// 			if (existingReminder) {
// 				// delete the existing reminder
// 				await browser.alarms.clear(notification.id);
// 				const index = existingReminders.indexOf(existingReminder);
// 				if (index > -1) {
// 					existingReminders.splice(index, 1);
// 				}
// 			}

// 			// Add the notification to the reminders
// 			existingReminders.push(notification);
// 			appState.set({ remainderNotification: existingReminders });

// 			await browser.alarms.create(notification.id, {
// 				delayInMinutes: CONFIG.notification_remainder_delay,
// 			});

// 			// Let the user know the reminder is set for 24 hours later
// 			const newNotification: NotificationType = {
// 				id: notification.id,
// 				category: "system",
// 				chromeType: "basic",
// 				title: "IPO Reminder Set",
// 				message: `You will be reminded about the IPO tomorrow.`,
// 				iconUrl: notification.iconUrl,
// 				level: notification.level,
// 			};

// 			await handleNotification(newNotification);
// 			break;
// 		}

// 		case "view_chart": {
// 			const symbol = notification.data?.stock;

// 			if (symbol) {
// 				OpenPanelSDK.track(EventName.CHART_OPENED, { symbol });
// 				browser.tabs.create({
// 					url: `${URLS.chart_url}${symbol}`,
// 				});
// 			}

// 			break;
// 		}

// 		case "view_portfolio":
// 			await browser.tabs.create({ url: MEROSHARE_PORTFOLIO_URL, active: true });
// 			break;

// 		case "apply_ipo":
// 			await browser.tabs.create({ url: MEROSHARE_IPO_URL, active: true });
// 			break;

// 		case "view_market_summary": {
// 			const link = notification.data?.link;

// 			if (link) {
// 				OpenPanelSDK.track(EventName.LINK_OPENED, { link });
// 				browser.tabs.create({
// 					url: link,
// 				});
// 			}
// 			break;
// 		}

// 		case "open_oddlot": // todo
// 			console.error("Opening oddlot not implemented yet");
// 			break;

// 		default:
// 			console.error("Unknown accept action:", firstButtonAction);
// 			break;
// 	}

// 	// Track the accept action
// 	OpenPanelSDK.track(EventName.NOTIFICATION_BUTTON_ACCEPT, {
// 		action: firstButtonAction,
// 		notificationId: notification.id,
// 		category: notification.category,
// 	});
// }

// export async function handleNotificationReject(
// 	notification: NotificationType,
// ): Promise<void> {
// 	browser.notifications.clear(notification.id, () => {
// 		OpenPanelSDK.track(EventName.NOTIFICATION_BUTTON_REJECT, {
// 			action: notification.buttons?.[1]?.action,
// 			notificationId: notification.id,
// 			category: notification.category,
// 		});
// 	});
// }
