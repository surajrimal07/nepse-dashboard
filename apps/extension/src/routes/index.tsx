import { type ConvexQueryClient, convexQuery } from "@convex-dev/react-query";
import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { TooltipProvider } from "@nepse-dashboard/ui/components/tooltip";
import type { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import {
	createRootRouteWithContext,
	createRoute,
	Outlet,
	redirect,
	useRouteContext,
} from "@tanstack/react-router";
import { ConvexProvider } from "convex/react";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";
import { Toaster } from "sonner";
import { AuthGate } from "@/components/auth-tab/auth-hook";
import { profileParamsSchema } from "@/components/auth-tab/schema";
import Dashboard from "@/components/dashboard-tab";
import MainErrorBoundry from "@/components/error-boundry";

import Loading from "@/components/loading";
import { marketDepthParams } from "@/components/market-depth/schema";
import NepseIndex from "@/components/nepse-tab";
import RouteError from "@/components/route-error";
import RouteNotFound from "@/components/route-not-found";
import RoutePending from "@/components/route-pending";
import { Title } from "@/components/scrolling-title";
import { companyDetailsSearchSchema } from "@/components/stock-info/schema";
import GeneralSettings from "@/entrypoints/options/general";
import { OptionsLayoutRoute } from "@/entrypoints/options/layout";
import NepseSettings from "@/entrypoints/options/market";
import Header from "@/entrypoints/popup/header";
import SidepanelHome from "@/entrypoints/sidepanel/component/home/index";
import { NavigationBar } from "@/entrypoints/sidepanel/component/navigation-bar";
import { MAX_AGE } from "@/hooks/convex/constants";
import { page } from "@/lib/analytics";
import { AuthProvider } from "@/lib/auth/auth-context";
import { convex, queryClient } from "@/lib/query";
import { queryStoragePersister } from "@/lib/storage/query-store";
import {
	getOptionRoute,
	getPopupTabRoute,
	getSidepanelTabRoute,
} from "@/routes/getTabRoute";
import { generalState } from "@/state/general-state";
import { sidebarDashboardState } from "@/state/sidepanel-state";
import { Env } from "@/types/analytics-types";
import { topTradersSearchSchema } from "@/types/top-types";

const PinUI = lazy(() => import("@/components/pin-dialog/index"));

const InfoUI = lazy(() => import("@/components/banner/index"));

interface RouterContext {
	queryClient: QueryClient;
	convexClient: typeof ConvexProvider;
	convexQueryClient: ConvexQueryClient;
	environment: "popup" | "sidepanel" | "options";
	fullscreen?: boolean;
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
	component: () => {
		const context = useRouteContext({ strict: false });
		const { useStateItem } = useAppState();
		const [isPinned] = useStateItem("pin");
		const [isPinDismissed, setIsPinDismissed] = useState(false);

		const isPopup = context.environment === "popup";
		const isSidepanel = context.environment === "sidepanel";
		const shouldShowPinUI = !isPinned && !isPinDismissed;

		return (
			<main className="bg-background min-h-screen">
				<MainErrorBoundry>
					<Suspense fallback={<Loading />}>
						<ThemeProvider attribute="class" defaultTheme="dark">
							<ConvexProvider client={convex}>
								<PersistQueryClientProvider
									client={queryClient}
									persistOptions={{
										persister: queryStoragePersister,
										maxAge: MAX_AGE,
									}}
								>
									<AuthProvider>
										<TooltipProvider delayDuration={0}>
											{isPopup && <Header />}
											{isSidepanel ? (
												<div className="fixed inset-0 flex flex-col w-screen max-w-screen">
													<Title />
													<div className="flex-1 p-0.5 overflow-y-auto hide-scrollbar">
														<Outlet />
													</div>
													<NavigationBar />
												</div>
											) : (
												<Outlet />
											)}
											{shouldShowPinUI && (
												<Suspense fallback={<Loading />}>
													<UniversalErrorBoundry componentName="Pin Extension">
														<PinUI onDismiss={() => setIsPinDismissed(true)} />
													</UniversalErrorBoundry>
												</Suspense>
											)}
											<Suspense fallback={<Loading />}>
												<UniversalErrorBoundry componentName="Pin Extension">
													<InfoUI />
												</UniversalErrorBoundry>
											</Suspense>

											<AuthGate />
											<Toaster
												position="bottom-right"
												theme="dark"
												richColors
												duration={3000}
												visibleToasts={3}
											/>
										</TooltipProvider>
									</AuthProvider>
								</PersistQueryClientProvider>
							</ConvexProvider>
						</ThemeProvider>
					</Suspense>
				</MainErrorBoundry>
			</main>
		);
	},
	notFoundComponent: () => {
		const currentPath = window.location.pathname;
		return <RouteNotFound route={currentPath} />;
	},
	pendingComponent: () => <RoutePending />,
	errorComponent: ({ error, reset }) => (
		<RouteError error={error} reset={reset} />
	),
});

