import z from "@nepse-dashboard/zod";

// Matches Convex notificationVariant type
export enum NotificationVariant {
	SUCCESS = "success",
	INFO = "info",
	ERROR = "error",
	WARNING = "warning",
}

export enum NotificationPriority {
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
}

// Matches Convex notification schema
export const notifications = z.object({
	userId: z.string().optional(), // if present, targeted to specific user
	title: z.string().min(1).max(100),
	body: z.string().min(1).max(500),
	variant: NotificationVariant,
	icon: z.string().optional(),
	expiresAt: z.number().optional(),
});

export type NotificationType = z.infer<typeof notifications>;
