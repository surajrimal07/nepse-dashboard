import { Resend, vEmailEvent, vEmailId } from "@convex-dev/resend";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import {
	internalMutation,
	type MutationCtx,
	mutation,
} from "./_generated/server";

export const resend: Resend = new Resend(components.resend, {
	onEmailEvent: internal.email.handleEmailEvent,
	testMode: false,
});

export const handleEmailEvent = internalMutation({
	args: {
		id: vEmailId,
		event: vEmailEvent,
	},
	handler: async (_ctx, args) => {
		console.log("Got called back!", args.id, args.event);
		// Probably do something with the event if you care about deliverability!
	},
});

export const saveOTP = internalMutation({
	args: { to: v.string(), randomId: v.string(), otp: v.number() },
	handler: async (ctx, args) => {
		if (!args.to) {
			throw new Error("Email 'to' address is required");
		}

		await ctx.db.insert("emailOtps", {
			email: args.to,
			otp: args.otp,
			randomId: args.randomId,
			createdAt: Date.now(),
		});
	},
});

export const cleanupOldOtps = internalMutation({
	args: { to: v.string() },
	handler: async (ctx, args) => {
		// find all otps for this email
		const emails = await ctx.db
			.query("emailOtps")
			.withIndex("by_email", (q) => q.eq("email", args.to))
			.collect();

		// delete them
		for (const email of emails) {
			await ctx.db.delete(email._id);
		}
	},
});

async function processOtpVerification(ctx: MutationCtx, otp: number) {
	if (!otp) {
		return { success: false, error: "OTP is required" };
	}

	// Find the otp in the database
	const record = await ctx.db
		.query("emailOtps")
		.withIndex("by_otp", (q) => q.eq("otp", otp))
		.order("desc")
		.unique();

	if (!record) {
		return { success: false, error: "Invalid OTP" };
	}

	// Make sure it's not expired (valid for 10 minutes)
	const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
	if (record.createdAt < tenMinutesAgo) {
		return { success: false, error: "OTP has expired" };
	}

	// Fetch user by email and users with the same randomId in parallel
	const [user, existingUsersWithRandomId] = await Promise.all([
		ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", record.email))
			.unique(),
		ctx.db
			.query("users")
			.withIndex("by_randomId", (q) => q.eq("randomId", record.randomId))
			.collect(),
	]);

	if (existingUsersWithRandomId.length > 0) {
		// we need to delete the old user record(s) and create a new one
		for (const user of existingUsersWithRandomId) {
			await ctx.db.delete(user._id);
		}
	}

	if (user) {
		// If user exists then update its updatedAt field and randomId
		await ctx.db.patch(user._id, {
			randomId: record.randomId,
			updatedAt: Date.now(),
			authorized: true,
		});
	} else {
		await ctx.db.insert("users", {
			email: record.email,
			randomId: record.randomId,
			authorized: true,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			lastActive: Date.now(),
			dataSender: false,
		});

		await ctx.scheduler.runAfter(0, internal.image.getProfile, {
			email: record.email,
		});
	}

	// Delete the otp record
	await ctx.db.delete(record._id);

	return { success: true, email: record.email, randomId: record.randomId };
}

export const verifyOTP = mutation({
	args: { otp: v.number() },
	handler: async (ctx, args) => {
		const result = await processOtpVerification(ctx, args.otp);
		if (result.success) {
			return { success: true, email: result.email, randomId: result.randomId };
		}
		return result;
	},
});

export const handleMagicLink = mutation({
	args: { otp: v.number(), key: v.string() },
	handler: async (ctx, args) => {
		if (args.key !== process.env.CONVEX_MUTATE_KEY) {
			return { success: false, error: "Invalid key" };
		}
		const result = await processOtpVerification(ctx, args.otp);
		if (result.success) {
			return { success: true, email: result.email };
		}
		return result;
	},
});