// Index Route
export const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	beforeLoad: ({ context }) => {
		const env = context.environment;

		if (env === "popup") {
			const activeTab = generalState.getState().activeTab;
			throw redirect(getPopupTabRoute(activeTab));
		}
		if (env === "options") {
			const activeTab = generalState.getState().activeTabsOptions;
			throw redirect(getOptionRoute(activeTab));
		}

		if (env === "sidepanel") {
			const activeTab = sidebarDashboardState.getState().currentTab;
			throw redirect(getSidepanelTabRoute(activeTab));
		}
	},
});

//Popup Routes
// export const popupRoute = createRoute({
// 	getParentRoute: () => rootRoute,
// 	onEnter: () => {
// 		await analytics.page("/popup");
// 	},
// 	path: "popup",
// 	component: () => {
// 		const router = useRouter();
// 		const { isAuthenticated, isLoading } = useAuth();

// 		if (!isLoading && !isAuthenticated) {
// 			return router.navigate({
// 				to: "/profile",
// 				search: { fromAuthFlow: true },
// 			});
// 		}

// 		return <Outlet />;
// 	},
// });

export const popupRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "popup",
	onEnter: () => {
		void page({
			context: Env.POPUP,
			path: "/popup",
			title: "Popup",
		});
	},

	component: NepseIndex,
});

export const dashboardRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "dashboard",
	onEnter: () => {
		void page({
			context: Env.UNIVERSAL,
			path: "/dashboard",
			title: "Dashboard",
		});
	},
	component: Dashboard,
});

// export const popupDynamicRoute = createRoute({
// 	getParentRoute: () => popupRoute,
// 	path: "$widgetId",
// 	beforeLoad: ({ params }) => {
// 		if (!(params.widgetId in COMPONENT_MAP)) {
// 			throw notFound({ data: params.widgetId });
// 		}
// 		return { widgetId: params.widgetId };
// 	},
// 	component: () => {
// 		const { widgetId } = popupDynamicRoute.useRouteContext();
// 		const Component = COMPONENT_MAP[widgetId as keyof typeof COMPONENT_MAP];

// 		return (
// 			<Suspense fallback={<Loading />}>
// 				<UniversalErrorBoundry componentName={widgetId}>
// 					<Component />
// 				</UniversalErrorBoundry>
// 			</Suspense>
// 		);
// 	},
// 	errorComponent: ({ error }) => {
// 		return <TabNotFound error={error} />;
// 	},
// 	onEnter: ({ params }) => {
// 		await analytics.page(`/${params.widgetId}`);
// 	},
// 	notFoundComponent: () => <TabNotFound />,
// });

// Common Routes

export const topTradersRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "toptraders",
	validateSearch: topTradersSearchSchema,
	onEnter: () => {
		void page({
			context: Env.UNIVERSAL,
			path: "/toptraders",
			title: "Top Traders",
		});
	},
	loader: async () => {
		await queryClient.ensureQueryData(convexQuery(api.dashboard.get, {}));
		return null;
	},
}).lazy(() =>
	import("@/components/top-traders/index.lazy").then((d) => d.Route),
);

export const accountRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "account",
	onEnter: () => {
		void page({
			context: Env.UNIVERSAL,
			path: "/account",
			title: "Account",
		});
	},
}).lazy(() =>
	import("@/components/account-tab/index.lazy").then((d) => d.Route),
);

