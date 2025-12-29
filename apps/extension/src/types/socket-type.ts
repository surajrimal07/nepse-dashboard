import z from "@nepse-dashboard/zod";

// export const SOCKET_ROOMS = {
// 	IS_OPEN: "isOpen",
// 	NEPSE_INDEX: "nepseIndex",
// 	INTRADAY_CHART: "intradayChart",
// 	OTHER_INDEXES: "otherIndexes",
// 	DASHBOARD: "dashboard",
// 	SENTIMENT: "sentiment",
// 	ALL_COMPANIES: "allCompanies",
// 	SUPPLY_DEMAND: "supplyDemand", //
// 	INTRADAY_STOCK_CHART: "intradayStockChart", //
// 	NOTIFICATION: "notification",
// 	MARKET_DEPTH: "marketDepth",
// 	DAILY_STOCK_CHART: "dailyStockChart",
// 	DAILY_INDEX_CHART: "dailyIndexChart",
// 	SCREENSHOT: "screenshot",
// 	STOCK_INFO: "stockInfo",
// 	ERROR: "error",
// 	INFO: "info",
// 	VERSION: "version", // new
// 	SERVER_URL: "serverUrl", // new
// 	SEND_SUBSCRIPTION_CONFIG: "sendSubscriptionConfig", // INITIAL CONFIG
// 	SUBSCRIPTION_TIMEOUT: "subscriptionTimeout",
// 	REQUESTDATA_SUBSCRIPTION: "requestDataSubscription", // AFTER SUBSCRIPTION
// 	SUBSCRIPTION_UPDATE_SUCCESS: "subscriptionUpdateSuccess", //
// 	SUBSCRIPTION_UPDATE: "subscriptionUpdate", // AFTER SUBSCRIPTION
// 	NOT_SUBSCRIBED: "notSubscribed",
// 	MISSING_PARAMS: "missingParams",
// 	VALIDATION_ERROR: "validationError",

// 	CONSUME: "consume",
// 	ODD_LOT: "oddLot",

// 	PONG: "pong",
// 	USER_NOT_FOUND: "userNotFound",
// 	USER_NOT_AUTHENTICATED: "userNotAuthenticated",
// 	JWT_VERIFICATION_ERROR: "jwtVerificationError",
// 	JWT_EXPIRED: "jwtExpired",
// 	RATE_LIMIT_ERROR: "rateLimitError",

// 	NEWS_SUMMARY: "newsSummary",
// } as const;

// export const CUSTOM_EVENTS = {
// 	...SOCKET_ROOMS,
// 	CONNECTION_STATUS_RESPONSE: "connectionStatusResponse",
// 	CONNECTION_STATUS_REQUEST: "connectionStatusRequest",
// 	COUNT: "count",
// 	ANALYTICS: "googleAnalytics",
// 	REQUEST: "request",
// 	UPDATE_SUBSCRIPTION: "updateSubscription",
// 	RECONNECT_SOCKET: "reconnectSocket",
// 	LOGIN: "login",
// 	CLOSE_LOGIN_TAB: "closeLoginTab",
// 	UPDATE_AVAILABLE: "updateAvailable",
// } as const;

// export type SocketRooms = (typeof CUSTOM_EVENTS)[keyof typeof CUSTOM_EVENTS];

// export const SOCKET_ROOMS_ENUM = z.enum(Object.values(CUSTOM_EVENTS));

export const PingResponseSchema = z.object({
	clientTime: z.number(),
	serverTime: z.number(),
});
export type PingResponse = z.infer<typeof PingResponseSchema>;

export const ScreenshotResponseSchema = z.object({
	image: z.string().nullable(),
	url: z.string().nullable(),
	error: z.string().nullable(),
});
export type Screenshot = z.infer<typeof ScreenshotResponseSchema>;

export const VersionSchema = z
	.object({
		version: z.string(),
		updateAvailable: z.boolean().optional().default(false),
		changelogs: z.string().optional().nullable(),
	})
	.transform((data) => {
		const currentVersion = getVersion();
		return {
			...data,
			updateAvailable: data.version !== currentVersion,
		};
	});

export type Version = z.infer<typeof VersionSchema>;

export const ServerUrlSchema = z.object({
	ws_url: z.url(),
	edge_url: z.url(),
	chart_url: z.url(),
	login_url: z.url(),
	login_anonymous_url: z.url(),
	chat_url: z.url(),
	analytics_url: z.url(),
	review_url: z.url(),
	privacy_url: z.url(),
	terms_url: z.url(),
	changelog_url: z.url(),
	telegram_url: z.url(),
	welcome_url: z.url(),
	uninstall_url: z.url(),
	github_url: z.url(),
});

export type ServerUrl = z.infer<typeof ServerUrlSchema>;

// export const LoginTokensSchema = z.object({
//   access_token: z.string(),
//   refresh_token: z.string(),
// });

// export type LoginTokens = z.infer<typeof LoginTokensSchema>;

// export const ValidationErrorSchema = z.object({
//   error: z.object({
//     error: z.string().optional(),
//   }),
// });

// export type ValidationError = z.infer<typeof ValidationErrorSchema>;

// export const ErrorMessage = z.object({
//   error: z.object({
//     error: z.string(),
//     originalError: z.string().optional().nullable(),
//   }),
// });

// export type ErrorMessage = z.infer<typeof ErrorMessage>;
