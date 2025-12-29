import {
	createHashHistory,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { ConvexProvider } from "convex/react";
import { createRoot } from "react-dom/client";
import Loading from "@/components/loading";
import RouteNotFound from "@/components/route-not-found";
import { registerGlobalErrorListeners } from "@/lib/listners/rejection-listner";
import { convexQueryClient, queryClient } from "@/lib/query";
import {
	accountRoute,
	aiChatRoute,
	backupRoute,
	communityChatRoute,
	companyDetailsRoute,
	companyListRoute,
	dashboardRoute,
	disclosureRoute,
	highCapsRoute,
	indexRoute,
	ipoRoute,
	keysRoute,
	marketDepthRoute,
	marketIndices,
	notificationRoute,
	portfolioRoute,
	profileRoute,
	rootRoute,
	sentimentRoute,
	sidepanelRoute,
	supplyDemandRoute,
	topTradersRoute,
} from "@/routes";

const sidepanelRouter = createRouter({
	routeTree: rootRoute.addChildren([
		indexRoute,
		sidepanelRoute,
		companyDetailsRoute,
		dashboardRoute,
		topTradersRoute,
		accountRoute,
		profileRoute,
		notificationRoute,
		aiChatRoute,
		highCapsRoute,
		marketIndices,
		communityChatRoute,
		disclosureRoute,
		keysRoute,
		backupRoute,
		marketDepthRoute,
		sentimentRoute,
		companyListRoute,
		supplyDemandRoute,
		ipoRoute,
		portfolioRoute,
	]),
	defaultPreload: "intent",
	defaultPendingComponent: () => <Loading />,
	defaultNotFoundComponent: () => <RouteNotFound />,
	history: createHashHistory(),
	context: {
		queryClient,
		convexClient: ConvexProvider,
		convexQueryClient,
		environment: "sidepanel",
		fullscreen: true,
	},
});

const root = document.getElementById("root") as HTMLElement | null;
if (!root) throw new Error("Root element not found");

createRoot(root).render(<RouterProvider router={sidepanelRouter} />);

registerGlobalErrorListeners("sidepanel");
