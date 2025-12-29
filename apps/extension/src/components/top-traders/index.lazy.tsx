import { createLazyRoute, useRouteContext } from "@tanstack/react-router";
import TopTradersCore from "@/components/top-traders/top-traders";
import { topTradersRoute } from "@/routes";
import { TopTab } from "@/types/top-types";

export const Route = createLazyRoute("/toptraders")({
	component: TopTraders,
});

export default function TopTraders() {
	const { initialTab } = topTradersRoute.useSearch();
	const defaultTab = initialTab || TopTab.GAINERS;

	const routeContext = useRouteContext({ strict: false });

	const isFullScreen = routeContext.fullscreen;

	return <TopTradersCore defaultTab={defaultTab} isFullScreen={isFullScreen} />;
}
