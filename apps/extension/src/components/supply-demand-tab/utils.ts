export function parseDateTime(date: string, time: string): Date | null {
	if (!date || !time) return null;

	// normalize: "02:45 p.m." → "02:45 PM"
	const normalizedTime = time.replace(".", "").replace(".", "").toUpperCase();

	// "2025-12-23 02:45 PM"
	const combined = `${date} ${normalizedTime}`;

	const parsed = new Date(combined);

	return Number.isNaN(parsed.getTime()) ? null : parsed;
}
