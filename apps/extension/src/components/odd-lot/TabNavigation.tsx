// import {
// 	Tabs,
// 	TabsList,
// 	TabsTrigger,
// } from "@nepse-dashboard/ui/components/tabs";
// import { memo, useCallback } from "react";
// import type { TabsType } from "@/types/odd-types";
// import { tabsTypeValues } from "@/types/odd-types";
// import { TAB_TRIGGER_STYLES } from "@/utils/tab-style";

// interface TabNavigationProps {
// 	activeTab: TabsType;
// 	onTabChange: (tab: TabsType) => void;
// }

// export const TabNavigation = memo(
// 	({ activeTab, onTabChange }: TabNavigationProps) => {
// 		const handleTabChange = useCallback(
// 			(value: string) => {
// 				onTabChange(value as TabsType);
// 			},
// 			[onTabChange],
// 		);

// 		return (
// 			<Tabs
// 				value={activeTab}
// 				onValueChange={handleTabChange}
// 				className="w-full"
// 			>
// 				<TabsList className="grid w-full grid-cols-2 gap-1  p-1">
// 					<TabsTrigger
// 						value={tabsTypeValues.ALL}
// 						className={TAB_TRIGGER_STYLES}
// 					>
// 						All Orders
// 					</TabsTrigger>
// 					<TabsTrigger value={tabsTypeValues.MY} className={TAB_TRIGGER_STYLES}>
// 						My Orders
// 					</TabsTrigger>
// 				</TabsList>
// 			</Tabs>
// 		);
// 	},
// );
