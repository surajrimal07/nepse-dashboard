// Badge state types and colors
const BADGE_COLORS = {
	OFF: "#6366f1", // Purple for OFF state
	POSITIVE: "#22c55e", // Green for positive numbers
	NEGATIVE: "#E91E63", // Red for negative numbers
	EVENT: "#6366f1", // Purple for events/notifications
};

export async function updateBadge(
	value: number | string | null | "OFF",
): Promise<void> {
	if (value === null) return;

	let text: string;
	let color: string;

	if (typeof value === "number") {
		text = value.toString();
		color = value >= 0 ? BADGE_COLORS.POSITIVE : BADGE_COLORS.NEGATIVE;
	} else {
		text = value;
		color = BADGE_COLORS.EVENT;
	}

	await Promise.all([
		browser.action.setBadgeText({ text }),
		browser.action.setBadgeBackgroundColor({ color }),
		browser.action.setBadgeTextColor
			? browser.action.setBadgeTextColor({ color: "#fff" })
			: Promise.resolve(),
	]);
}
