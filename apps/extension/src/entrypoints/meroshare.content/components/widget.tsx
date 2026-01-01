import type { AdvancedUserInsights } from "../calculation";
import type { ProcessedStats } from "../type";
import ChangedInfo from "./changed-info";
import MarketSignal from "./market-signal";
import AdvancedWidgetsGrid from "./advanced-widget-grid";

interface PortfolioWidgetsProps {
	stats: ProcessedStats;
	insights: AdvancedUserInsights | null;
	lastSynced: number | null;
}

export default function PortfolioWidgets({
	stats,
	insights,
	lastSynced,
}: PortfolioWidgetsProps) {
	return (
		<div className="space-y-3 py-2">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold text-gray-700">
					📊 Portfolio Insights
				</h3>
				<MarketSignal />
			</div>
			{!insights ? (
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
					{Array.from({ length: 15 }).map((_, i) => (
						<div
							key={i}
							className="h-20 bg-gray-100 rounded-lg animate-pulse"
						/>
					))}
				</div>
			) : (
				<AdvancedWidgetsGrid insights={insights} stats={stats} />
			)}
			<ChangedInfo syncTimestamp={lastSynced} />
		</div>
	);
}
