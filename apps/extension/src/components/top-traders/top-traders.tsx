import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@nepse-dashboard/ui/components/tabs";
import { useRouter } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import BackButton from "@/components/back-button/back-button";
import { useTopData } from "@/hooks/convex/useTopData";
import type { TopTabType } from "@/types/top-types";
import { TAB_TRIGGER_STYLES } from "@/utils/tab-style";
import Loading from "../loading";
import TopTradersReplay from "./replay";
import { createTabConfig } from "./tab-config";
import TabContent from "./tab-content";

const LoadingFailed = lazy(() => import("@/components/loading-failed"));

interface TopTradersCoreProps {
	defaultTab: TopTabType;
	isFullScreen?: boolean;
}

export default function TopTradersCore({
	defaultTab,
	isFullScreen,
}: TopTradersCoreProps) {
	const router = useRouter();

	const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
	const [focusedSymbol, setFocusedSymbol] = useState<string | null>(null);
	const [isReplayMode, setIsReplayMode] = useState(false);

	const { data, isPending, error } = useTopData();

	const handleTabChange = useCallback((value: string) => {
		toast.success(value);
	}, []);

	const handleItemClick = useCallback((symbol: string) => {
		setSelectedSymbol(symbol);
	}, []);

	const handleReplayClick = useCallback(() => {
		setIsReplayMode(true);
	}, []);

	const tabConfig = useMemo(
		() =>
			createTabConfig(
				data || {
					gainers: [],
					losers: [],
					transactions: [],
					turnovers: [],
					traded: [],
				},
			),
		[data],
	);

	const containerHeight = useMemo(() => {
		return isFullScreen ? "h-full" : "h-[530px]";
	}, [isFullScreen]);

	useHotkeys(
		"enter, space",
		() => {
			if (focusedSymbol) {
				setSelectedSymbol(focusedSymbol);
			}
		},
		{ enabled: !!focusedSymbol },
		[focusedSymbol],
	);

	if ((!data && !isPending) || error) {
		return (
			<div className="w-full h-full flex items-center justify-center">
				<Suspense fallback={<Loading />}>
					<LoadingFailed />
				</Suspense>
			</div>
		);
	}

	if (selectedSymbol) {
		router.navigate({
			to: "/company-details",
			search: { symbol: selectedSymbol },
		});
	}

	if (isReplayMode) {
		return (
			<TopTradersReplay
				initialTab={defaultTab}
				onBack={() => setIsReplayMode(false)}
				containerHeight={containerHeight}
			/>
		);
	}

	return (
		<div
			className={`w-full ${containerHeight} flex flex-col border-none focus:outline-hidden`}
		>
			<div className="flex-1 flex flex-col min-h-0">
				<Tabs
					defaultValue={defaultTab}
					className="w-full h-full flex flex-col"
					onValueChange={handleTabChange}
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
						>
							<div className="h-full overflow-y-auto space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
								<TabContent
									type={value}
									data={data}
									isPending={isPending}
									onItemClick={handleItemClick}
									onItemFocus={setFocusedSymbol}
									onItemBlur={() => setFocusedSymbol(null)}
								/>
							</div>
						</TabsContent>
					))}
				</Tabs>
			</div>
			<div className="shrink-0">
				<div className="flex items-center justify-between">
					<BackButton showBack={true} showReplay={handleReplayClick} />
				</div>
			</div>
		</div>
	);
}
