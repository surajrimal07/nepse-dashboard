export function formatCount(value?: number) {
	if (!value || value < 1000) return value ?? 0;

	if (value < 1_000_000) {
		return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
	}

	if (value < 1_000_000_000) {
		return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
	}

	return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
}
