import {
	Tabs,
	TabsList,
	TabsTrigger,
} from "@nepse-dashboard/ui/components/tabs";
import type { FC } from "react";

interface TabNavigationProps {
	activeTab: "current" | "all";
	onTabChange: (tab: "current" | "all") => void;
	currentBrokerCount: number;
	allTmsCount: number;
	showTabs: boolean;
}

export const TabNavigation: FC<TabNavigationProps> = ({
	activeTab,
	onTabChange,
	currentBrokerCount,
	allTmsCount,
	showTabs,
}) => {
	if (!showTabs) return null;

	return (
		<div className="mb-1">
			<Tabs
				value={activeTab}
				onValueChange={onTabChange as (value: string) => void}
			>
				<TabsList className="grid w-full grid-cols-2 h-7 p-0.5 bg-gray-50 border border-gray-200">
					<TabsTrigger
						value="current"
						className="text-xs font-semibold h-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600"
					>
						Current ({currentBrokerCount})
					</TabsTrigger>
					<TabsTrigger
						value="all"
						className="text-xs font-semibold h-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600"
					>
						All ({allTmsCount})
					</TabsTrigger>
				</TabsList>
			</Tabs>
		</div>
	);
};
