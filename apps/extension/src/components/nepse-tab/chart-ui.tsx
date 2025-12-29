import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { Button } from "@nepse-dashboard/ui/components/button";
import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@nepse-dashboard/ui/components/tooltip";
import { useAction } from "convex/react";
import { CirclePlay } from "lucide-react";
import type { FC } from "react";
import { Fragment, lazy, memo, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import Loading from "@/components/loading";
import AdLine from "@/components/nepse-tab/ad-line";
import {
	type ChartDatas,
	transformChartData,
} from "@/components/nepse-tab/utils";
import { useIndexChart } from "@/hooks/convex/useIndexChart";
import { useIndexData } from "@/hooks/convex/useIndexData";
import { cn } from "@/lib/utils";
import {
	selectActiveIndexInDashboard,
	selectChangePlaybackSpeed,
	selectIsDailyChart,
	selectIsReplayMode,
	selectReplayPlaybackSpeed,
	selectSelectedIndexInDashboards,
	selectSetIsReplayMode,
	selectToggleChartType,
} from "@/selectors/dashboard-selector";
import {
	type DashboardState,
	useDashboardState,
} from "@/state/dashboard-state";
import Chart from "./chart-graph";
import ReplayComponent from "./replay";

const LoadingFailed = lazy(() => import("@/components/loading-failed"));

function selectors(s: DashboardState) {
	return {
		activeDashboard: selectActiveIndexInDashboard(s),
		isDailyChart: selectIsDailyChart(s),
		toggleChart: selectToggleChartType(s),
		otherDashboard: selectSelectedIndexInDashboards(s),
		isReplayMode: selectIsReplayMode(s),
		setIsReplayMode: selectSetIsReplayMode(s),
		playbackSpeed: selectReplayPlaybackSpeed(s),
		setPlaybackSpeed: selectChangePlaybackSpeed(s),
	};
}

const ChartComponent: FC = memo(() => {
	const {
		activeDashboard,
		isDailyChart,
		toggleChart,
		otherDashboard,
		isReplayMode,
		setIsReplayMode,
		playbackSpeed,
		setPlaybackSpeed,
	} = useDashboardState(useShallow((s) => selectors(s)));

	const {
		data: indexData,
		isPending: isIndexDataLoading,
		error: indexDataError,
	} = useIndexData();

	const {
		data: indexChart,
		isPending: isIndexChartLoading,
		error: indexChartError,
	} = useIndexChart();

	// Track if we've attempted to fetch once
	const hasAttemptedFetchRef = useRef(false);

	// Fetch chart action
	const fetchChart = useAction(api.indexChart.fetchChart);

	// Check for errors or missing required data
	const hasError =
		indexDataError ||
		indexChartError ||
		(!isIndexDataLoading &&
			!isIndexChartLoading &&
			(!indexData?.color ||
				indexData?.previousClose === undefined ||
				!indexData?.adLine ||
				!indexData ||
				!indexChart));

	const handleReload = useCallback(async () => {
		if (!activeDashboard) return;

		const result = await fetchChart({
			symbol: activeDashboard,
			timeframe: isDailyChart ? "1d" : "1m",
			type: "index",
		});

		toast[result ? "success" : "error"](
			result.message || "Failed to fetch chart data",
		);
	}, [fetchChart, activeDashboard, isDailyChart]);

	// One-time fetch if no chart data on first load
	useEffect(() => {
		if (!hasAttemptedFetchRef.current && hasError) {
			hasAttemptedFetchRef.current = true;
			handleReload();
		}
	}, [hasError, handleReload]);

	// Transform chart data
	const transformedChartData: ChartDatas[] | null = transformChartData(
		indexChart?.data,
		indexData?.previousClose,
		isDailyChart,
	);

	// Check if replay can be shown
	const canShowReplay = (indexChart?.data?.length || 0) > 5;

	// Show loading state
	if (isIndexDataLoading || isIndexChartLoading) {
		return <Loading />;
	}

	// Show error state
	if (hasError) {
		return (
			<Suspense fallback={<Loading />}>
				<LoadingFailed onReload={handleReload} />
			</Suspense>
		);
	}

	// At this point, we know indexData and indexChart are non-null due to hasError check
	if (isReplayMode) {
		return (
			<Fragment>
				<ReplayComponent
					fullChartData={transformedChartData}
					playbackSpeed={playbackSpeed}
					togglePlaybackSpeed={() => setPlaybackSpeed()}
					onExit={() => setIsReplayMode(false)}
				/>

				<div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
					<AdLine
						data={indexData?.adLine}
						isIndexDataLoading={isIndexDataLoading}
					/>
				</div>
			</Fragment>
		);
	}

	return (
		<Fragment>
			<Chart
				currentIndexColor={indexData?.color}
				transformedChartData={transformedChartData}
			/>

			<div className="absolute bottom-2 left-2 z-10">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							size="sm"
							onClick={toggleChart}
							className="h-4 px-2 text-xs border border-neutral-700"
							variant="outline"
						>
							{isDailyChart ? "Daily" : "Intra"}
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Switch to {isDailyChart ? "intraday" : "daily"} chart</p>
					</TooltipContent>
				</Tooltip>
			</div>

			{canShowReplay && (
				<div className="absolute bottom-2 left-80 z-10">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								onClick={() => setIsReplayMode(true)}
								className="h-4 w-4 p-0 border border-neutral-700"
								variant="outline"
							>
								<CirclePlay className="h-3 w-3" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Replay chart</p>
						</TooltipContent>
					</Tooltip>
				</div>
			)}

			<div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
				{isIndexDataLoading ? (
					<div className="flex flex-col items-center">
						<Skeleton className="h-8 w-24 mb-1" />
						<Skeleton className="h-6 w-32 -mt-1" />
					</div>
				) : (
					<div className="flex flex-col items-center">
						<h2 className="text-3xl font-bold">{indexData?.close ?? "-"}</h2>
						<p
							className="text-lg font-bold -mt-1"
							style={{ color: indexData?.color ?? "#00ff00" }}
						>
							{`${indexData?.change ?? "-"} / ${indexData?.percentageChange ?? "-"}%`}
						</p>
					</div>
				)}

				<div className="flex gap-1 mb-1.5 mt-1">
					{otherDashboard.map((dashboard) => (
						<div
							key={dashboard}
							className={cn(
								"w-[0.30rem] h-[0.30rem] rounded-full",
								dashboard === activeDashboard ? "bg-white" : "bg-gray-500",
							)}
						/>
					))}
				</div>
				<AdLine
					data={indexData?.adLine}
					isIndexDataLoading={isIndexDataLoading}
				/>
			</div>
		</Fragment>
	);
});

ChartComponent.displayName = "NepseChartComponent";

export default ChartComponent;
