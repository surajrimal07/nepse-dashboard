import { useRouter } from "@tanstack/react-router";
import { useEffect } from "#imports";
import { onMessage } from "@/lib/messaging/extension-messaging";
import { selectSetCurrentTab } from "@/selectors/sidepanel-selectors";
import { useSidebarDashboardState } from "@/state/sidepanel-state";

export function useMessageNavigation() {
	const router = useRouter();
	const setCurrentTab = useSidebarDashboardState(selectSetCurrentTab);

	useEffect(() => {
		// const unsubAI = onMessage("goToAIPage", ({ data }) => {
		// 	setCurrentTab("dashboard");
		// 	router.navigate({ to: data ? `/ai-chat/${data}` : "/ai-chat" });
		// });

		// const unsubAccount = onMessage("goToAccountPage", () => {
		// 	setCurrentTab("dashboard");
		// 	router.navigate({ to: "/account" });
		// });

		const unsubRoute = onMessage("goToRoute", ({ data }) => {
			const { route, routeData } = data;
			const path = route;

			setCurrentTab("dashboard");
			router.navigate({ to: path, search: routeData });
		});

		return () => {
			unsubRoute();
		};
	}, [router, setCurrentTab]);
}
