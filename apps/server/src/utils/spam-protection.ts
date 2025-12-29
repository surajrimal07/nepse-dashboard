import { logger } from "@nepse-dashboard/logger";
import { isDevelopment } from "env";
import { redis } from "@/redis-client";

/**
 * Checks if a key is currently blocked by spam protection
 * @param key - The Redis key to check
 * @returns Promise<boolean> - true if blocked, false if allowed
 */
export const isSpamBlocked = async (key: string): Promise<boolean> => {
	const isBlocked = await redis.get(key);
	return !!isBlocked;
};

/**
 * Sets spam protection for a key with specified duration
 * @param key - The Redis key to set protection for
 * @param identifier - Identifier for logging (e.g., symbol name, index name)
 * @param durationSeconds - Duration in seconds (default: 600 = 10 minutes)
 * @returns Promise<void>
 */
export const setSpamProtection = async (
	key: string,
	identifier: string,
	durationSeconds = 600,
): Promise<void> => {
	await redis.setEx(key, durationSeconds, "blocked");
	logger.info(`Spam protection set for ${identifier} (${durationSeconds}s)`);
};

/**
 * Checks spam protection and sets it if not blocked
 * @param key - The Redis key for spam protection
 * @param identifier - Identifier for logging (e.g., symbol name, index name)
 * @param durationSeconds - Duration in seconds (default: 600 = 10 minutes)
 * @returns Promise<boolean> - true if allowed to proceed, false if blocked
 */
export const checkAndSetSpamProtection = async (
	key: string,
	identifier: string,
	durationSeconds = 600,
): Promise<boolean> => {
	if (isDevelopment) {
		return true;
	}

	const blocked = await isSpamBlocked(key);

	if (blocked) {
		logger.info(
			`${identifier} is blocked for spam protection. Skipping processing.`,
		);
		return false;
	}

	await setSpamProtection(key, identifier, durationSeconds);
	return true;
};
