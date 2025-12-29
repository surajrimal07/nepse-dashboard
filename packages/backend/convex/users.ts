import { ConvexError, v } from "convex/values";
import {
	internalMutation,
	type MutationCtx,
	type QueryCtx,
	query,
} from "./_generated/server";
import { getAdminConfig } from "./utils/utils";

const STALE_MS = 60_000; // 1 minute

// export const store = mutation({
// 	args: {},
// 	handler: async (ctx) => {
// 		const identity = await ctx.auth.getUserIdentity();
// 		if (!identity) {
// 			throw new Error("Called storeUser without authentication present");
// 		}

// 		// Check if we've already stored this identity before.
// 		// Note: If you don't want to define an index right away, you can use
// 		// ctx.db.query("users")
// 		//  .filter(q => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
// 		//  .unique();
// 		const user = await ctx.db
// 			.query("users")
// 			.withIndex("by_token", (q) =>
// 				q.eq("tokenIdentifier", identity.tokenIdentifier),
// 			)
// 			.unique();
// 		if (user !== null) {
// 			// If we've seen this identity before but the name has changed, patch the value.
// 			if (user.name !== identity.name) {
// 				await ctx.db.patch(user._id, { name: identity.name });
// 			}
// 			return user._id;
// 		}
// 		// If it's a new identity, create a new `User`.
// 		return await ctx.db.insert("users", {
// 			name: identity.name ?? "Anonymous",
// 			tokenIdentifier: identity.tokenIdentifier,
// 		});
// 	},
// });

// async function userByEmail(ctx: QueryCtx, email: string) {
// 	return await ctx.db
// 		.query("users")
// 		.withIndex("by_email", (q) => q.eq("email", email))
// 		.unique();
// }

// export async function getCurrentUserOrThrow(ctx: QueryCtx) {
// 	// const identity = await ctx.auth.getUserIdentity();

// 	// console.log("User Identity:", identity);

// 	// if (!identity) {
// 	// 	return null;
// 	// }

// 	// const userIdFromCtx = identity.subject as Id<"users">;

// 	const userId = await betterAuthComponent.getAuthUserId(ctx);
// 	if (!userId) {
// 		return null;
// 	}

// 	const user = await ctx.db.get(userId as Id<"users">);
// 	const userMetadata = await betterAuthComponent.getAuthUser(ctx);

// 	console.log("User Metadata:", userMetadata);

// 	return user;
// }

// export async function currentUserEmail(ctx: QueryCtx) {
// 	const identity = await ctx.auth.getUserIdentity();
// 	if (!identity) {
// 		throw new Error("User not authenticated");
// 	}
// 	const userEmail = identity.email;
// 	if (!userEmail) {
// 		throw new ConvexError("Email not found in user identity");
// 	}

// 	return userEmail;
// }

// export async function getCurrentUserTiers(ctx: QueryCtx) {
// 	const user = await getCurrentUserOrThrow(ctx);
// 	const subscription = await ctx.db
// 		.query("userSubscriptions")
// 		.withIndex("by_user_id", (q) => q.eq("user_id", user._id))
// 		.unique();

// 	if (!subscription) return "free";

// 	const plan = await ctx.db.get(subscription.tier);

// 	return plan ? plan.tier : "free";
// }

// export async function getUserTiers(ctx: QueryCtx, userId: Id<"users">) {
// 	const subscription = await ctx.db
// 		.query("userSubscriptions")
// 		.withIndex("by_user_id", (q) => q.eq("user_id", userId))
// 		.unique();

// 	if (!subscription) return "free";

// 	const plan = await ctx.db.get(subscription.tier);

// 	return plan ? plan.tier : "free";
// }

// export async function getUserToken(ctx: QueryCtx, userId: Id<"users">) {
// 	const subscription = await ctx.db
// 		.query("userSubscriptions")
// 		.withIndex("by_user_id", (q) => q.eq("user_id", userId))
// 		.unique();

// 	if (!subscription) throw "User does not have a subscription";

// 	const [plan, purchasedTokens, tokenUsed] = await Promise.all([
// 		ctx.db.get(subscription.tier),
// 		ctx.db
// 			.query("userTokenPurchases")
// 			.withIndex("by_user_id", (q) => q.eq("user_id", userId))
// 			.collect(),
// 		ctx.db
// 			.query("user_tokens_uses")
// 			.withIndex("by_user_id", (q) => q.eq("user_id", userId))
// 			.unique(),
// 	]);

// 	const tokensGranted =
// 		(plan?.tokens_granted ?? 0) +
// 		purchasedTokens.reduce((sum, token) => sum + token.tokens_granted, 0);

// 	const tokensRemaining =
// 		tokensGranted -
// 		((tokenUsed?.ai_chat_tokens_used ?? 0) +
// 			(tokenUsed?.news_summary_tokens_used ?? 0));

// 	return { tokensGranted, tokensRemaining };
// }

// export const current = query({
// 	args: {},
// 	handler: async (ctx) => {
// 		return await getCurrentUserOrThrow(ctx);
// 	},
// });

// export const upsertFromClerk = internalMutation({
// 	args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
// 	async handler(ctx, { data }) {
// 		const userAttributes = {
// 			name: `${data.first_name} ${data.last_name}`,
// 			externalId: data.id,
// 		};

// 		const user = await userByExternalId(ctx, data.id);
// 		if (user === null) {
// 			await ctx.db.insert("users", userAttributes);
// 		} else {
// 			await ctx.db.patch(user._id, userAttributes);
// 		}
// 	},
// });

