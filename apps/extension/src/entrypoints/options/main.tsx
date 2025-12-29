import {
	createHashHistory,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { ConvexProvider } from "convex/react";
import { createRoot } from "react-dom/client";
import Loading from "@/components/loading";
import { registerGlobalErrorListeners } from "@/lib/listners/rejection-listner";
import { convexQueryClient, queryClient } from "@/lib/query";
import {
	accountRoute,
	indexRoute,
	keysRoute,
	optionsGeneralRoute,
	optionsMarketRoute,
	optionsRoute,
	profileRoute,
	rootRoute,
} from "@/routes";

registerGlobalErrorListeners("options");

export const optionsRouter = createRouter({
	routeTree: rootRoute.addChildren([
		indexRoute,
		accountRoute,
		profileRoute,
		keysRoute,
		optionsRoute.addChildren([optionsMarketRoute, optionsGeneralRoute]),
	]),
	defaultPreload: "intent",
	defaultPendingComponent: () => <Loading />,
	history: createHashHistory(),
	context: {
		queryClient,
		convexClient: ConvexProvider,
		convexQueryClient,
		environment: "options",
		fullscreen: false,
	},
});

const root = document.getElementById("root") as HTMLElement | null;
if (!root) throw new Error("Root element not found");

createRoot(root).render(<RouterProvider router={optionsRouter} />);
