/** biome-ignore-all lint/suspicious/noConsole: <iknow> */
import z from "@nepse-dashboard/zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production"]).default("development"),

	// convex
	CONVEX_CLOUD_PROD: z.url("CONVEX_CLOUD_PROD must be a valid URL"),
	CONVEX_CLOUD_DEV: z.url("CONVEX_CLOUD_DEV must be a valid URL"),

	CONVEX_SITE_PROD: z.url("CONVEX_SITE_PROD must be a valid URL"),
	CONVEX_SITE_DEV: z.url("CONVEX_SITE_DEV must be a valid URL"),

	// Server configuration
	PORT: z.coerce.number().default(3000).pipe(z.number().min(1).max(65_535)),

	// OpenPanel Analytics
	OPENPANEL_URL: z.url("OPENPANEL_URL must be a valid URL"),
	OPENPANEL_ID: z.string().min(1, "OPENPANEL_ID is required"),
	OPENPANEL_SECRET: z.string().min(1, "OPENPANEL_SECRET is required"),
	OPENPANEL_ID_DEV: z.string().min(1, "OPENPANEL_ID_DEV is required"),
	OPENPANEL_SECRET_DEV: z.string().min(1, "OPENPANEL_SECRET_DEV is required"),

	FIREBASE_SERVICE_ACCOUNT_KEY: z
		.string()
		.min(1, "FIREBASE_SERVICE_ACCOUNT_KEY is required"),

	// Database/Redis
	REDIS_URL: z.url("REDIS_URL must be a valid URL").optional(),
	REDIS_HOST: z.string().optional(),
	REDIS_PORT: z.coerce.number().pipe(z.number().min(1).max(65_535)).optional(),
	REDIS_PASSWORD: z.string().optional(),

	// External APIs
	TELEGRAM_BOT_TOKEN: z.string().optional(),
	TELEGRAM_CHAT_ID: z.string().optional(),
	TELEGRAM_CHANNEL_ID: z.string().optional(),
	TELEGRAM_ENABLED: z
		.string()
		.optional()
		.transform((val) => val === "true"),

	// Security
	JWT_SECRET: z
		.string()
		.min(32, "JWT_SECRET must be at least 32 characters")
		.optional(),
	API_KEY: z.string().min(1, "API_KEY is required"),

	// Cloudflare R2 Storage
	CLOUDFLARE_ACCESSS_KEY: z.string().optional(),
	CLOUDFLARE_ACCESSS_SECRET: z.string().optional(),
	CLOUDFLARE_BUCKET_NAME: z.string().optional(),
	CLOUDFLARE_HOST: z.url("CLOUDFLARE_HOST must be a valid URL").optional(),

	CLOUDFLARE_LOGO_REGION: z
		.string()
		.min(1, "CLOUDFLARE_LOGO_REGION is required"),

	CLOUDFLARE_LOGO_BUCKET_NAME: z
		.string()
		.min(1, "CLOUDFLARE_LOGO_BUCKET_NAME is required"),

	// Supabase
	SUPABASE_URL: z.url("SUPABASE_URL must be a valid URL"),
	SUPABASE_KEY: z.string().min(1, "SUPABASE_KEY is required"),
	SUPABASE_SERVICE_KEY: z.string().min(1, "SUPABASE_SERVICE_KEY is required"),
	SUPABASE_JWT_SECRET: z.string().min(1, "SUPABASE_JWT_SECRET is required"),

	// Monitoring
	SENTRY_DSN: z.string().url("SENTRY_DSN must be a valid URL").optional(),
	SENTRY_ENVIRONMENT: z.string().optional(),

	// Rate Limiting
	RATE_LIMIT_WINDOW_MS: z.coerce
		.number()
		.default(60_000)
		.pipe(z.number().min(1000)),
	RATE_LIMIT_MAX_REQUESTS: z.coerce
		.number()
		.default(100)
		.pipe(z.number().min(1)),

	// WebSocket
	WS_PORT: z.coerce.number().pipe(z.number().min(1).max(65_535)).optional(),
});

export type env = z.infer<typeof envSchema>;

const { data: env, error } = envSchema.safeParse(process.env);

if (error) {
	console.error("❌ Invalid environment variables:");
	console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
	process.exit(1);
}

export default env as env;

export const isDevelopment = env.NODE_ENV === "development";
export const isProduction = env.NODE_ENV === "production";
