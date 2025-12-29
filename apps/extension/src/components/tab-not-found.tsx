import { Button } from "@nepse-dashboard/ui/components/button";
import { Card } from "@nepse-dashboard/ui/components/card";
import { AlertCircle, Plus } from "lucide-react";
import { memo } from "react";
import { selectSetCurrentTab } from "@/selectors/sidepanel-selectors";
import { useSidebarDashboardState } from "@/state/sidepanel-state";
import { SidepanelTabs } from "@/types/sidepanel-type";

export const TabNotFound = memo(({ error }: { error?: Error }) => {
	const setCurrentTab = useSidebarDashboardState(selectSetCurrentTab);

	const handleGoToDashboard = () => {
		setCurrentTab(SidepanelTabs.DASHBOARD);
	};

	const handleGoToHome = () => {
		setCurrentTab(SidepanelTabs.HOME);
	};

	return (
		<div className="flex items-center justify-center min-h-[400px] p-4">
			<Card className="max-w-md w-full p-6 text-center">
				<div className="flex flex-col items-center space-y-4">
					<div className="p-3 bg-muted rounded-full">
						<AlertCircle className="h-8 w-8 text-muted-foreground" />
					</div>

					<div className="space-y-2">
						<h3 className="font-semibold text-lg">Tab Not Found</h3>
						<p className="text-sm text-muted-foreground">
							{error?.message || "The requested widget could not be found."}
						</p>
					</div>

					<div className="space-y-2 w-full">
						<Button
							onClick={handleGoToDashboard}
							className="w-full"
							variant="default"
						>
							<Plus className="mr-2 h-4 w-4" />
							Go to Dashboard
						</Button>

						<Button
							onClick={handleGoToHome}
							className="w-full"
							variant="outline"
						>
							Go to Home
						</Button>
					</div>

					<p className="text-xs text-muted-foreground">
						Try pinning another widget from the Dashboard tab
					</p>
				</div>
			</Card>
		</div>
	);
});

TabNotFound.displayName = "TabNotFound";
