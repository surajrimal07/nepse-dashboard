import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import { lazy, memo, Suspense, useMemo } from "react";
import { ProviderOverride } from "@/components/back-button/override-provider";
import Loading from "@/components/loading";
import { UniversalErrorBoundry } from "@/components/universal-error-boundary";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Env, EventName } from "@/types/analytics-types";
import type { Widget } from "@/types/sidepanel-type";
import { WIDGET_HEIGHTS } from "@/types/sidepanel-type";
import { TopTab } from "@/types/top-types";

const TopTraders = lazy(() => import("@/components/top-traders/top-traders"));

const MarketDepth = lazy(
	() => import("@/components/market-depth/market-depth"),
);

const LoadingFailed = lazy(() => import("@/components/loading-failed"));

const WidgetNotFound = lazy(
	() => import("@/entrypoints/sidepanel/component/home/not-found"),
);

const StockChartComponent = lazy(
	() => import("@/entrypoints/sidepanel/component/chart/stock-chart"),
);

const ChartComponent = lazy(
	() => import("@/entrypoints/sidepanel/component/chart/index-chart"),
);

const SupplyDemandTab = lazy(
	() => import("@/components/supply-demand-tab/index.lazy"),
);

const MarketIndices = lazy(() => import("@/components/index-tab/index.lazy"));

const IndexDataComponent = lazy(() => import("@/components/nepse-tab/data-ui"));

export const WidgetComponent = memo<Widget>((widget) => {
	const { type, title, index, topvalue, symbol, depthSymbol, id } = widget;

	const content = useMemo(() => {
		switch (type) {
			case "chart":
				if (index == null) {
					return <LoadingFailed reason="Index not found for chart widget." />;
				}
				return <ChartComponent panelIndex={index} widgetId={id} />;
			case "top":
				return (
					<TopTraders
						defaultTab={topvalue || TopTab.GAINERS}
						isFullScreen={false}
					/>
				);
			case "depth":
				return (
					<MarketDepth sidepanel={true} symbol={depthSymbol} widgetId={id} />
				);
			case "orders":
				return <SupplyDemandTab />;
			case "marketindexes":
				return <MarketIndices />;
			case "stock":
				return symbol ? (
					<StockChartComponent stock={symbol} widgetId={id} />
				) : (
					<LoadingFailed reason="Symbol not found for stock widget." />
				);
			case "summary":
				return <IndexDataComponent />;
			default:
				return null;
		}
	}, [type, index, topvalue, symbol, depthSymbol, id]);

	if (!content) {
		track({
			context: Env.SIDEPANEL,
			eventName: EventName.WIDGET_NOT_FOUND,
			params: {
				widget,
			},
		});

		return (
			<Suspense fallback={<Loading />}>
				<WidgetNotFound title={widget.title} />
			</Suspense>
		);
	}

	return (
		<ProviderOverride value={{ fullscreen: false, canGoBack: false }}>
			<div
				className={cn(
					"flex flex-col",
					WIDGET_HEIGHTS[type as keyof typeof WIDGET_HEIGHTS],
				)}
			>
				<h3 className="text-sm font-medium truncate max-w-[300px] shrink-0">
					{title}
				</h3>

				<UniversalErrorBoundry minimal={true} componentName="SidepanelWidget">
					<Suspense
						fallback={
							<div className="flex-1 space-y-3">
								<Skeleton className="h-4 w-2/3" />
								<div className="space-y-2">
									<Skeleton className="h-3 w-full" />
									<Skeleton className="h-3 w-5/6" />
									<Skeleton className="h-3 w-4/6" />
								</div>
								<div className="flex space-x-2">
									<Skeleton className="h-8 w-16" />
									<Skeleton className="h-8 w-20" />
								</div>
								<Skeleton className="flex-1 w-full" />
							</div>
						}
					>
						{content}
					</Suspense>
				</UniversalErrorBoundry>
			</div>
		</ProviderOverride>
	);
});

WidgetComponent.displayName = "WidgetComponent";
