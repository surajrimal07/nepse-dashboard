import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { Button } from "@nepse-dashboard/ui/components/button";
import { Card, CardContent } from "@nepse-dashboard/ui/components/card";
import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@nepse-dashboard/ui/components/tooltip";
import { useAction } from "convex/react";
import { Info } from "lucide-react";
import type { FC } from "react";
import { lazy, memo, Suspense, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import BackButton from "@/components/back-button/back-button";
import Loading from "@/components/loading";
import AdLine from "@/components/nepse-tab/ad-line";
import Chart from "@/components/nepse-tab/chart-graph";
import {
	type ChartDatas,
	transformChartData,
} from "@/components/nepse-tab/utils";
import { useIndexChartSidepanel } from "@/hooks/convex/useIndexChart";
import { useThisIndexData } from "@/hooks/convex/useIndexData";
import { track } from "@/lib/analytics";
import {
	selectChangePlaybackSpeed,
	selectIsReplayMode,
	selectisPanelDailyChart,
	selectReplayPlaybackSpeed,
	selectSetIsReplayMode,
	selectToggleDailyChart,
} from "@/selectors/sidepanel-selectors";
import {
	type SidebarDashboardState,
	useSidebarDashboardState,
} from "@/state/sidepanel-state";
import { Env, EventName } from "@/types/analytics-types";
import type { IndexKeys } from "@/types/indexes-type";
import type { PlaybackSpeed } from "@/types/replay-types";

const ReplayComponent = lazy(() => import("@/components/nepse-tab/replay"));

const LoadingFailed = lazy(() => import("@/components/loading-failed"));

interface NepseChartComponentProps {
	panelIndex: IndexKeys;
	widgetId: string;
}

function selectors(s: SidebarDashboardState, widgetId: string) {
	return {
		toggleSidepanelChart: selectToggleDailyChart(s),
		isOnDaily: selectisPanelDailyChart(s, widgetId),
		isReplayMode: selectIsReplayMode(s, widgetId),
		setIsReplayMode: selectSetIsReplayMode(s),
		playbackSpeed: selectReplayPlaybackSpeed(s, widgetId),
		setPlaybackSpeed: selectChangePlaybackSpeed(s),
	};
}

const ChartComponent: FC<NepseChartComponentProps> = memo(
	({ panelIndex, widgetId }: NepseChartComponentProps) => {
		const hasAttemptedFetchRef = useRef(false);

		const {
			toggleSidepanelChart,
			isOnDaily,
			isReplayMode,
			setIsReplayMode,
			playbackSpeed,
			setPlaybackSpeed,
		} = useSidebarDashboardState(useShallow((s) => selectors(s, widgetId)));

		const {
			data: indexChart,
			isPending: isIndexChartLoading,
			error: indexChartError,
		} = useIndexChartSidepanel(panelIndex, isOnDaily ? "1d" : "1m");

		const {
			data: indexData,
			isPending: isIndexDataLoading,
			error: indexDataError,
		} = useThisIndexData(panelIndex);

		// Fetch chart action
		const fetchChart = useAction(api.indexChart.fetchChart);

		// Check for errors or missing required data
		// Only treat as error if data is missing AND we're not currently loading
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
			if (!panelIndex) return;

			const result = await fetchChart({
				symbol: panelIndex,
				timeframe: isOnDaily ? "1d" : "1m",
				type: "index",
			});

			toast[result ? "success" : "error"](
				result.message || "Failed to fetch chart data",
			);
		}, [fetchChart, panelIndex, isOnDaily]);

		const handleChartSwitch = useCallback(() => {
			if (widgetId) {
				toggleSidepanelChart(widgetId);
			}
		}, [toggleSidepanelChart, widgetId]);

		// One-time fetch if no chart data on first load
		useEffect(() => {
			if (hasError && !hasAttemptedFetchRef.current) {
				hasAttemptedFetchRef.current = true;
				handleReload();
			}
		}, [hasError, handleReload]);

		// Transform chart data
		const transformedChartData: ChartDatas[] | null = transformChartData(
			indexChart?.data,
			indexData?.previousClose,
			isOnDaily,
		);

		// Check if replay can be shown
		const canShowReplay = (indexChart?.data?.length || 0) > 5;

		// Show loading state
		if (isIndexDataLoading || isIndexChartLoading) {
			return (
				<div className="w-full relative h-[225px] rounded-lg">
					<Card>
						<CardContent className="flex items-center justify-center h-[225px]">
							<Skeleton className="w-full h-full" />
						</CardContent>
					</Card>
				</div>
			);
		}

		// Show error state
		if (hasError) {
			track({
				context: Env.SIDEPANEL,
				eventName: EventName.CHART_ERROR,
				params: {
					error: indexDataError
						? indexDataError.message
						: indexChartError
							? indexChartError.message
							: "missing_index_data_or_chart_data",
					panelIndex,
					isOnDaily,
				},
			});

			return (
				<div className="w-full relative h-[225px] rounded-lg">
					<Suspense fallback={<Loading />}>
						<LoadingFailed onReload={handleReload} />
					</Suspense>
				</div>
			);
		}

		// At this point, we know indexData and indexChart are non-null due to hasError check
		if (isReplayMode) {
			return (
				<div className="w-full relative h-[225px] rounded-lg">
					<Suspense fallback={<Loading />}>
						<ReplayComponent
							fullChartData={transformedChartData}
							onExit={() => setIsReplayMode(widgetId, false)}
							playbackSpeed={playbackSpeed as PlaybackSpeed}
							togglePlaybackSpeed={() => setPlaybackSpeed(widgetId)}
						/>
					</Suspense>

					<div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
						<AdLine
							data={indexData?.adLine}
							isIndexDataLoading={isIndexDataLoading}
						/>
					</div>
				</div>
			);
		}

		return (
			<div className="w-full relative h-[225px] rounded-lg">
				<Card>
					<CardContent>
						<Chart
							transformedChartData={transformedChartData}
							currentIndexColor={indexData?.color}
						/>
					</CardContent>
				</Card>

				<div className="absolute bottom-2 left-2 z-10">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								onClick={handleChartSwitch}
								className="h-4 px-2 text-xs border border-neutral-700"
								variant="outline"
							>
								{isOnDaily ? "Daily" : "Intra"}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Switch to {isOnDaily ? "intraday" : "daily"} chart</p>
						</TooltipContent>
					</Tooltip>
				</div>

				<div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
					{isIndexDataLoading ? (
						<div className="flex flex-col items-center">
							<Skeleton className="h-8 w-24 mb-1" />
							<Skeleton className="h-6 w-32 -mt-1" />
						</div>
					) : (
						<div className="flex flex-col items-center">
							<div className="flex items-center gap-1">
								<h2 className="text-3xl font-bold">
									{indexData?.close ?? "-"}
								</h2>
								<Tooltip>
									<TooltipTrigger asChild>
										<span className="mb-3 cursor-pointer">
											<Info className="h-3.5 w-3.5" />
										</span>
									</TooltipTrigger>
									<TooltipContent>
										<div className="text-xs">
											<div>
												Open:{" "}
												<span className="font-semibold">
													{indexData?.open ?? "-"}
												</span>
											</div>
											<div>
												High:{" "}
												<span className="font-semibold">
													{indexData?.high ?? "-"}
												</span>
											</div>
											<div>
												Low:{" "}
												<span className="font-semibold">
													{indexData?.low ?? "-"}
												</span>
											</div>
										</div>
									</TooltipContent>
								</Tooltip>
							</div>
							<p
								className="text-lg font-bold -mt-1"
								style={{ color: indexData?.color ?? "#00ff00" }}
							>
								{`${indexData?.change ?? "-"} / ${indexData?.percentageChange ?? "-"}%`}
							</p>
						</div>
					)}
					<BackButton
						onRefresh={handleReload}
						showReplay={
							canShowReplay ? () => setIsReplayMode(widgetId, true) : undefined
						}
					/>
					<AdLine
						data={indexData?.adLine}
						isIndexDataLoading={isIndexDataLoading}
					/>
				</div>
			</div>
		);
	},
);

ChartComponent.displayName = "NepseChartComponent";

export default ChartComponent;
