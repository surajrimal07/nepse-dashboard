// import { convexAdapter } from "@convex-dev/better-auth";
// import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
// import { betterAuth } from "better-auth";
// import { emailOTP } from "better-auth/plugins";
// import type { GenericCtx } from "./_generated/server";
// import { betterAuthComponent } from "./auth";

// const siteUrl = process.env.CONVEX_SITE_URL;
// const secret = process.env.BETTER_AUTH_SECRET;

// if (!siteUrl || !secret) {
// 	throw new Error(
// 		"SITE_URL or BETTER_AUTH_SECRET environment variable is not set",
// 	);
// }

// export const createAuth = (ctx: GenericCtx) =>
// 	betterAuth({
// 		baseURL: siteUrl,
// 		secret: secret,
// 		database: convexAdapter(ctx, betterAuthComponent),
// 		trustedOrigins: [
// 			siteUrl,
// 			"http://localhost:3000",
// 			"http://localhost:3001",
// 			"https://site.nepsechatbot.com",
// 			"https://cloud.nepsechatbot.com",
// 			"chrome-extension://efglamoipanaajcmhfeblhdbhciggojd",
// 			"chrome-extension://ohjdolhmohkgbpbpkklhhebdhindldjj",
// 		],
// 		emailAndPassword: {
// 			enabled: true,
// 			autoSignIn: true,
// 			requireEmailVerification: false,
// 			minPasswordLength: 8,
// 			maxPasswordLength: 128,
// 			sendResetPassword: async ({ user, url, token }) => {
// 				// Send reset password email
// 			},
// 			resetPasswordTokenExpiresIn: 3600, // 1 hour
// 		},
// 		account: {
// 			accountLinking: {
// 				enabled: true,
// 				allowDifferentEmails: false,
// 				trustedProviders: ["google", "github", "email-password"],
// 			},
// 		},
// 		emailVerification: {
// 			sendVerificationEmail: async ({ user, url, token }) => {
// 				// Send verification email to user
// 			},
// 			sendOnSignUp: true,
// 			autoSignInAfterVerification: true,
// 			expiresIn: 3600, // 1 hour
// 		},
// 		socialProviders: {
// 			google: {
// 				prompt: "select_account",
// 				accessType: "offline",
// 				clientId: process.env.GOOGLE_CLIENT_ID as string,
// 				clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
// 			},
// 			github: {
// 				clientId: process.env.GITHUB_CLIENT_ID as string,
// 				clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
// 			},
// 		},
// 		user: {
// 			deleteUser: {
// 				enabled: true,
// 			},
// 		},
// 		plugins: [
// 			crossDomain({
// 				siteUrl,
// 			}),
// 			convex(),
// 			emailOTP({
// 				sendVerificationOTP: async ({ email, otp, type }) => {
// 					// Send OTP to user's email
// 				},
// 			}),
// 		],
// 		session: {
// 			expiresIn: 7776000, // 90 days
// 			updateAge: 86400, // 1 day
// 			cookieCache: {
// 				enabled: true,
// 				maxAge: 60 * 60, // 1 hour
// 			},
// 		},

// 		rateLimit: {
// 			enabled: true,
// 			window: 10,
// 			max: 100,
// 			storage: "memory",
// 			modelName: "rateLimit",
// 		},

// 		advanced: {
// 			...(process.env.CONVEX_ENV && {
// 				useSecureCookies: process.env.CONVEX_ENV === "development",
// 			}),
// 		},
// 	});
