// import { TooltipProvider } from "@nepse-dashboard/ui/components/tooltip";
// import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
// import { Outlet } from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
// import { ConvexProvider } from "convex/react";
// import { ThemeProvider } from "next-themes";
// import { Suspense } from "react";
// import { Toaster } from "sonner";
// import MainErrorBoundry from "@/components/error-boundry";
// import Loading from "@/components/loading";
// import { convex, queryClient } from "@/lib/query";
// import { queryStoragePersister } from "@/lib/storage/query-store";

// const MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 30 days

// export const Layout = () => {
// 	return (
// 		<MainErrorBoundry>
// 			<Suspense fallback={<Loading />}>
// 				<ThemeProvider attribute="class" defaultTheme="dark">
// 					<ConvexProvider client={convex}>
// 						<PersistQueryClientProvider
// 							client={queryClient}
// 							persistOptions={{
// 								persister: queryStoragePersister,
// 								maxAge: MAX_AGE,
// 							}}
// 						>
// 							<TooltipProvider delayDuration={0}>
// 								<main>
// 									<Outlet />
// 								</main>
// 								<Toaster
// 									position="bottom-right"
// 									theme="dark"
// 									richColors
// 									duration={3000}
// 									visibleToasts={3}
// 								/>
// 							</TooltipProvider>
// 						</PersistQueryClientProvider>
// 					</ConvexProvider>
// 				</ThemeProvider>
// 			</Suspense>
// 		</MainErrorBoundry>
// 	);
// };
