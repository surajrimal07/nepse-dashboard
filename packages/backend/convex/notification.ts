import { v } from "convex/values";
import { internal } from "./_generated/api";

import {
	internalMutation,
	internalQuery,
	type MutationCtx,
	mutation,
	query,
} from "./_generated/server";
import { notificationVariant } from "./utils/types";

export const getGlobal = query({
	handler: async (ctx) => {
		// get all notification except those which has userId data
		const notifications = await ctx.db
			.query("notification")
			.order("desc")
			.collect();

		const globalNotifications = notifications.filter(
			(notif) => !("userId" in notif),
		);

		return globalNotifications;
	},
});

export const getByUserId = query({
	args: {
		userId: v.optional(v.string()),
	},
	handler: async (ctx, { userId }) => {
		if (!userId) {
			return [];
		}

		const notifications = await ctx.db
			.query("notification")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.order("desc")
			.collect();

		return notifications;
	},
});

export async function createNotification(
	ctx: MutationCtx,
	args: {
		userId?: string;
		title: string;
		body: string;
		variant: "info" | "success" | "warning" | "error";
		icon?: string;
		expiresAt?: number;
	},
) {
	await ctx.db.insert("notification", args);

	await ctx.scheduler.runAfter(0, internal.webPush.send, {
		title: args.title,
		body: args.body,
		variant: args.variant,
		icon: args.icon,
		userId: args.userId,
	});
}

export const create = mutation({
	args: {
		userId: v.optional(v.string()), //if present, targeted to specific user
		title: v.string(),
		body: v.string(),
		variant: notificationVariant,
		icon: v.optional(v.string()),
		expiresAt: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		await createNotification(ctx, args);
	},
});

export const getAllSubscriptions = internalQuery({
	handler: async (ctx) => {
		return await ctx.db.query("push_subscriptions").collect();
	},
});

export const getSubscriptionsByUserId = internalQuery({
	args: {
		userId: v.optional(v.string()),
	},
	handler: async (ctx, { userId }) => {
		if (!userId) {
			return [];
		}

		return (
			(await ctx.db
				.query("push_subscriptions")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.collect()) || []
		);
	},
});

export const doIHaveSubscription = query({
	args: {
		userId: v.string(),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("push_subscriptions")
			.withIndex("by_userId", (q) => q.eq("userId", args.userId))
			.unique();

		return existing !== null;
	},
});

// export const deleteOne = mutation({
// 	args: {
// 		id: v.id("notifications"),
// 	},
// 	handler: async (ctx, args) => {
// 		const userId = await getAuthUserId(ctx);
// 		if (!userId) return null;

// 		// Check if the notification belongs to the user
// 		const notification = await ctx.db.get(args.id);
// 		if (!notification || notification.userId !== userId) {
// 			throw new ConvexError("Not authorized");
// 		}

// 		await ctx.db.delete(args.id);
// 		return { success: true };
// 	},
// });

// export const markAsRead = mutation({
// 	args: {
// 		id: v.id("notifications"),
// 	},
// 	handler: async (ctx, args) => {
// 		const userId = await getAuthUserId(ctx);
// 		if (!userId) return null;

// 		// Check if the notification belongs to the user
// 		const notification = await ctx.db.get(args.id);
// 		if (!notification || notification.userId !== userId) {
// 			throw new ConvexError("Not authorized");
// 		}

// 		await ctx.db.patch(args.id, {
// 			read: true,
// 			readAt: new Date().toISOString(),
// 		});

// 		return { success: true };
// 	},
// });

export const clearOld = internalMutation({
	args: {
		days: v.number(),
	},
	handler: async (ctx, args) => {
		const currentDate = Date.now();
		const cleanUpDay = currentDate - args.days * 24 * 60 * 60 * 1000;

		// Delete old global notifications
		const oldGlobals = await ctx.db.query("notification").collect();

		for (const notif of oldGlobals) {
			if (notif._creationTime < cleanUpDay) {
				await ctx.db.delete(notif._id);
			}
		}

		return { success: true };
	},
});

export const clearExpiredAtNotifications = internalMutation({
	handler: async (ctx) => {
		const currentDate = Date.now();

		// Delete old global notifications
		const oldGlobals = await ctx.db.query("notification").collect();

		// filter out notifications which do not have expiresAt
		if (oldGlobals.length !== 0) {
			const filteredGlobals = oldGlobals.filter(
				(notif) =>
					notif.expiresAt !== undefined && notif.expiresAt < currentDate,
			);

			for (const notif of filteredGlobals) {
				await ctx.db.delete(notif._id);
			}
		}

		return { success: true };
	},
});

export const subscribe = mutation({
	args: {
		userId: v.string(),
		subscription: v.object({
			endpoint: v.string(),
			keys: v.object({
				p256dh: v.string(),
				auth: v.string(),
			}),
			userAgent: v.optional(v.string()),
		}),
	},

	handler: async (ctx, { userId, subscription }) => {
		const existing = await ctx.db
			.query("push_subscriptions")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.unique();

		if (existing) {
			await ctx.db.patch(existing._id, {
				updatedAt: Date.now(),
				keys: subscription.keys,
				userAgent: subscription.userAgent,
				endpoint: subscription.endpoint,
			});
			return;
		}

		await ctx.db.insert("push_subscriptions", {
			userId,
			endpoint: subscription.endpoint,
			keys: subscription.keys,
			userAgent: subscription.userAgent,
			updatedAt: Date.now(),
		});
	},
});

export const unsubscribe = mutation({
	args: {
		userId: v.string(),
	},
	handler: async (ctx, { userId }) => {
		const existing = await ctx.db
			.query("push_subscriptions")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.unique();

		if (existing) {
			await ctx.db.delete(existing._id);
		}
	},
});
