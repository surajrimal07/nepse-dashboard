import "./instrument";

import { prometheus } from "@hono/prometheus";
import { logger } from "@nepse-dashboard/logger";
import { captureException } from "@sentry/bun";
import env, { isDevelopment } from "env.js";
import { type Context, Hono, type MiddlewareHandler, type Next } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger as honoLogger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { timeout } from "hono/timeout";
import { timing } from "hono/timing";
import { Registry } from "prom-client";
import { cronJob, notificationCronJob } from "./controllers/cron.js";
import "./controllers/event-listners/index.js";
import { sendNotification } from "./controllers/notification/index.js";
import { apiv1Route } from "./controllers/route.js";
import {
	NotificationPriority,
	NotificationVariant,
} from "./types/notification.js";
import { OP } from "./utils/analytics.js";
import { isAllowedOrigin } from "./utils/orgin.js";
import { telegramBot } from "./utils/telegram/telegram.js";

export const app = new Hono();

const customTimeoutException = (context: Context) =>
	new HTTPException(408, {
		message: `Request timeout after waiting ${context.req.header(
			"Duration",
		)} seconds. Please try again later.`,
	});
const registry = new Registry();

const { printMetrics, registerMetrics } = prometheus({
	registry,
});

// Middleware to check API key in production
const apiKeyAuth = (c: Context, next: Next) => {
	if (isDevelopment) {
		return next();
	}

	const apiKey = c.req.header("Authorization");

	if (!apiKey || apiKey !== env.API_KEY) {
		return c.json({ error: "Invalid API key" }, 401);
	}

	return next();
};

app.get("/", (c) => {
	return c.text("ok");
});

app.get("/health", (c) => {
	return c.json(
		{
			status: "healthy",
			timestamp: new Date().toISOString(),
		},
		200,
	);
});

app.use(
	"*",
	cors({
		origin: (origin) => {
			if (isAllowedOrigin(origin)) {
				return origin;
			}
			return null;
		},
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		exposeHeaders: ["Content-Length"],
		maxAge: 3600,
		credentials: true,
	}),
	honoLogger(),
	secureHeaders({
		xFrameOptions: false,
		xXssProtection: false,
	}),
	timeout(10_000, customTimeoutException),
	timing(),
	bodyLimit({
		maxSize: 50 * 1024, // 50kb
		onError: (c) => {
			return c.text("overflow :(", 413);
		},
	}),

	apiKeyAuth as MiddlewareHandler,
	registerMetrics,
);

app.get("/test", (c) => {
	return c.json({ message: "Test endpoint" });
});

app.get("/metrics", printMetrics);

app.route("/api/v1", apiv1Route);

app.onError((error, c) => {
	captureException(error);
	if (error instanceof HTTPException) {
		return error.getResponse();
	}
	return c.json({ error: "Internal server error" }, 500);
});

logger.info(
	`Starting server in ${
		isDevelopment ? "development" : "production"
	} mode on port ${3000}`,
);

// Initialize cron jobs - they start automatically when imported
logger.info(
	`Initializing cron jobs, ${cronJob.name}, ${notificationCronJob.name}`,
);

// Initialize event listeners (including rooms listener for real-time watchlist updates)
logger.info("Event listeners initialized");

// Initialize Telegram bot
telegramBot.initialize();

sendNotification(
	"System Online",
	"API server has started successfully",
	NotificationVariant.INFO,
	NotificationPriority.LOW,
);

OP.track("server_started", {
	environment: isDevelopment ? "development" : "production",
});

export default {
	port: 3000,
	fetch: app.fetch,
};
