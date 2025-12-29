/** biome-ignore-all lint/a11y/noStaticElementInteractions: <iknow> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <iknow> */
import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@nepse-dashboard/ui/components/tooltip";
import { useAction } from "convex/react";
import {
	CircleChevronLeft,
	CircleChevronRight,
	CirclePlus,
	CircleX,
	Info,
} from "lucide-react";
import type { FC, ReactNode } from "react";
import { memo, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { useIndexStatus } from "@/hooks/convex/useIndexStatus";
import { cn } from "@/lib/utils";
import {
	selectActiveIndexInDashboard,
	selectAddIndexInDashboard,
	selectRemoveIndexFromDashboard,
	selectSelectedIndexInDashboards,
	selectToggleDashboard,
} from "@/selectors/dashboard-selector";
import type { DashboardState } from "@/state/dashboard-state";
import { useDashboardState } from "@/state/dashboard-state";
import type { IndexKeys } from "@/types/indexes-type";
import { MarketStates } from "@/types/nepse-states-type";
import IndexSelectionDialog from "./select-index";
import { MarketIndicator } from "./state-pulsating";

// const IndexSelectionDialog = lazy(() => import("./select-index"));

interface IconButtonProps {
	children: ReactNode;
	onClick?: () => void;
	disabled?: boolean;
}

const IconButton = memo(({ children, onClick, disabled }: IconButtonProps) => {
	return (
		<span
			className={cn(
				"w-[18px] h-[18px] flex items-center justify-center",
				disabled ? "cursor-not-allowed" : "cursor-pointer",
			)}
			onClick={disabled ? undefined : onClick}
		>
			{children}
		</span>
	);
});

IconButton.displayName = "IconButton";

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
function dashboardSelector(s: DashboardState) {
	return {
		addOtherDashboard: selectAddIndexInDashboard(s),
		removeOtherDashboard: selectRemoveIndexFromDashboard(s),
		toggleDashboard: selectToggleDashboard(s),
		activeDashboard: selectActiveIndexInDashboard(s),
		otherDashboard: selectSelectedIndexInDashboards(s),
	};
}

const TopInfo: FC = memo(() => {
	const { callAction } = useAppState();
	const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
	// const addIndexChart = useHandleAddIndexChart();
	// const removeIndexChart = useHandleRemoveIndexChart();

	const {
		addOtherDashboard,
		removeOtherDashboard,
		toggleDashboard,
		activeDashboard,
		otherDashboard,
	} = useDashboardState(useShallow(dashboardSelector));

	const { data: nepseState, isPending: isNepseStateLoading } = useIndexStatus();

	const fetchChart = useAction(api.indexChart.fetchChart);

	const marketStatusClasses = useMemo(
		() => getMarketStatusClasses(nepseState?.state),
		[nepseState?.state],
	);

	const dashboardIndex = useMemo(
		() => otherDashboard.indexOf(activeDashboard),
		[activeDashboard, otherDashboard],
	);
	const isFirstItem = dashboardIndex === 0;
	const isLastItem = dashboardIndex === otherDashboard.length - 1;

	const nextDashboardName = useMemo(
		() => otherDashboard[dashboardIndex + 1],
		[dashboardIndex, otherDashboard],
	);
	const prevDashboardName = useMemo(
		() => otherDashboard[dashboardIndex - 1],
		[dashboardIndex, otherDashboard],
	);

	const handleIndexClick = useCallback(
		async (index: IndexKeys) => {
			const result = addOtherDashboard(index);

			if (!result.success) {
				toast.error(result.message);
				return;
			}

			await Promise.all([
				callAction("addIndexChart", index),

				fetchChart({
					symbol: index,
					timeframe: "1m",
					type: "index",
				}),

				fetchChart({
					symbol: index,
					timeframe: "1d",
					type: "index",
				}),
			]);

			setDialogOpen(false);
		},
		[addOtherDashboard, callAction, fetchChart],
	);

	const handleIndexRemove = useCallback(
		async (index: IndexKeys) => {
			const result = removeOtherDashboard(index);

			if (!result.success) {
				toast.error(result.message);
				return;
			}

			await callAction("removeIndexChart", index);
			setDialogOpen(false);
		},
		[removeOtherDashboard, callAction],
	);

	const handleDialogOpen = useCallback(() => {
		setDialogOpen(true);
	}, []);

	const toggle = (direction: "next" | "prev") => {
		const result = toggleDashboard(direction);
		toast.success(result.message);
	};

	return (
		<div className="w-full mr-1 p-1 rounded-lg flex items-center justify-between">
			{isNepseStateLoading ? (
				<Skeleton className="h-6 w-32" />
			) : (
				<div className="flex items-center">
					<MarketIndicator />
					<div className="flex items-center gap-1">
						<span className="text-base font-semibold">Market is</span>
						<span className={marketStatusClasses.text}>
							{nepseState?.state ?? "Close"}
						</span>
					</div>
				</div>
			)}

			<div className="flex items-center space-x-2">
				<Tooltip>
					<TooltipTrigger>
						<IconButton
							disabled={isFirstItem}
							onClick={() => handleIndexRemove(activeDashboard)}
						>
							<CircleX
								strokeWidth={1.6}
								className={cn(
									isFirstItem && "text-gray-500 cursor-not-allowed",
								)}
							/>
						</IconButton>
					</TooltipTrigger>
					<TooltipContent side="bottom" className="text-xs">
						{isFirstItem ? "Cannot close main panel" : "Close this panel"}
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger>
						<IconButton>
							<Info strokeWidth={1.6} />
						</IconButton>
					</TooltipTrigger>
					<TooltipContent side="bottom" className="text-xs">
						{activeDashboard?.toString() || "No data available"}
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger>
						<IconButton disabled={isFirstItem} onClick={() => toggle("prev")}>
							<CircleChevronLeft
								strokeWidth={1.6}
								className={cn(
									isFirstItem && "text-gray-500 cursor-not-allowed",
								)}
							/>
						</IconButton>
					</TooltipTrigger>
					<TooltipContent side="bottom" className="text-xs">
						{isFirstItem ? "No previous page" : `Go to ${prevDashboardName}`}
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger>
						<IconButton disabled={isLastItem} onClick={() => toggle("next")}>
							<CircleChevronRight
								strokeWidth={1.6}
								className={cn(isLastItem && "text-gray-500 cursor-not-allowed")}
							/>
						</IconButton>
					</TooltipTrigger>
					<TooltipContent side="bottom" className="text-xs">
						{isLastItem ? "No next page" : `Go to ${nextDashboardName}`}
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger>
						<IconButton onClick={handleDialogOpen}>
							<CirclePlus strokeWidth={1.6} />
						</IconButton>
					</TooltipTrigger>
					<TooltipContent side="bottom" className="text-xs">
						Add new item
					</TooltipContent>
				</Tooltip>
			</div>

			{isDialogOpen && (
				<IndexSelectionDialog
					isOpen={isDialogOpen}
					onClose={() => setDialogOpen(false)}
					onIndexSelect={handleIndexClick}
				/>
			)}
		</div>
	);
});

TopInfo.displayName = "TopInfo";

export default TopInfo;
