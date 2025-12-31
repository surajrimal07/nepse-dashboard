import { dashboardItems } from "@/components/dashboard-tab/menu-items";
import { TabStateEnum } from "@/types/general-types";

export function getOptionRoute(value: string) {
	switch (value) {
		case "general":
			return { to: "/options/general" };
		case "nepse":
			return { to: "/options/nepse" };
		default:
			return { to: "/options/general" };
	}
}

export function getPopupTabRoute(value: string) {
	switch (value) {
		case TabStateEnum.HOME:
			return { to: "/popup" };
		case TabStateEnum.DASHBOARD:
			return { to: "/dashboard" };
		default: {
			// Check if this item has a dedicated route (common routes)
			const item = dashboardItems.find((item) => item.alias === value);
			if (item?.route) {
				return {
					to: item.route,
					...(item.params && { search: item.params }),
				};
			}
			// Fallback to dynamic widget route
			return { to: "/" }; // means somethign is wrong
		}
	}
}

export function getSidepanelTabRoute(value: string) {
	switch (value) {
		case "home":
			return { to: "/sidepanel" };
		case "dashboard":
			return { to: "/dashboard" };
		default: {
			// Check if this item has a dedicated route (common routes)
			const item = dashboardItems.find((item) => item.alias === value);
			if (item?.route) {
				return {
					to: item.route,
					...(item.params && { search: item.params }),
				};
			}
			// Fallback to dynamic widget route
			return { to: "/" }; // means something is wrong
		}
	}
}
