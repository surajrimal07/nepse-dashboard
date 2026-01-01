import { formatCurrency } from "@/utils/portfolio";
import type { AdvancedUserInsights } from "../calculation";
import type { ProcessedStats, WidgetConfig } from "../type";
import WidgetCard from "./widget-card";

interface AdvancedWidgetsGridProps {
	insights: AdvancedUserInsights;
	stats: ProcessedStats;
}

export default function AdvancedWidgetsGrid({
	insights,
	stats,
}: AdvancedWidgetsGridProps) {
	const { portfolio, health, trading, winRate, bestPerformer, worstPerformer, personality, summary } = insights;
	const { widgetData } = stats;

	// Helper to format percentages nicely
	const formatPct = (val: number) => `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`;

	// Build widgets array, conditionally including best/worst performers
	const widgets: WidgetConfig[] = [
		// === Core Financial Metrics (ACCURATE) ===
		{
			id: "unrealized-pl",
			label: "Unrealized P&L",
			labelSub: formatPct(portfolio.totalUnrealizedPLPercent),
			value: `Rs.${formatCurrency(portfolio.totalUnrealizedPL)}`,
			valueSub: "current",
			valueTotal: portfolio.totalUnrealizedPL,
			labelTotal: portfolio.totalUnrealizedPL,
			icon: "overall",
		},
		{
			id: "today-pl",
			label: "Today's P&L",
			labelSub: formatPct(portfolio.dayChangePercent),
			value: `Rs.${formatCurrency(portfolio.dayChange)}`,
			valueSub: "daily",
			valueTotal: portfolio.dayChange,
			labelTotal: portfolio.dayChange,
			icon: "today-total",
		},
		{
			id: "portfolio-value",
			label: "Portfolio Value",
			labelSub: `Cost: Rs.${formatCurrency(portfolio.totalInvestment)}`,
			value: `Rs.${formatCurrency(portfolio.totalValue)}`,
			valueSub: "market",
			valueTotal: 1,
			labelTotal: 0,
			icon: "coins",
			colorOverride: "info",
		},

		// === Performance Winners/Losers (ACCURATE - Current Holdings) ===
		{
			id: "top-gainer-today",
			label: "Top Gainer Today",
			labelSub: widgetData.today.gain.ticker,
			value: `Rs.${formatCurrency(widgetData.today.gain.amount)}`,
			valueSub: `${widgetData.today.gain.percentage.toFixed(2)}%`,
			valueTotal: widgetData.today.gain.amount,
			labelTotal: 0,
			icon: "trending-up",
		},
		{
			id: "top-loser-today",
			label: "Top Loser Today",
			labelSub: widgetData.today.loss.ticker,
			value: `Rs.${formatCurrency(widgetData.today.loss.amount)}`,
			valueSub: `${widgetData.today.loss.percentage.toFixed(2)}%`,
			valueTotal: widgetData.today.loss.amount,
			labelTotal: 0,
			icon: "trending-down",
		},
		// Best Performer - only include if it exists
		...(bestPerformer ? [{
			id: "best-performer",
			label: "Best Performer",
			labelSub: bestPerformer.scrip,
			value: `Rs.${formatCurrency(bestPerformer.absoluteProfit)}`,
			valueSub: `${bestPerformer.percentProfit.toFixed(1)}%`,
			valueTotal: bestPerformer.absoluteProfit,
			labelTotal: 0,
			icon: "trophy" as const,
		}] : []),
		// Worst Performer - only include if it exists
		...(worstPerformer ? [{
			id: "worst-performer",
			label: "Worst Performer",
			labelSub: worstPerformer.scrip,
			value: `Rs.${formatCurrency(worstPerformer.absoluteProfit)}`,
			valueSub: `${worstPerformer.percentProfit.toFixed(1)}%`,
			valueTotal: worstPerformer.absoluteProfit,
			labelTotal: 0,
			icon: "skull" as const,
		}] : []),

		// === Win Rate & Trading Stats (ACCURATE) ===
		{
			id: "win-rate",
			label: "Win Rate",
			labelSub: `${winRate.winCount}W/${winRate.lossCount}L`,
			value: `${winRate.holdingsWinRate.toFixed(0)}%`,
			valueSub: "holdings",
			valueTotal: winRate.holdingsWinRate > 50 ? 1 : winRate.holdingsWinRate < 50 ? -1 : 0,
			labelTotal: 0,
			icon: "target",
			colorOverride: winRate.holdingsWinRate >= 60 ? "profit" : winRate.holdingsWinRate <= 40 ? "loss" : "warning",
		},
		{
			id: "total-transactions",
			label: "Total Trades",
			labelSub: `${trading.totalBuyOrders}B/${trading.totalSellOrders}S`,
			value: `${trading.totalTransactions}`,
			valueSub: "orders",
			valueTotal: 1,
			labelTotal: 0,
			icon: "activity",
			colorOverride: "info",
		},
		{
			id: "active-days",
			label: "Trading Journey",
			labelSub: `${trading.tradingDays} active`,
			value: `${trading.activeDays}`,
			valueSub: "days",
			valueTotal: 1,
			labelTotal: 0,
			icon: "calendar",
			colorOverride: "info",
		},
		{
			id: "most-traded",
			label: "Most Traded",
			labelSub: `${trading.mostActiveScripCount}x trades`,
			value: trading.mostActiveScrip,
			valueSub: "scrip",
			valueTotal: trading.mostActiveScripCount > 0 ? 1 : 0,
			labelTotal: 0,
			icon: "most-traded",
			colorOverride: "info",
		},
		{
			id: "favorite-scrip",
			label: "Favorite Stock",
			labelSub: "most buys",
			value: trading.favoriteScrip,
			valueSub: "scrip",
			valueTotal: 1,
			labelTotal: 0,
			icon: "heart",
			colorOverride: "info",
		},

		// === Portfolio Health (ACCURATE - Current Holdings) ===
		{
			id: "health-score",
			label: "Portfolio Health",
			labelSub: health.status,
			value: `${health.score}/100`,
			valueSub: "score",
			valueTotal: health.score >= 60 ? 1 : health.score <= 40 ? -1 : 0,
			labelTotal: 0,
			icon: "shield",
			colorOverride: health.status === "Excellent" ? "profit" : health.status === "Critical" ? "loss" : health.status === "Good" ? "profit" : "warning",
		},
		{
			id: "diversity",
			label: "Diversity Score",
			labelSub: health.concentrationRisk,
			value: `${health.diversityScore.toFixed(0)}`,
			valueSub: "/100",
			valueTotal: health.concentrationRisk === "Low" ? 1 : health.concentrationRisk === "High" ? -1 : 0,
			labelTotal: 0,
			icon: "users",
			colorOverride: health.concentrationRisk === "Low" ? "profit" : health.concentrationRisk === "High" ? "loss" : "warning",
		},
		{
			id: "trader-type",
			label: "Trader Type",
			labelSub: `${personality.buySellRatio.toFixed(1)}x B/S`,
			value: personality.type,
			valueSub: "style",
			valueTotal: 1,
			labelTotal: 0,
			icon: "zap",
			colorOverride: "info",
		},
		{
			id: "stocks-summary",
			label: "Portfolio Size",
			labelSub: `${summary.totalStocksTraded} traded`,
			value: `${summary.currentlyHolding}`,
			valueSub: "stocks",
			valueTotal: 1,
			labelTotal: 0,
			icon: "chart",
			colorOverride: "info",
		},
	];

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
			{widgets.map((widget) => (
				<WidgetCard key={widget.id} config={widget} />
			))}
		</div>
	);
}
