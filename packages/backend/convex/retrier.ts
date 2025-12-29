import { ActionRetrier } from "@convex-dev/action-retrier";
import { components } from "./_generated/api";

export const retrier = new ActionRetrier(components.actionRetrier, {
	initialBackoffMs: 2000, // Start with 2 seconds
	base: 3, // Exponential backoff multiplier
	maxFailures: 5, // Retry up to 5 times
});
