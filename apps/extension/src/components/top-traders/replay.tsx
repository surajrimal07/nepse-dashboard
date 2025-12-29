import { Button } from "@nepse-dashboard/ui/components/button";
import { Progress } from "@nepse-dashboard/ui/components/progress";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@nepse-dashboard/ui/components/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@nepse-dashboard/ui/components/tooltip";
import { Pause, Play, RotateCcw, X } from "lucide-react";
import {
	lazy,
	memo,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useShallow } from "zustand/react/shallow";
import { useAllTopData } from "@/hooks/convex/useTopData";
import {
	selectChangePlaybackSpeed,
	selectReplayPlaybackSpeed,
} from "@/selectors/general-selector";

import { type GeneralState, useGeneralState } from "@/state/general-state";
import type { TopTabType } from "@/types/top-types";
import { TopTab } from "@/types/top-types";
import { TAB_TRIGGER_STYLES } from "@/utils/tab-style";
import { createTabConfig } from "./tab-config";
import TabContent from "./tab-content";

const LoadingFailed = lazy(() => import("@/components/loading-failed"));

function selectors(s: GeneralState) {
	return {
		playbackSpeed: selectReplayPlaybackSpeed(s),
		togglePlaybackSpeed: selectChangePlaybackSpeed(s),
	};
}

interface TopTradersReplayProps {
	initialTab?: TopTabType;
	onBack: () => void;
	containerHeight?: string;
}

const TopTradersReplay = memo(
	({
		initialTab = TopTab.GAINERS,
		onBack,
		containerHeight = "h-[540px]",
	}: TopTradersReplayProps) => {
		const { data: allData, isPending, error } = useAllTopData();

		const [currentIndex, setCurrentIndex] = useState(0);
		const [isPlaying, setIsPlaying] = useState(true);
		const { playbackSpeed, togglePlaybackSpeed } = useGeneralState(
			useShallow((s) => selectors(s)),
		);

		const currentData = useMemo(() => {
			return allData?.[currentIndex];
		}, [allData, currentIndex]);

		const maxIndex = (allData?.length || 1) - 1;
		const isCompleted = currentIndex >= maxIndex;

		const tabConfig = useMemo(
			() =>
				createTabConfig(
					currentData || {
						gainers: [],
						losers: [],
						transactions: [],
						turnovers: [],
						traded: [],
					},
				),
			[currentData],
		);

		// Progress calculation
		const progress = useMemo(() => {
			if (!allData || allData.length === 0) return 0;
			return ((currentIndex + 1) / allData.length) * 100;
		}, [currentIndex, allData]);

		const handlePlayPause = useCallback(() => {
			if (isCompleted) {
				setCurrentIndex(0);
			}
			setIsPlaying((prev) => !prev);
		}, [isCompleted]);

		const handleReset = useCallback(() => {
			setCurrentIndex(0);
			setIsPlaying(false);
		}, []);

		const handleSpeedToggle = useCallback(() => {
			togglePlaybackSpeed();
		}, [togglePlaybackSpeed]);

		// Auto-play functionality
		useEffect(() => {
			if (!isPlaying || isCompleted || !allData || allData.length === 0) {
				return;
			}

			const timer = setInterval(() => {
				setCurrentIndex((prev) => {
					if (prev >= allData.length - 1) {
						setIsPlaying(false);
						return prev;
					}
					return prev + 1;
				});
			}, playbackSpeed);

			return () => clearInterval(timer);
		}, [isPlaying, playbackSpeed, allData, isCompleted]);

		// Auto-pause when completed
		useEffect(() => {
			if (isCompleted && isPlaying) {
				setIsPlaying(false);
			}
		}, [isCompleted, isPlaying]);

		const hasNoData = !currentData || !allData || allData.length === 0;
		const canReset = currentIndex > 0 || isCompleted;

		// Handle loading and error states after all hooks are called
		if (isPending) {
			return (
				<div className="w-full h-full flex items-center justify-center">
					<div className="text-center">
						<div className="text-lg font-medium">Loading replay data...</div>
						<div className="text-sm text-muted-foreground">
							Please wait while we fetch historical data
						</div>
					</div>
				</div>
			);
		}

		if (error || !allData || allData.length === 0) {
			return (
				<div className="w-full h-full flex items-center justify-center">
					<div className="text-center">
						<div className="text-lg font-medium">No replay data available</div>
						<div className="text-sm text-muted-foreground mb-4">
							{error
								? "Failed to load historical data"
								: "No historical data found"}
						</div>
						<Button onClick={onBack} variant="outline">
							Go Back
						</Button>
					</div>
				</div>
			);
		}

		if (!currentData) {
			return (
				<div className="w-full h-full flex items-center justify-center">
					<Suspense fallback={<Loading />}>
						<LoadingFailed />
					</Suspense>
				</div>
			);
		}

		return (
			<div className={`relative ${containerHeight} w-full`}>
				<div className="h-full flex flex-col">
					<Tabs
						defaultValue={initialTab}
						className="w-full h-full flex flex-col"
					>
						<TabsList className="w-full grid grid-cols-5 h-9 gap-0.5 shrink-0">
							{tabConfig.map(({ value, icon: Icon }) => (
								<TabsTrigger
									key={value}
									value={value}
									className={TAB_TRIGGER_STYLES}
								>
									<Icon />
								</TabsTrigger>
							))}
						</TabsList>

						{tabConfig.map(({ value, data }) => (
							<TabsContent
								key={value}
								value={value}
								className="mt-0.5 flex-1 min-h-0"
								style={{ paddingBottom: "75px" }}
							>
								<div className="h-full overflow-y-auto space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
									<TabContent
										type={value}
										data={data}
										isPending={false}
										isInteractive={false}
									/>
								</div>
							</TabsContent>
						))}
					</Tabs>
				</div>

				{/* Replay Controls - Bottom Overlay (Similar to the attached replay component) */}
				<div className="absolute bottom-0 left-0 right-0 z-10">
					{/* Background overlay for better visibility */}
					<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/60 to-transparent pointer-events-none" />

					{/* Controls container */}
					<div className="relative flex items-center justify-center pb-1.5">
						<div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
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
											(percentage / 100) * (allData.length - 1),
										);
										setCurrentIndex(
											Math.max(0, Math.min(newIndex, allData.length - 1)),
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
										onClick={onBack}
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
				</div>

				{/* Time Info - Bottom Center (Similar to the attached replay component) */}
				<div className="absolute bottom-13 left-1/2 transform -translate-x-1/2 z-10">
					{currentData && (
						<div className="flex items-center gap-3 text-center">
							<span className="text-sm font-bold text-white drop-shadow-lg">
								Time: {currentData.time}
							</span>
						</div>
					)}
				</div>
			</div>
		);
	},
);

TopTradersReplay.displayName = "TopTradersReplay";

export default TopTradersReplay;
