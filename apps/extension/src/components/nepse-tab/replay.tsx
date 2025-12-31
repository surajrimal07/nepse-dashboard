import { Button } from "@nepse-dashboard/ui/components/button";
import { ChartContainer } from "@nepse-dashboard/ui/components/chart";
import { Progress } from "@nepse-dashboard/ui/components/progress";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@nepse-dashboard/ui/components/tooltip";
import { Pause, Play, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Area, AreaChart, Tooltip as ChartTooltip, YAxis } from "recharts";
import { createTooltipRenderer } from "@/components/nepse-tab/tooltip";
import type { ChartDatas } from "@/components/nepse-tab/utils";
import {
	calculateChartBounds,
	createChartConfig,
	generateChartId,
} from "@/components/nepse-tab/utils";
import type { PlaybackSpeed } from "@/types/replay-types";
import {
	CHART_MARGIN,
	REPLAY_BASE_INTERVAL,
	TOOLTIP_CURSOR_BASE,
} from "@/types/replay-types";

interface ReplayComponentProps {
	fullChartData: ChartDatas[];
	playbackSpeed: PlaybackSpeed;
	togglePlaybackSpeed: () => void;
	onExit: () => void;
}

export default function ReplayComponent({
	fullChartData,
	playbackSpeed,
	togglePlaybackSpeed,
	onExit,
}: ReplayComponentProps) {
	const currentIndexColor = "#facc15"; // Yellow color becuase actual color will invalid the point of replay and backtesting

	const [currentIndex, setCurrentIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(true);

	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const maxIndex = fullChartData.length - 1;
	const isCompleted = currentIndex >= maxIndex;

	// Optimized current chart data - avoid unnecessary slicing
	const currentChartData = useMemo(() => {
		if (currentIndex <= 0) return fullChartData.slice(0, 1);
		if (isCompleted) return fullChartData;
		return fullChartData.slice(0, currentIndex + 1);
	}, [fullChartData, currentIndex, isCompleted]);

	// Static chart configuration - only recreate when dependencies change
	const chartConfig = useMemo(
		() => ({
			bounds: calculateChartBounds(fullChartData),
			id: generateChartId,
			config: createChartConfig(currentIndexColor),
			renderTooltip: createTooltipRenderer(currentIndexColor),
		}),
		[fullChartData, currentIndexColor],
	);

	const [minValue, maxValue, padding] = chartConfig.bounds;

	// Memoized derived values
	const yAxisDomain = useMemo(
		() => [minValue - padding, maxValue + padding],
		[minValue, maxValue, padding],
	);

	const tooltipCursor = useMemo(
		() => ({ ...TOOLTIP_CURSOR_BASE, stroke: currentIndexColor }),
		[currentIndexColor],
	);

	const gradientFillUrl = `url(#${chartConfig.id})`;

	const progress = useMemo(() => {
		if (fullChartData.length === 0) return 0;
		return ((currentIndex + 1) / fullChartData.length) * 100;
	}, [currentIndex, fullChartData.length]);

	const currentDataPoint = useMemo(() => {
		const length = currentChartData.length;
		return length > 0 ? currentChartData[length - 1] : null;
	}, [currentChartData]);

	// Cleanup interval helper
	const clearPlaybackInterval = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	}, [clearInterval]);

	// Optimized playback effect - simplified logic
	useEffect(() => {
		if (!isPlaying || isCompleted || fullChartData.length === 0) {
			clearPlaybackInterval();
			return;
		}

		const delay = REPLAY_BASE_INTERVAL / playbackSpeed;

		intervalRef.current = setInterval(() => {
			setCurrentIndex((prev) => {
				const nextIndex = prev + 1;
				if (nextIndex >= maxIndex) {
					return maxIndex; // State will handle completion in next render
				}
				return nextIndex;
			});
		}, delay);

		return clearPlaybackInterval;
	}, [
		isPlaying,
		isCompleted,
		playbackSpeed,
		maxIndex,
		fullChartData.length,
		clearPlaybackInterval,
	]);

	// Auto-pause when completed
	useEffect(() => {
		if (isCompleted && isPlaying) {
			setIsPlaying(false);
		}
	}, [isCompleted, isPlaying]);

	// Stable control handlers
	const handlePlayPause = useCallback(() => {
		if (isCompleted) {
			setCurrentIndex(0);
		}
		setIsPlaying((prev) => !prev);
	}, [isCompleted]);

	const handleReset = useCallback(() => {
		setCurrentIndex(0);
		// Keep current playing state
	}, []);

	const handleSpeedToggle = useCallback(() => {
		togglePlaybackSpeed();
	}, [togglePlaybackSpeed]);

	// Memoized gradient component to prevent re-creation
	const gradientDef = useMemo(
		() => (
			<defs>
				<linearGradient id={chartConfig.id} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor={currentIndexColor} stopOpacity={0.2} />
					<stop offset="100%" stopColor={currentIndexColor} stopOpacity={0} />
				</linearGradient>
			</defs>
		),
		[chartConfig.id, currentIndexColor],
	);

	const hasNoData = currentChartData.length === 0;
	const canReset = currentIndex > 0 || isCompleted;

	return (
		<div className="relative h-full w-full">
			<ChartContainer className="h-[170px] w-full" config={chartConfig.config}>
				<AreaChart data={currentChartData} margin={CHART_MARGIN}>
					<YAxis domain={yAxisDomain} hide />
					<ChartTooltip
						cursor={tooltipCursor}
						content={chartConfig.renderTooltip}
					/>
					{gradientDef}
					<Area
						dataKey="value"
						type="monotone"
						fill={gradientFillUrl}
						stroke={currentIndexColor}
						strokeWidth={1.6}
						isAnimationActive={false}
					/>
				</AreaChart>
			</ChartContainer>
			<div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
				<div className="flex items-center gap-2">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								onClick={handlePlayPause}
								className="h-7 w-7 p-0 border border-neutral-700"
								variant="outline"
								disabled={hasNoData}
							>
								{isPlaying ? (
									<Pause className="h-4 w-4" />
								) : (
									<Play className="h-4 w-4" />
								)}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>{isPlaying ? "Pause" : "Play"} replay</p>
						</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								onClick={handleReset}
								className="h-7 w-7 p-0 border border-neutral-700"
								variant="outline"
								disabled={!canReset}
							>
								<RotateCcw className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Reset replay</p>
						</TooltipContent>
					</Tooltip>

					<div className="flex items-center gap-2">
						<Progress
							value={progress}
							className="w-32 h-2.5 cursor-pointer hover:opacity-80 transition-opacity"
							onClick={(e) => {
								const rect = e.currentTarget.getBoundingClientRect();
								const clickX = e.clientX - rect.left;
								const percentage = (clickX / rect.width) * 100;
								const newIndex = Math.round(
									(percentage / 100) * (fullChartData.length - 1),
								);
								setCurrentIndex(
									Math.max(0, Math.min(newIndex, fullChartData.length - 1)),
								);
							}}
						/>
					</div>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								onClick={handleSpeedToggle}
								className="h-6 px-2 text-xs border border-neutral-600 font-mono bg-neutral-800 hover:bg-neutral-700"
								variant="outline"
							>
								{playbackSpeed}x
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Change playback speed</p>
						</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								onClick={onExit}
								className="h-6 w-6 p-0 border bg-red-600 hover:bg-red-700 text-white"
								variant="outline"
							>
								<X className="h-3 w-3" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Exit replay mode</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
			<div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
				{currentDataPoint && (
					<div className="flex items-center gap-3 text-center">
						<span className="text-sm font-bold text-white">
							{currentDataPoint.value.toFixed(2)}
						</span>
						<span className="text-sm font-semibold">
							{currentDataPoint.change > 0 ? "+" : ""}
							{currentDataPoint.change.toFixed(2)}
						</span>
						<span className="text-xs">{currentDataPoint.time}</span>
					</div>
				)}
			</div>
		</div>
	);
}
