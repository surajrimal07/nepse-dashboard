export function generateRequestId(): string {
	return crypto.randomUUID();
}

export function getFormattedTime(timestamp: string | number | Date): string {
	const date = new Date(timestamp);
	return date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
}

/**
 * Generates a unique random ID (12 characters).
 *
 * WARNING: This should only be called during user randomId initialization.
 * Do NOT call this directly for User.randomId - use initializeRandomId() instead
 * to ensure the ID persists across extension reloads.
 *
 * @returns A 12-character unique ID
 */
export function generateId() {
	return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export function calculatePricePosition(
	current: number,
	low?: number,
	high?: number,
) {
	const safeLow = low ?? 0;
	const safeHigh = high ?? 0;

	const range = safeHigh - safeLow;
	const position = ((current - safeLow) / range) * 100;
	return Math.min(Math.max(position, 0), 100);
}