export const profileRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "profile",
	validateSearch: profileParamsSchema,
	onEnter: () => {
		void page({
			context: Env.UNIVERSAL,
			path: "/profile",
			title: "Profile",
		});
	},
}).lazy(() => import("@/components/auth-tab/index.lazy").then((d) => d.Route));

export const marketIndices = createRoute({
	getParentRoute: () => rootRoute,
	path: "market-indices",
	onEnter: () => {
		void page({
			context: Env.UNIVERSAL,
			path: "/market-indices",
			title: "Market Indices",
		});
	},
	loader: async () => {
		await queryClient.ensureQueryData(convexQuery(api.IndexData.getAll, {}));
		return null;
	},
}).lazy(() => import("@/components/index-tab/index.lazy").then((d) => d.Route));

export const backupRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "backup",
	onEnter: () => {
		void page({
			context: Env.UNIVERSAL,
			path: "/backup",
			title: "Backup & Restore",
		});
	},
}).lazy(() => import("@/components/backup/index.lazy").then((d) => d.Route));

export const marketDepthRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "marketdepth",
	validateSearch: marketDepthParams,
	onEnter: () => {
		void page({
			context: Env.UNIVERSAL,
			path: "/market-depth",
			title: "Market Depth",
		});
	},
}).lazy(() =>
	import("@/components/market-depth/index.lazy").then((d) => d.Route),
);

export const sentimentRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "sentiment",
	onEnter: () => {
		void page({
			context: Env.UNIVERSAL,
			path: "/sentiment",
			title: "Sentiment",
		});
	},
	loader: async () => {
		await queryClient.ensureQueryData(
			convexQuery(api.nepsePredictions.get, {}),
		);
		return null;
	},
}).lazy(() =>
	import("@/components/sentiment-tab/index.lazy").then((d) => d.Route),
);

export const companyDetailsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "company-details",
	validateSearch: companyDetailsSearchSchema,
	onEnter: () => {
		void page({
			context: Env.UNIVERSAL,
			path: "/company-details",
			title: "Company Details",
		});
	},
}).lazy(() =>
	import("@/components/stock-info/index.lazy").then((d) => d.Route),
);

export const companyListRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "company-list",
	onEnter: () => {
		void page({
			context: Env.UNIVERSAL,
			path: "/company-list",
			title: "Company List",
		});
	},
	loader: async () => {
		await queryClient.ensureQueryData(
			convexQuery(api.company.getAllCompanies, {}),
		);
		return null;
	},
}).lazy(() => import("@/components/stock-tab/index.lazy").then((d) => d.Route));

export const ipoRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "ipo",
	onEnter: () => {
		void page({
			context: Env.UNIVERSAL,
			path: "/ipo",
			title: "IPO",
		});
	},
	loader: async () => {
		await Promise.all([
			queryClient.ensureQueryData(convexQuery(api.ipo.getIPOs, {})),
			queryClient.ensureQueryData(convexQuery(api.ipo.getCurrentIssues, {})),
		]);
		return null;
	},
}).lazy(() =>
	import("@/components/upcoming-ipo/index.lazy").then((d) => d.Route),
);

export const supplyDemandRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "supply-demand",
	onEnter: () => {
		void page({
			context: Env.UNIVERSAL,
			path: "/supply-demand",
			title: "Supply & Demand",
		});
	},
	loader: async () => {
		await queryClient.ensureQueryData(convexQuery(api.supplyDemand.get, {}));
		return null;
	},
}).lazy(() =>
	import("@/components/supply-demand-tab/index.lazy").then((d) => d.Route),
);

export const portfolioRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "portfolio",
	onEnter: () => {
		void page({
			context: Env.UNIVERSAL,
			path: "/portfolio",
			title: "Portfolio",
		});
	},
}).lazy(() => import("@/components/portfolio/index.lazy").then((d) => d.Route));

export const aiChatRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/ai-chat/{-$chatId}",
	onEnter: () => {
		void page({
			context: Env.UNIVERSAL,
			path: "/ai-chat/{-$chatId}",
			title: "AI Chat",
		});
	},
}).lazy(() => import("@/components/chat-tab/index.lazy").then((d) => d.Route));

