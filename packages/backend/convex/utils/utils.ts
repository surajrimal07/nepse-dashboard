import { ConvexError } from "convex/values";

export function getNepaliTime() {
	return new Date().toLocaleTimeString("en-CA", {
		//10:12 p.m.
		timeZone: "Asia/Kathmandu",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function getNepaliDate() {
	return new Date().toLocaleDateString("en-CA", {
		//2025-07-25
		timeZone: "Asia/Kathmandu",
	});
}

export function getCleanUPDate() {
	const now = new Date();

	// Subtract given days (default 0 → today)
	now.setDate(now.getDate() - 3);

	return now.toLocaleDateString("en-CA", {
		timeZone: "Asia/Kathmandu", // ensures Nepali time zone
	});
}

export function getDateFromAsOf(asOf: string) {
	return asOf.split("T")[0];
}

export function isValidStock(
	stock: string | null | undefined,
): stock is string {
	return typeof stock === "string" && stock.trim().length > 0;
}

export function getAdminConfig() {
	const adminEmail = process.env.ADMIN_EMAIL;
	if (!adminEmail) {
		throw new ConvexError("ADMIN_EMAIL environment variable is not set.");
	}

	return adminEmail;
}

export function checkDevOnly(devOnly?: boolean) {
	if (devOnly && process.env.environment !== "development") {
		throw new ConvexError({
			code: "FORBIDDEN",
			message: "This function is only available in development",
		});
	}
}

export const STATUS_RANK: Record<"Open" | "Nearing" | "Closed", number> = {
	Open: 1,
	Nearing: 2,
	Closed: 3,
};
