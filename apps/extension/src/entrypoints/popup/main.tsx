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
	popupRoute,
	portfolioRoute,
	profileRoute,
	rootRoute,
	sentimentRoute,
	supplyDemandRoute,
	topTradersRoute,
} from "@/routes";

const popupRouter = createRouter({
	routeTree: rootRoute.addChildren([
		indexRoute,
		popupRoute,
		companyDetailsRoute,
		aiChatRoute,
		dashboardRoute,
		topTradersRoute,
		accountRoute,
		profileRoute,
		disclosureRoute,
		keysRoute,
		communityChatRoute,
		marketIndices,
		notificationRoute,
		backupRoute,
		marketDepthRoute,
		sentimentRoute,
		highCapsRoute,
		ipoRoute,
		companyListRoute,
		supplyDemandRoute,
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
		environment: "popup",
		fullscreen: false,
	},
});

const root = document.getElementById("root") as HTMLElement | null;
if (!root) throw new Error("Root element not found");

createRoot(root).render(<RouterProvider router={popupRouter} />);

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof popupRouter;
	}
}

registerGlobalErrorListeners("popup");
