import { memo } from "react";
import type {
	GainerLoserData,
	TopTabType,
	TradedData,
	TransactionData,
	TurnoverData,
} from "@/types/top-types";
import { TopTab } from "@/types/top-types";

interface ValueDisplayProps {
	item: GainerLoserData | TransactionData | TurnoverData | TradedData;
	type: TopTabType;
}

const ValueDisplay = memo(({ item, type }: ValueDisplayProps) => {
	switch (type) {
		case TopTab.GAINERS:
			return (
				<div className="text-xs text-emerald-500">
					+{(item as GainerLoserData).pointchange} (
					{(item as GainerLoserData).percentchange}
					%)
				</div>
			);
		case TopTab.LOSERS:
			return (
				<div className="text-xs text-red-500">
					{(item as GainerLoserData).pointchange} (
					{(item as GainerLoserData).percentchange}
					%)
				</div>
			);
		case TopTab.TRANSACTIONS:
			return (
				<div className="text-xs text-muted-foreground">
					{(item as TransactionData).transactions.toLocaleString()} trades
				</div>
			);
		case TopTab.TURNOVERS:
			return (
				<div className="text-xs text-muted-foreground">
					₨{(item as TurnoverData).turnover}
				</div>
			);
		case TopTab.TRADED:
			return (
				<div className="text-xs text-muted-foreground">
					{(item as TradedData).shareTraded.toLocaleString()} shares
				</div>
			);
		default:
			return null;
	}
});

ValueDisplay.displayName = "ValueDisplay";

export default ValueDisplay;
