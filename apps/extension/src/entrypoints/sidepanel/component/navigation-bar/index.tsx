import { Button } from "@nepse-dashboard/ui/components/button";
import { useRouter } from "@tanstack/react-router";
import { Home, LayoutDashboard } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { dashboardItems } from "@/components/dashboard-tab/menu-items";
import { MarketIndicator } from "@/components/nepse-tab/state-pulsating";
import { useIndexStatus } from "@/hooks/convex/useIndexStatus";
import { cn } from "@/lib/utils";
import { getSidepanelTabRoute } from "@/routes/getTabRoute";
import {
	selectCurrentTab,
	selectPinnedTab,
	selectSetCurrentTab,
} from "@/selectors/sidepanel-selectors";
import { useSidebarDashboardState } from "@/state/sidepanel-state";
import { SidepanelTabs } from "@/types/sidepanel-type";
import { useMessageNavigation } from "./go-to-route";

export const NavigationBar = memo(() => {
	const router = useRouter();
	const { data } = useIndexStatus();

	const { pinnedTab, setCurrentTab, currentTab } = useSidebarDashboardState(
		useShallow((state) => ({
			pinnedTab: selectPinnedTab(state),
			setCurrentTab: selectSetCurrentTab(state),
			currentTab: selectCurrentTab(state),
		})),
	);

	useMessageNavigation();

	const secondTab = useMemo(
		() =>
			dashboardItems.find((item) => item.alias === pinnedTab) ||
			dashboardItems[0],
		[pinnedTab],
	);

	const tabs = useMemo(
		() => [
			{
				name: SidepanelTabs.HOME,
				alias: "home",
				icon: Home,
				description: "Home tab with market overview",
			},
			secondTab,
			{
				name: SidepanelTabs.DASHBOARD,
				alias: "dashboard",
				icon: LayoutDashboard,
				description: "Overview of all widgets",
			},
		],
		[secondTab],
	);

	const handleTabChange = useCallback(
		(value: string) => {
			setCurrentTab(value);
			router.navigate(getSidepanelTabRoute(value));
		},
		[router, setCurrentTab],
	);

	return (
		<nav className="w-full border-t bg-card z-20" aria-label="Main navigation">
			<div className="flex justify-around p-1 gap-0.5">
				{tabs.map((tab) => (
					<Button
						key={tab.alias}
						variant="ghost"
						className={cn(
							"flex-1 flex flex-col items-center gap-1 h-auto py-1 transition-colors duration-150",
							currentTab === tab.alias && "bg-muted",
						)}
						onClick={() => handleTabChange(tab.alias)}
						aria-label={`Switch to ${tab.name} tab`}
						aria-pressed={currentTab === tab.alias}
					>
						<div className="flex items-center justify-center h-5">
							<tab.icon className="h-4 w-4" />
						</div>
						<span className="text-xs flex items-center gap-1">
							{tab.name}
							{tab.alias === "home" && data && <MarketIndicator />}
						</span>
					</Button>
				))}
			</div>
		</nav>
	);
});

NavigationBar.displayName = "NavigationBar";
