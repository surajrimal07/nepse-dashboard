import { HOUR, RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

const rateLimits: Record<
	"newsSummary" | "newsSummaryGlobal",
	{ kind: "fixed window" | "token bucket"; rate: number; period: number }
> = {
	newsSummary: {
		kind: "fixed window",
		rate: 100, // Per user limit: 10 summaries per day
		period: HOUR * 24,
	},
	newsSummaryGlobal: {
		kind: "fixed window",
		rate: 100, // Global limit: 200 summaries per day across all users
		period: HOUR * 24,
	},
};

export const rateLimiter = new RateLimiter(components.rateLimiter, rateLimits);
