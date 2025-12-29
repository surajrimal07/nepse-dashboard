import { memo } from "react";
import type {
	GainerLoserData,
	TopTabType,
	TradedData,
	TransactionData,
	TurnoverData,
} from "@/types/top-types";
import ValueDisplay from "./value-display";

interface DataItemProps {
	item: GainerLoserData | TransactionData | TurnoverData | TradedData;
	type: TopTabType;
	onClick?: (symbol: string) => void;
	onFocus?: (symbol: string) => void;
	onBlur?: () => void;
	isInteractive?: boolean;
}

const DataItem = memo(
	({
		item,
		type,
		onClick,
		onFocus,
		onBlur,
		isInteractive = true,
	}: DataItemProps) => {
		const handleClick = () => {
			if (onClick && isInteractive) {
				onClick(item.symbol);
			}
		};

		const handleFocus = () => {
			if (onFocus && isInteractive) {
				onFocus(item.symbol);
			}
		};

		const handleBlur = () => {
			if (onBlur && isInteractive) {
				onBlur();
			}
		};

		const baseClasses = "w-full bg-card rounded-lg p-3 text-left";
		const interactiveClasses = isInteractive
			? "hover:bg-accent/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
			: "";

		const content = (
			<div className="flex justify-between items-start">
				<div>
					<div className="font-medium">{item.symbol}</div>
					<div className="text-xs text-muted-foreground truncate max-w-[200px]">
						{item.name}
					</div>
				</div>
				<div className="text-right">
					<div className="font-medium">₨{item.ltp}</div>
					<ValueDisplay item={item} type={type} />
				</div>
			</div>
		);

		if (!isInteractive) {
			return <div className={`${baseClasses}`}>{content}</div>;
		}

		return (
			// biome-ignore lint/a11y/useButtonType: <I know>
			<button
				onClick={handleClick}
				onFocus={handleFocus}
				onBlur={handleBlur}
				className={`${baseClasses} ${interactiveClasses}`}
				aria-label={`View details for ${item.symbol} - ${item.name}. Press Enter or Space to select.`}
			>
				{content}
			</button>
		);
	},
);

DataItem.displayName = "DataItem";

export default DataItem;
