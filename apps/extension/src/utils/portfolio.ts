export function formatCurrency(value: number): string {
	return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}