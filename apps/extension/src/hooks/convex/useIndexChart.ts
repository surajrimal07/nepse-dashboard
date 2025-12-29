import { convexQuery } from "@convex-dev/react-query";
import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import {
	selectActiveIndexInDashboard,
	selectIsDailyChart,
} from "@/selectors/dashboard-selector";
import {
	type DashboardState,
	useDashboardState,
} from "@/state/dashboard-state";
import type { IndexKeys } from "@/types/indexes-type";
import { gcTime } from "./constants";

function selectors(s: DashboardState) {
	return {
		activeDashboard: selectActiveIndexInDashboard(s),
		isDailyChart: selectIsDailyChart(s),
	};
}

export function useIndexChart() {
	const { activeDashboard, isDailyChart } = useDashboardState(
		useShallow((s) => selectors(s)),
	);

	return useQuery({
		...convexQuery(api.indexChart.getChart, {
			index: activeDashboard,
			timeframe: isDailyChart ? "1d" : "1m",
		}),
		gcTime,
	});
}

export function useIndexChartSidepanel(
	index: IndexKeys,
	timeframe: "1m" | "1d",
) {
	return useQuery({
		...convexQuery(api.indexChart.getChart, {
			index,
			timeframe,
		}),
		gcTime,
	});
}
