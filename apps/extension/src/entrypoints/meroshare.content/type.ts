import type { PortfolioStats } from "@/types/meroshare-type";

export type ProcessedStats = Omit<PortfolioStats, "updatedAt">;

export type WidgetIconType =
	| "overall"
	| "trending-up"
	| "trending-down"
	| "arrow-up"
	| "arrow-down"
	| "today-total"
	| "most-traded"
	| "calendar"
	| "activity"
	| "percent"
	| "target"
	| "shield"
	| "trophy"
	| "skull"
	| "star"
	| "heart"
	| "zap"
	| "coins"
	| "chart"
	| "clock"
	| "users";

export interface WidgetConfig {
	id: string;
	label: string;
	labelSub: string;
	value: string;
	valueSub: string;
	valueTotal: number;
	labelTotal: number;
	icon: WidgetIconType;
	colorOverride?: "profit" | "loss" | "neutral" | "info" | "warning";
}