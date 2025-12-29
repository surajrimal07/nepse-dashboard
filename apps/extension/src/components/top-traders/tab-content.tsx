import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import { memo, useMemo } from "react";
import type {
	GainerLoserData,
	TopTabType,
	TradedData,
	TransactionData,
	TurnoverData,
} from "@/types/top-types";
import DataItem from "./data-item";

interface TabContentProps {
	type: TopTabType;
	data: (GainerLoserData | TransactionData | TurnoverData | TradedData)[];
	isPending?: boolean;
	onItemClick?: (symbol: string) => void;
	onItemFocus?: (symbol: string) => void;
	onItemBlur?: () => void;
	isInteractive?: boolean;
}

const TabContent = memo(
	({
		type,
		data,
		isPending = false,
		onItemClick,
		onItemFocus,
		onItemBlur,
		isInteractive = true,
	}: TabContentProps) => {
		const renderSkeletons = useMemo(
			() =>
				Array.from({ length: 6 }, () => {
					const uniqueId = `skeleton-${Math.random().toString(36).substring(2, 9)}`;
					return (
						<div key={uniqueId} className="bg-card rounded-lg p-3">
							<div className="flex justify-between items-start">
								<div>
									<Skeleton className="h-5 w-16 mb-1" />
									<Skeleton className="h-4 w-32" />
								</div>
								<div className="text-right">
									<Skeleton className="h-5 w-20 mb-1" />
									<Skeleton className="h-4 w-16" />
								</div>
							</div>
						</div>
					);
				}),
			[],
		);

		return (
			<div className="space-y-2">
				{isPending
					? renderSkeletons
					: data.map((item) => (
							<DataItem
								key={item.symbol}
								item={item}
								type={type}
								onClick={onItemClick}
								onFocus={onItemFocus}
								onBlur={onItemBlur}
								isInteractive={isInteractive}
							/>
						))}
			</div>
		);
	},
);

TabContent.displayName = "TabContent";

export default TabContent;
