import { memo } from "react";
import { MenuItem } from "@/components/dashboard-tab/menu-item";
import { NavigationButtons } from "@/components/dashboard-tab/navigation-button";
import type { dashboardItems } from "./menu-items";

export const DashboardContent = memo(
	({
		visibleItems,
		handleViewChange,
		currentPage,
		totalPages,
		handlePrevPage,
		handleNextPage,
		pinnedTab,
		handlePinToggle,
		needsPagination,
		isSidepanel,
	}: {
		visibleItems: typeof dashboardItems;
		handleViewChange: (alias: string) => void;
		currentPage: number;
		totalPages: number;
		handlePrevPage: () => void;
		handleNextPage: () => void;
		pinnedTab: string | null;
		handlePinToggle: (alias: string) => void;
		needsPagination: boolean;
		isSidepanel: boolean;
	}) => (
		<div className="w-full flex flex-col">
			<div
				className={`flex-1 p-4 ${isSidepanel && needsPagination ? "pb-20" : ""}`}
			>
				<div className="grid grid-cols-2 gap-4">
					{visibleItems.map((item) => (
						<MenuItem
							key={item.alias}
							item={item}
							onClick={handleViewChange}
							pinnedTab={pinnedTab}
							onPinToggle={handlePinToggle}
						/>
					))}
				</div>
			</div>
			{needsPagination && totalPages > 1 && (
				<NavigationButtons
					currentPage={currentPage}
					totalPages={totalPages}
					onPrev={handlePrevPage}
					onNext={handleNextPage}
					isSidepanel={isSidepanel}
				/>
			)}
		</div>
	),
);
DashboardContent.displayName = "DashboardContent";
