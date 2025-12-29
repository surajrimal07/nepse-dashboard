import { Button } from "@nepse-dashboard/ui/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@nepse-dashboard/ui/components/tooltip";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import {
	ArrowRightLeft,
	ChartCandlestick,
	ChevronLeft,
	Play,
	Plus,
	RefreshCcw,
	Settings,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";
import { memo, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useGeneralState } from "@/state/general-state";
import { useWidgetOverride } from "./override-provider";

interface BackButtonsProps {
	showBack?: boolean;
	onBack?: () => void;
	onRefresh?: () => void;
	switchButton?: () => void;
	showChat?: () => void;
	showBuy?: () => void;
	showSell?: () => void;
	chartSwitch?: () => void;
	showAdd?: () => void;
	showOptions?: () => void;
	showReplay?: () => void;
}

const ICONS = {
	back: <ChevronLeft className="h-3 w-3" />,
	refresh: <RefreshCcw className="h-3 w-3" />,
	switch: <ArrowRightLeft className="h-3 w-3" />,
	chat: <ChartCandlestick className="h-3 w-3" />,
	buy: <TrendingUp className="h-3 w-3" />,
	sell: <TrendingDown className="h-3 w-3" />,
	chartSwitch: <ChartCandlestick className="h-3 w-3" />,
	add: <Plus className="h-3 w-3" />,
	options: <Settings className="h-3 w-3" />,
	replay: <Play className="h-3 w-3" />,
} as const;

const commonButtonClass =
	"h-6 w-6 rounded-full bg-black hover:bg-gray-500 dark:bg-zinc-200/90 dark:hover:bg-zinc-400 shadow-md hover:shadow-lg backdrop-blur-xs ring-1 ring-black/5 dark:ring-white/10 transition-all duration-200";

const BackButtonItem = memo(
	({
		onClick,
		icon,
		tooltip,
	}: {
		onClick: () => void;
		icon: ReactNode;
		tooltip: string;
	}) => (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button size="icon" className={commonButtonClass} onClick={onClick}>
					{icon}
				</Button>
			</TooltipTrigger>
			<TooltipContent side="top">
				<p>{tooltip}</p>
			</TooltipContent>
		</Tooltip>
	),
);
BackButtonItem.displayName = "BackButtonItem";

const BackButton = memo(
	({
		showBack,
		onBack,
		onRefresh,
		switchButton,
		showChat,
		showBuy,
		showSell,
		chartSwitch,
		showAdd,
		showOptions,
		showReplay,
	}: BackButtonsProps) => {
		const hasBanner = useGeneralState((s) => s.hasBanner);

		const routeContext = useRouteContext({ strict: false });
		const isSidepanel = routeContext.environment === "sidepanel";

		const { fullscreen: overrideFullscreen, canGoBack: overrideCanGoBack } =
			useWidgetOverride();

		const isFullScreen = isSidepanel
			? (overrideFullscreen ?? routeContext.fullscreen)
			: routeContext.fullscreen;

		const router = useRouter();

		const handleBack = useCallback(() => {
			router.history.back();
		}, [router.history]);

		// Check if we can go back - must be at top level, not in useMemo
		const canGoBackValue = useMemo(() => {
			if (overrideCanGoBack !== undefined) {
				return overrideCanGoBack;
			}

			const canNavigateBack = router.history.canGoBack();

			if (!canNavigateBack) {
				return false;
			}

			return true;
		}, [router.history, routeContext.environment, isFullScreen]);

		// Optimized button configuration - only create objects for active buttons
		const activeButtons = useMemo(() => {
			const buttons = [];

			if (showBack && canGoBackValue) {
				buttons.push({
					onClick: handleBack,
					icon: ICONS.back,
					tooltip: "Go Back",
					key: "back",
				});
			}

			if (onBack) {
				buttons.push({
					onClick: onBack,
					icon: ICONS.back,
					tooltip: "Go Back",
					key: "back",
				});
			}
			if (onRefresh) {
				buttons.push({
					onClick: onRefresh,
					icon: ICONS.refresh,
					tooltip: "Refresh Data",
					key: "refresh",
				});
			}
			if (switchButton) {
				buttons.push({
					onClick: switchButton,
					icon: ICONS.switch,
					tooltip: "Switch Stock",
					key: "switch",
				});
			}
			if (showChat) {
				buttons.push({
					onClick: showChat,
					icon: ICONS.chat,
					tooltip: "Open Stock Chart",
					key: "chat",
				});
			}
			if (showBuy) {
				buttons.push({
					onClick: showBuy,
					icon: ICONS.buy,
					tooltip: "Buy Stock",
					key: "buy",
				});
			}
			if (showSell) {
				buttons.push({
					onClick: showSell,
					icon: ICONS.sell,
					tooltip: "Sell Stock",
					key: "sell",
				});
			}
			if (chartSwitch) {
				buttons.push({
					onClick: chartSwitch,
					icon: ICONS.chartSwitch,
					tooltip: "Switch Chart",
					key: "chartSwitch",
				});
			}
			if (showAdd) {
				buttons.push({
					onClick: showAdd,
					icon: ICONS.add,
					tooltip: "Add Order",
					key: "add",
				});
			}
			if (showOptions) {
				buttons.push({
					onClick: showOptions,
					icon: ICONS.options,
					tooltip: "Options",
					key: "options",
				});
			}
			if (showReplay) {
				buttons.push({
					onClick: showReplay,
					icon: ICONS.replay,
					tooltip: "Start Replay",
					key: "replay",
				});
			}

			return buttons;
		}, [
			showBack,
			canGoBackValue,
			handleBack,
			onBack,
			onRefresh,
			switchButton,
			showChat,
			showBuy,
			showSell,
			chartSwitch,
			showAdd,
			showOptions,
			showReplay,
		]);

		// Memoize container className
		const containerClassName = useMemo(
			() =>
				cn(
					"absolute right-2 flex flex-row justify-end gap-1.5",
					isFullScreen ? (hasBanner ? "bottom-35" : "bottom-18") : "bottom-2",
				),
			[isFullScreen, hasBanner],
		);

		// Early return if no buttons to render
		if (activeButtons.length === 0) {
			return null;
		}

		return (
			<div className={containerClassName}>
				{activeButtons.map((button) => (
					<BackButtonItem
						key={button.key}
						onClick={button.onClick}
						icon={button.icon}
						tooltip={button.tooltip}
					/>
				))}
			</div>
		);
	},
);
BackButton.displayName = "BackButton";

export default BackButton;
