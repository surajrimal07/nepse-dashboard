export function truncate(str: string) {
	return str.length > 20 ? `${str.substring(0, 20)}...` : str;
}

export function toDate(timestamp: string | number | null | undefined) {
	const safeTimestamp = timestamp || Date.now();
	return new Date(safeTimestamp).toLocaleTimeString();
}

export function formatDate(dateString: string) {
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}