// export const deleteFromClerk = internalMutation({
// 	args: { clerkUserId: v.string() },
// 	async handler(ctx, { clerkUserId }) {
// 		const user = await userByExternalId(ctx, clerkUserId);

// 		if (user !== null) {
// 			await ctx.db.delete(user._id);
// 		} else {
// 			console.warn(
// 				`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
// 			);
// 		}
// 	},
// });

// current exposes the user information to the client, which will helps the client determine whether the webhook already succeeded
// upsertFromClerk will be called when a user signs up or when they update their account
// deleteFromClerk will be called when a user deletes their account via Clerk UI from your app
// getCurrentUserOrThrow retrieves the currently logged-in user or throws an error
// getCurrentUser retrieves the currently logged-in user or returns null
// userByExternalId retrieves a user given the Clerk ID, and is used only for retrieving the current user or when updating an existing user via the webhook

export async function isAdminOrThrow(ctx: QueryCtx, randomId: string) {
	const email = await getUser(ctx, { randomId });

	if (email?.email !== getAdminConfig()) {
		throw new ConvexError("Not authorized");
	}
}

export async function isDataSender(
	ctx: MutationCtx,
	args: { randomId: string },
) {
	const user = await ctx.db
		.query("users")
		.withIndex("by_randomId", (q) => q.eq("randomId", args.randomId))
		.unique();

	if (!user) {
		return false;
	}

	if (user.dataSender) {
		await ctx.db.patch(user._id, {
			updatedAt: Date.now(),
			lastDataSentAt: Date.now(),
		});

		return true;
	}

	return false;
}

export const isDataSendingAvailable = query({
	args: {
		randomId: v.string(),
	},

	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_randomId", (q) => q.eq("randomId", args.randomId))
			.unique();

		if (user?.dataSender) {
			return true;
		}

		// get all users with dataSender set to true
		const users = await ctx.db
			.query("users")
			.filter((q) => q.eq(q.field("dataSender"), true))
			.collect();

		if (users.length === 0) {
			return true;
		}

		return false;
	},
});

export const updateDataSender = internalMutation({
	handler: async (ctx) => {
		const now = Date.now();

		// ----------------------------------------
		// 1. Check current data sender
		// ----------------------------------------
		const currentSender = await ctx.db
			.query("users")
			.withIndex("by_dataSender", (q) => q.eq("dataSender", true))
			.first();

		if (currentSender) {
			const lastSent = currentSender.lastDataSentAt ?? 0;

			if (now - lastSent < STALE_MS) {
				return;
			}
			await ctx.db.patch(currentSender._id, {
				dataSender: false,
				updatedAt: now,
			});
		}

		// ----------------------------------------
		// 2. Elect new sender using latency activity
		// ----------------------------------------
		// Find most recently active user (by latency samples)
		const latestSample = await ctx.db
			.query("userLatency")
			.order("desc")
			.first();

		if (!latestSample) {
			// No active users
			return;
		}

		// Fetch corresponding user
		const nextSender = await ctx.db
			.query("users")
			.withIndex("by_randomId", (q) => q.eq("randomId", latestSample.randomId))
			.unique();

		if (!nextSender || !nextSender.authorized) {
			return;
		}

		await ctx.db.patch(nextSender._id, {
			dataSender: true,
			updatedAt: now,
		});
	},
});

export const getUserByEmail = query({
	args: {
		email: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", args.email))
			.unique();

		if (!user) {
			return null;
		}
		return user._id;
	},
});

export async function getUser(ctx: QueryCtx, args: { randomId: string }) {
	const user = await ctx.db
		.query("users")
		.withIndex("by_randomId", (q) => q.eq("randomId", args.randomId))
		.unique();

	if (!user) {
		return null;
	}
	return user;
}

export const getUserByRand = query({
	args: {
		randomId: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_randomId", (q) => q.eq("randomId", args.randomId))
			.unique();

		if (!user) {
			return null;
		}
		return {
			email: user.email,
			picture: user.image || null,
			authorized: user.authorized,
		};
	},
});

export async function isAuthorized(
	ctx: QueryCtx,
	args: { randomId: string; email: string },
) {
	const user = await ctx.db
		.query("users")
		.withIndex("by_email", (q) => q.eq("email", args.email))
		.unique();

	if (!user) {
		return false;
	}

	// match randomId
	if (user.randomId !== args.randomId) {
		return false;
	}

	return true;
}

export const updateProfilePicture = internalMutation({
	args: {
		imageUrl: v.string(),
		email: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", args.email))
			.unique();

		if (!user) {
			return;
		}

		await ctx.db.patch(user._id, { image: args.imageUrl });
	},
});

export async function updateLastActive(
	ctx: MutationCtx,
	args: { randomId: string },
) {
	const user = await ctx.db
		.query("users")
		.withIndex("by_randomId", (q) => q.eq("randomId", args.randomId))
		.unique();

	if (!user) {
		return;
	}

	await ctx.db.patch(user._id, { lastActive: Date.now() });
}

export const isUserAuthorized = query({
	args: {
		randomId: v.string(),
		email: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_randomId", (q) => q.eq("randomId", args.randomId))
			.unique();

		if (!user) {
			//we need to make user with this randomId because it also functions as login

			return { success: false, message: "User not found", data: null };
		}

		if (user.email !== args.email) {
			return { success: false, message: "Email does not match", data: null };
		}

		return { success: true, message: "User is authorized", data: user };
	},
});
