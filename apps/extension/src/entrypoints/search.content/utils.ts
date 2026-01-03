import { BarChart3, LineChart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { modeType } from "@/types/search-type";

export function formatValue(value?: number): string {
	return value != null && !Number.isNaN(value) ? value.toFixed(2) : "--";
}

export function formatWithSign(value?: number): string {
	if (value == null || Number.isNaN(value)) return "--";
	const prefix = value > 0 ? "+" : "";
	return `${prefix}${value.toFixed(2)}`;
}

export function isValidUrl(url: string): boolean {
	return url.startsWith("http://") || url.startsWith("https://");
}

// export const modeTypes = ["chart", "tms", "ai"] as const;

export type AiMode = boolean;

export const options = [
	{ value: "chart", label: "Chart", icon: LineChart },
	{ value: "tms", label: "TMS", icon: BarChart3 },
	{ value: "ai", label: "AI", icon: Sparkles },
];

// Static error messages and placeholders
export const ERROR_INVALID_URL =
	"Please enter a valid URL starting with http:// or https://";
export const ERROR_LOAD_CHART = "Unable to load chart.";
export const ERROR_SYMBOL_INVALID = "Symbol is not valid.";
export const ERROR_SAVE_PREFS = "Failed to save preferences. Please try again.";
export const PLACEHOLDER_SEARCH = "Search stocks or symbols (e.g. NABIL)";
export const PLACEHOLDER_TMS = "Which stock depth to view in TMS?";
export const PLACEHOLDER_AI_QUERY = "Ask anything about this page...";
export const PLACEHOLDER_CUSTOM_URL = "https://example.com/chart?symbol=";
export const NO_RESULTS_TEXT = "No results. Try a different query.";
export const UNABLE_TO_LOAD_SYMBOLS = "Unable to load symbols.";
export const CUSTOM_URL_HELP_TEXT =
	"Enter the base URL. Symbol will be appended automatically.";

// Stable style objects
export const virtualizerContainerStyle = {
	width: "100%",
	position: "relative",
};
export const virtualItemBaseStyle = {
	position: "absolute",
	top: 0,
	left: 0,
	width: "100%",
};

export function getButtonClass() {
	return cn(
		"w-full rounded-lg border p-2 px-1 py-1 text-left shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
		"border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800",
	);
}

export function getSymbolClass() {
	return cn("text-sm font-semibold", "text-slate-100");
}

export function getNameClass() {
	return cn("text-xs truncate mt-0.5", "text-slate-400");
}

export function getPriceClass() {
	return cn("text-sm font-semibold", "text-slate-100");
}

export function getChangeClass(pos: boolean) {
	return pos ? "text-emerald-500" : "text-rose-500";
}

export function getModeClass() {
	return "mt-1.5 text-[10px] uppercase tracking-wide font-medium text-slate-500";
}

export function getModeText(mode: modeType) {
	return mode === "chart" ? "View chart" : "Trade stock";
}

export function getContainerClass(showCentered: boolean = false): string {
	const cls = [
		"h-80",
		"overflow-hidden",
		"scrollbar-hide",
		"overflow-y-auto",
		"pr-1",
	];

	if (showCentered) {
		cls.push(
			"flex",
			"items-center",
			"justify-center",
			"text-sm",
			"text-slate-400",
		);
	}

	return cn(cls);
}

export const errorClassName = "mt-2.5 text-xs text-rose-500 px-1";

export function getInputClass(): string {
	const base =
		"flex-1 rounded-lg py-2.5 px-4 text-sm border-1 focus:outline-none focus:shadow-sm transition-all";

	return cn(
		base,
		"bg-slate-800 placeholder-slate-300 border-slate-600 text-slate-100",
		"focus:border-slate-500 focus:bg-slate-800/80",
	);
}

export function getPlaceholderText(mode: modeType): string {
	switch (mode) {
		case "chart":
			return PLACEHOLDER_SEARCH;
		case "tms":
			return PLACEHOLDER_TMS;
		default:
			return PLACEHOLDER_AI_QUERY;
	}
}
