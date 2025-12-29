import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import type { FC } from "react";
import { memo, useMemo } from "react";
import { useIndexStatus } from "@/hooks/convex/useIndexStatus";
import { cn } from "@/lib/utils";

import { MarketStates } from "@/types/nepse-states-type";

function getMarketStatusClasses(marketState?: string) {
	const isMarketOpen =
		marketState === MarketStates.OPEN || marketState === MarketStates.PRE_OPEN;
	const isMarketOpenForText = marketState === MarketStates.OPEN;

	return {
		outerDot: cn("relative flex size-[8px] mr-1 mt-0.5"),
		pingDot: cn(
			"absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
			isMarketOpen ? "bg-lime-400" : "bg-red-500",
		),
		innerDot: cn(
			"relative inline-flex size-[8px] rounded-full",
			isMarketOpen ? "bg-lime-500" : "bg-red-600",
		),
		text: cn(
			"text-base font-semibold",
			isMarketOpenForText ? "text-lime-400" : "text-red-400",
		),
	};
}

export const MarketIndicator: FC = memo(() => {
	const { data, isPending } = useIndexStatus();

	const marketStatusClasses = useMemo(
		() => getMarketStatusClasses(data?.state),
		[data?.state],
	);

	return (
		<div>
			{isPending ? (
				<Skeleton className="h-6 w-32" />
			) : (
				<div className="flex items-center">
					<span className={marketStatusClasses.outerDot}>
						<span className={marketStatusClasses.pingDot}></span>
						<span className={marketStatusClasses.innerDot}></span>
					</span>
				</div>
			)}
		</div>
	);
});