export const notificationRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "notifications",
	onEnter: () => {
		void page({
			context: Env.UNIVERSAL,
			path: "/notifications",
			title: "Notifications",
		});
	},
	loader: async () => {
		await queryClient.ensureQueryData(
			convexQuery(api.notification.getGlobal, {}),
		);
		return null;
	},
}).lazy(() =>
	import("@/components/notification-tab/index.lazy").then((d) => d.Route),
);

export const disclosureRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "disclosures",
	onEnter: () => {
		void page({
			context: Env.UNIVERSAL,
			path: "/disclosures",
			title: "Disclosures",
		});
	},
	loader: async () => {
		await Promise.all([
			queryClient.ensureQueryData(convexQuery(api.companyNews.getAll, {})),
			queryClient.ensureQueryData(convexQuery(api.exchangeMessages.getAll, {})),
		]);
		return null;
	},
}).lazy(() =>
	import("@/components/disclosures/index.lazy").then((d) => d.Route),
);

export const keysRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "keys",
	onEnter: () => {
		void page({
			context: Env.UNIVERSAL,
			path: "/keys",
			title: "Keys",
		});
	},
}).lazy(() => import("@/components/keys/index.lazy").then((d) => d.Route));

export const highCapsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "high-caps",
	onEnter: () => {
		void page({
			context: Env.UNIVERSAL,
			path: "/high-caps",
			title: "High Caps",
		});
	},
	loader: async () => {
		await queryClient.ensureQueryData(
			convexQuery(api.companyNames.getHighCaps, {}),
		);
		return null;
	},
}).lazy(() => import("@/components/high-caps/index.lazy").then((d) => d.Route));

export const communityChatRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "community-chat",
	onEnter: () => {
		void page({
			context: Env.UNIVERSAL,
			path: "/community-chat",
			title: "Community Chat",
		});
	},
}).lazy(() => import("@/components/community/index.lazy").then((d) => d.Route));

//sidepanel Routes
export const sidepanelRoute = createRoute({
	getParentRoute: () => rootRoute,
	onEnter: () => {
		void page({
			context: Env.SIDEPANEL,
			path: "/sidepanel",
			title: "Sidepanel",
		});
	},
	path: "sidepanel",
	component: SidepanelHome,
});

// export const sidepanelDynamicRoute = createRoute({
// 	getParentRoute: () => sidepanelRoute,
// 	path: "$widgetId",
// 	beforeLoad: ({ params }) => {
// 		if (!(params.widgetId in COMPONENT_MAP)) {
// 			throw notFound({ data: params.widgetId });
// 		}
// 		return { widgetId: params.widgetId };
// 	},
// 	component: () => {
// 		const { widgetId } = popupDynamicRoute.useRouteContext();
// 		const Component = COMPONENT_MAP[widgetId as keyof typeof COMPONENT_MAP];

// 		return (
// 			<Suspense fallback={<Loading />}>
// 				<UniversalErrorBoundry componentName={widgetId}>
// 					<Component />
// 				</UniversalErrorBoundry>
// 			</Suspense>
// 		);
// 	},
// 	errorComponent: ({ error }) => {
// 		return <TabNotFound error={error} />;
// 	},
// 	onEnter: ({ params }) => {
// 		await analytics.page(`/${params.widgetId}`);
// 	},
// 	notFoundComponent: () => <TabNotFound />,
// });

//options Routes
export const optionsRoute = createRoute({
	getParentRoute: () => rootRoute,
	onEnter: () => {
		void page({
			context: Env.OPTIONS,
			path: "/options",
			title: "Options",
		});
	},
	path: "options",
	component: OptionsLayoutRoute,
});

export const optionsGeneralRoute = createRoute({
	getParentRoute: () => optionsRoute,
	path: "general",
	component: GeneralSettings,
	onEnter: () => {
		void page({
			context: Env.OPTIONS,
			path: "/options/general",
			title: "General Settings",
		});
	},
});

export const optionsMarketRoute = createRoute({
	getParentRoute: () => optionsRoute,
	path: "market",
	component: NepseSettings,
	onEnter: () => {
		void page({
			context: Env.OPTIONS,
			path: "/options/market",
			title: "Market Settings",
		});
	},
});
