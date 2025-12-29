// import { EventName } from "@/types/analytics-types";
// import type { stateResult } from "@/types/misc-types";
// import type { NotificationType } from "@/types/notification-types";
// import { NotificationPayloadSchema } from "@/types/notification-types";
// import { OpenPanelSDK } from "@/utils/open-panel-sdk";

// export function validateNotification(data: NotificationType): stateResult {
// 	const parsed = NotificationPayloadSchema.safeParse(data);

// 	if (!parsed.success) {
// 		OpenPanelSDK.track(EventName.SCHEMA_EXCEPTION, {
// 			error: `Invalid notification data: ${parsed.error}`,
// 			name: "handleNotification",
// 		});

// 		return { success: false, message: "Invalid notification data" };
// 	}

// 	if (data.expiresAt && Date.now() > data.expiresAt) {
// 		OpenPanelSDK.track(EventName.NOTIFICATION_EXPIRED, {
// 			expiresAt: data.expiresAt,
// 			currentTimestamp: new Date().toISOString(),
// 		});

// 		return { success: false, message: "Notification has expired" };
// 	}

// 	return { success: true, message: "Notification data is valid" };
// }
