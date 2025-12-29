"use node";
import EmailLogin from "@nepse-dashboard/emails/emails/email-login";
import { pretty, render } from "@react-email/components";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { action } from "./_generated/server";
import { resend } from "./email";

const baseUrl = process.env.FRONTEND_URL;

if (!baseUrl) {
	throw new Error("FRONTEND_URL environment variable is not set");
}

export const sendEmailVerification = action({
	args: { to: v.string(), randomId: v.string() },
	handler: async (ctx, args) => {
		// See if this is a new user
		const user = await ctx.runQuery(api.users.getUserByEmail, {
			email: args.to,
		});
		const newUser = !user;

		const OTP = Math.floor(100000 + Math.random() * 900000);

		const email = await resend.sendEmail(ctx, {
			from: "NepseDashboard <hello@nepsechatbot.com>",
			to: args.to,
			subject: "Login to Nepse Dashboard",
			html: await pretty(
				await render(<EmailLogin link={baseUrl} otp={OTP} newUser={newUser} />),
			),
		});

		let status = await resend.status(ctx, email);
		while (
			status &&
			(status.status === "queued" || status.status === "waiting")
		) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			status = await resend.status(ctx, email);
		}

		if (status?.status === "sent") {
			// cleanup old OTPs for this email
			await ctx.runMutation(internal.email.cleanupOldOtps, { to: args.to });

			await ctx.runMutation(internal.email.saveOTP, {
				to: args.to,
				randomId: args.randomId,
				otp: OTP,
			});
			return {
				success: true,
				message: "A verification email has been sent. Please check your inbox.",
			};
		}

		return {
			success: false,
			message: "Failed to send email, please try again later.",
		};
	},
});
