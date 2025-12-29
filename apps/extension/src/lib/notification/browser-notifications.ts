// import { EventName } from "@/types/analytics-types";
// import { OpenPanelSDK } from "@/utils/open-panel-sdk";
// import defaultImage from "~/assets/icon.png";

// interface NotificationOptions {
// 	title: string;
// 	body: string;
// 	icon?: string;
// }

// export async function showBrowserNotification({
// 	title,
// 	body,
// 	icon,
// }: NotificationOptions): Promise<{ success: boolean; message: string }> {
// 	try {
// 		// Check if browser notifications permission is granted
// 		const permissionLevel = await browser.notifications.getPermissionLevel();

// 		if (permissionLevel === "denied") {
// 			OpenPanelSDK.track(EventName.PERMISSION_DENIED, {
// 				permission: "notifications",
// 			});

// 			return {
// 				success: false,
// 				message: "Notifications permission is not granted.",
// 			};
// 		}

// 		// biome-ignore lint/suspicious/noExplicitAny: <known>
// 		const data: any = {
// 			type: "basic",
// 			title: title,
// 			iconUrl: icon || defaultImage,
// 			message: body,
// 		};

// 		browser.notifications.create(
// 			`notif-${Date.now()}`,
// 			data,
// 			(notificationId) => {
// 				if (notificationId) {
// 					return {
// 						success: true,
// 						message: "Browser notification shown successfully",
// 					};
// 				} else {
// 					OpenPanelSDK.track(EventName.NOTIFICATION_ERROR, {
// 						error: "Failed to create browser notification",
// 						timestamp: new Date().toISOString(),
// 						data: data,
// 					});
// 					return {
// 						success: false,
// 						message: "Failed to show browser notification",
// 					};
// 				}
// 			},
// 		);

// 		return { success: false, message: "Failed to show browser notification" };
// 	} catch (error) {
// 		const errorMessage = error instanceof Error ? error.message : String(error);

// 		OpenPanelSDK.track(EventName.NOTIFICATION_ERROR, {
// 			error: errorMessage,
// 			stack: error instanceof Error ? error.stack : undefined,
// 			timestamp: new Date().toISOString(),
// 			data: { title, body, icon },
// 		});

// 		return {
// 			success: false,
// 			message: "Failed to show browser notification",
// 		};
// 	}
// }
