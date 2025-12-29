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

export const getButtonClass = (isDark: boolean) =>
	cn(
		"w-full rounded-lg border p-2 px-1 py-1 text-left shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
		isDark
			? "border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800"
			: "border-slate-200 bg-white hover:border-slate-300",
	);

export const getSymbolClass = (isDark: boolean) =>
	cn("text-sm font-semibold", isDark ? "text-slate-100" : "text-slate-900");

export const getNameClass = (isDark: boolean) =>
	cn("text-xs truncate mt-0.5", isDark ? "text-slate-400" : "text-slate-500");

export const getPriceClass = (isDark: boolean) =>
	cn("text-sm font-semibold", isDark ? "text-slate-100" : "text-slate-900");

export const getChangeClass = (pos: boolean) =>
	pos ? "text-emerald-500" : "text-rose-500";

export const getModeClass = (isDark: boolean) =>
	`mt-1.5 text-[10px] uppercase tracking-wide font-medium ${
		isDark ? "text-slate-500" : "text-slate-400"
	}`;

export const getModeText = (mode: modeType) =>
	mode === "chart" ? "View chart" : "Trade stock";

export const getContainerClass = (isDark: boolean) => {
	const cls = [
		"h-80",
		"overflow-hidden",
		"scrollbar-hide",
		"overflow-y-auto",
		"pr-1",
		"space-y-2",
	];

	if (!loading) {
		cls.push(
			"flex",
			"items-center",
			"justify-center",
			"text-sm",
			isDark ? "text-slate-400" : "text-slate-500",
		);
	}

	return cn(cls);
};

export const errorClassName = "mt-2.5 text-xs text-rose-500 px-1";

export const getInputClass = (isDark: boolean): string => {
	const base =
		"flex-1 rounded-lg py-2.5 px-4 text-sm border-1 focus:outline-none focus:shadow-sm transition-all";

	if (isDark) {
		return cn(
			base,
			"bg-slate-800 placeholder-slate-300 border-slate-600 text-slate-100",
			"focus:border-slate-500 focus:bg-slate-800/80",
		);
	}

	return cn(
		base,
		"bg-slate-50 placeholder-slate-600 border-slate-300",
		"focus:border-slate-400 focus:bg-white",
	);
};

export const getPlaceholderText = (mode: modeType): string => {
	switch (mode) {
		case "chart":
			return PLACEHOLDER_SEARCH;
		case "tms":
			return PLACEHOLDER_TMS;
		default:
			return PLACEHOLDER_AI_QUERY;
	}
};
