import { createLazyRoute } from "@tanstack/react-router";
import MarketDepthCore from "@/components/market-depth/market-depth";
import { marketDepthRoute } from "@/routes";

export const Route = createLazyRoute("/marketdepth")({
	component: MarketDepth,
});

export default function MarketDepth() {
	const { symbol, sidepanel, widgetId } = marketDepthRoute.useSearch();

	return (
		<MarketDepthCore
			symbol={symbol}
			sidepanel={sidepanel}
			widgetId={widgetId}
		/>
	);
}
