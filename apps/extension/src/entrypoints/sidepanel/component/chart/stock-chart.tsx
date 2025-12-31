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
import { lazy, memo, Suspense, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import BackButton from "@/components/back-button/back-button";
import Loading from "@/components/loading";
import Chart from "@/components/nepse-tab/chart-graph";
import type { ChartDatas } from "@/components/nepse-tab/utils";
import { transformChartData } from "@/components/nepse-tab/utils";
import { useGetCompany } from "@/hooks/convex/useCompanyList";
import { useGetCompanyChart } from "@/hooks/convex/useGetCompanyChart";
import { useIndexStatus } from "@/hooks/convex/useIndexStatus";
import { handleActionResult } from "@/hooks/handle-action";
import { useAppState } from "@/hooks/use-app";
import { track } from "@/lib/analytics";
import {
	selectChangePlaybackSpeed,
	selectIsDailyChart,
	selectIsReplayMode,
	selectReplayPlaybackSpeed,
	selectSetIsReplayMode,
	selectToggleDailyChart,
} from "@/selectors/sidepanel-selectors";
import type { SidebarDashboardState } from "@/state/sidepanel-state";
import { useSidebarDashboardState } from "@/state/sidepanel-state";
import { Env, EventName } from "@/types/analytics-types";
import type { PlaybackSpeed } from "@/types/replay-types";

const ReplayComponent = lazy(() => import("@/components/nepse-tab/replay"));

const LoadingFailed = lazy(() => import("@/components/loading-failed"));

interface StockChartComponentProps {
	stock: string;
	widgetId: string;
}

function selectors(s: SidebarDashboardState, widgetId: string) {
	return {
		toogleDailyChart: selectToggleDailyChart(s),
		isDaily: selectIsDailyChart(s, widgetId),
		isReplayMode: selectIsReplayMode(s, widgetId),
		setIsReplayMode: selectSetIsReplayMode(s),
		playbackSpeed: selectReplayPlaybackSpeed(s, widgetId),
		setPlaybackSpeed: selectChangePlaybackSpeed(s),
	};
}

const StockChartComponent = memo(
	({ stock, widgetId }: StockChartComponentProps) => {
		const { useStateItem, callAction } = useAppState();

		const {
			isDaily,
			toogleDailyChart,
			isReplayMode,
			setIsReplayMode,
			playbackSpeed,
			setPlaybackSpeed,
		} = useSidebarDashboardState(useShallow((s) => selectors(s, widgetId)));

		const hasAttemptedFetchRef = useRef(false);

		const [tmsUrl] = useStateItem("tmsUrl");

		const {
			data: nepseState,
			isPending: isNepseStateLoading,
			error: stateError,
		} = useIndexStatus();

		const {
			data: currentStockData,
			isPending: isCurrentStockLoading,
			error: listError,
		} = useGetCompany(stock);

		const isNepseOpen = nepseState?.isOpen || false;

		const fetchChart = useAction(api.indexChart.fetchChart);

		const { data, isPending } = useGetCompanyChart(
			stock,
			isDaily ? "1d" : "1m",
		);
		const handleBuy = useCallback(() => {
			if (tmsUrl) {
				callAction("openTradePage", stock, "buy").then(handleActionResult);
			}
		}, [tmsUrl, stock]);

		// Handle sell button
		const handleSell = useCallback(() => {
			if (tmsUrl && stock) {
				callAction("openTradePage", stock, "sell").then(handleActionResult);
			}
		}, [tmsUrl, stock]);

		const handleReload = useCallback(async () => {
			const result = await fetchChart({
				symbol: stock,
				timeframe: isDaily ? "1d" : "1m",
				type: "stock",
			});

			toast[result.success ? "success" : "error"](
				result.message || "Failed to fetch chart data",
			);
		}, [fetchChart, stock, isDaily]);

		const hasError =
			stateError ||
			listError ||
			(!isCurrentStockLoading &&
				!isNepseStateLoading &&
				!isPending &&
				(!currentStockData?.color ||
					currentStockData?.previousClose === undefined ||
					!currentStockData ||
					!nepseState ||
					!data?.data));

		const showTradeButtons = Boolean(tmsUrl) && isNepseOpen;

		const handleChartSwitch = useCallback(() => {
			toogleDailyChart(widgetId);
		}, [toogleDailyChart, widgetId]);

		useEffect(() => {
			if (!hasAttemptedFetchRef.current && hasError) {
				hasAttemptedFetchRef.current = true;
				handleReload();
			}
		}, [handleReload, hasError]);

		// Transform chart data
		const transformedChartData: ChartDatas[] | null = transformChartData(
			data?.data,
			currentStockData?.previousClose,
			isDaily,
		);

		const canShowReplay = (data?.data?.length || 0) > 5;

		if (isNepseStateLoading || isPending) {
			return (
				<div className="w-full  relative">
					<Card>
						<CardContent>
							<Skeleton className="h-[220px] w-full" />
						</CardContent>
					</Card>
				</div>
			);
		}

		if (hasError) {
			track({
				context: Env.SIDEPANEL,
				eventName: EventName.CHART_ERROR,
				params: {
					error: stateError
						? stateError.message
						: listError
							? listError.message
							: "missing_company_data_or_chart_data",
					stock,
					isDaily,
				},
			});

			return (
				<div className="w-full relative h-[225px] rounded-lg">
					<div className="h-[220px] ">
						<Suspense fallback={<Loading />}>
							<LoadingFailed onReload={() => handleReload()} />
						</Suspense>
					</div>
				</div>
			);
		}

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
				</div>
			);
		}

		return (
			<div className="w-full  relative">
				<Card>
					<CardContent className="h-[220px]">
						<Chart
							transformedChartData={transformedChartData}
							currentIndexColor={currentStockData?.color}
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
								{isDaily ? "Daily" : "Intra"}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>
								Switch to
								{isDaily ? "intraday" : "daily"} chart
							</p>
						</TooltipContent>
					</Tooltip>
				</div>

				<div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
					{isCurrentStockLoading ? (
						<div className="flex flex-col items-center">
							<Skeleton className="h-8 w-24 mb-1" />
							<Skeleton className="h-6 w-32 -mt-1" />
						</div>
					) : (
						<div className="flex flex-col items-center">
							<div className="flex items-center gap-1">
								<h2 className="text-3xl font-bold">
									{currentStockData?.closePrice ?? "-"}
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
													{currentStockData?.openPrice ?? "-"}
												</span>
											</div>
											<div>
												High:{" "}
												<span className="font-semibold">
													{currentStockData?.highPrice ?? "-"}
												</span>
											</div>
											<div>
												Low:{" "}
												<span className="font-semibold">
													{currentStockData?.lowPrice ?? "-"}
												</span>
											</div>
										</div>
									</TooltipContent>
								</Tooltip>
							</div>
							<p
								className="text-lg font-bold -mt-1"
								style={{ color: currentStockData?.color }}
							>
								{`${currentStockData?.change ?? "-"} / ${currentStockData?.percentageChange ?? "-"}%`}
							</p>
						</div>
					)}
					<BackButton
						onRefresh={handleReload}
						showBuy={showTradeButtons ? () => handleBuy() : undefined}
						showSell={showTradeButtons ? () => handleSell() : undefined}
						showReplay={
							canShowReplay ? () => setIsReplayMode(widgetId, true) : undefined
						}
					/>
				</div>
			</div>
		);
	},
);

StockChartComponent.displayName = "StockChartComponent";

export default StockChartComponent;
