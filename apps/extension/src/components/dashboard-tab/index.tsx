import { useRouteContext, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { DashboardContent } from "@/components/dashboard-tab/dashboard-content";
import { dashboardItems } from "@/components/dashboard-tab/menu-items";
import { UniversalErrorBoundry } from "@/components/universal-error-boundary";
import { CONFIG } from "@/constants/app-config";
import { useAppState } from "@/hooks/use-app";
import {
	selectPopupPinnedTab,
	selectUpdatePopupPinnedTab,
} from "@/selectors/general-selector";
import {
	selectPinnedTab,
	selectUpdatePinnedTab,
} from "@/selectors/sidepanel-selectors";
import { useGeneralState } from "@/state/general-state";
import { useSidebarDashboardState } from "@/state/sidepanel-state";

export default function Dashboard() {
	const router = useRouter();
	const routeContext = useRouteContext({ strict: false });
	const isSidepanel = routeContext.environment === "sidepanel";

	const { callAction } = useAppState();

	const { updateSidepanelPinnedTab, sidepanelPinnedTab } =
		useSidebarDashboardState(
			useShallow((state) => ({
				updateSidepanelPinnedTab: selectUpdatePinnedTab(state),
				sidepanelPinnedTab: selectPinnedTab(state),
			})),
		);

	const { updatePopupPinnedTab, popupPinnedTab } = useGeneralState(
		useShallow((state) => ({
			updatePopupPinnedTab: selectUpdatePopupPinnedTab(state),
			popupPinnedTab: selectPopupPinnedTab(state),
		})),
	);

	const itemsPerPage = isSidepanel
		? CONFIG.dashboard_items_sidepanel
		: CONFIG.dashboard_items;

	const needsPagination = dashboardItems.length > itemsPerPage;

	const [currentPage, setCurrentPage] = useState(needsPagination ? 1 : 0);

	const totalPages = needsPagination
		? Math.ceil(dashboardItems.length / itemsPerPage)
		: 1;

	function handlePrevPage() {
		if (!needsPagination) return;
		setCurrentPage((prev) => Math.max(prev - 1, 1));
	}

	function handleNextPage() {
		if (!needsPagination) return;
		setCurrentPage((prev) => Math.min(prev + 1, totalPages));
	}

	const paginationData = (() => {
		if (!needsPagination) {
			return { visibleItems: dashboardItems, startIndex: 0 };
		}

		const startIndex = (currentPage - 1) * itemsPerPage;
		const visibleItems = dashboardItems.slice(
			startIndex,
			startIndex + itemsPerPage,
		);
		return { visibleItems, startIndex };
	})();

	async function handleTelegram() {
		const result = await callAction("handleJoinTelegram");

		if (result.success) {
			window.close();
			return;
		}
		toast.error(result.message);
	}

	function handleViewChange(alias: string) {
		if (alias === "telegram") {
			handleTelegram();
			return;
		}

		const item = dashboardItems.find((item) => item.alias === alias);
		if (!item?.route) return;

		router.navigate({
			to: item.route,
			...(item.params && { search: item.params }),
		});
	}

	function handlePinToggle(alias: string) {
		if (isSidepanel) {
			const isCurrentlyPinned = sidepanelPinnedTab === alias;
			updateSidepanelPinnedTab(isCurrentlyPinned ? null : alias);
		} else {
			const isCurrentlyPinned = popupPinnedTab === alias;
			updatePopupPinnedTab(isCurrentlyPinned ? null : alias);
		}
	}

	return (
		<UniversalErrorBoundry componentName="Dashboard">
			<DashboardContent
				visibleItems={paginationData.visibleItems}
				handleViewChange={handleViewChange}
				currentPage={needsPagination ? currentPage : 1}
				totalPages={totalPages}
				handlePrevPage={handlePrevPage}
				handleNextPage={handleNextPage}
				pinnedTab={isSidepanel ? sidepanelPinnedTab : popupPinnedTab}
				handlePinToggle={handlePinToggle}
				needsPagination={needsPagination}
				isSidepanel={isSidepanel}
			/>
		</UniversalErrorBoundry>
	);
}
