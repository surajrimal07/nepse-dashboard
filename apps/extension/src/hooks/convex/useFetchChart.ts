import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { useAction } from "convex/react";
import { useShallow } from "zustand/react/shallow";
import {
	selectActiveIndexInDashboard,
	selectIsDailyChart,
} from "@/selectors/dashboard-selector";
import {
	type DashboardState,
	useDashboardState,
} from "@/state/dashboard-state";

function selectors(s: DashboardState) {
	return {
		activeDashboard: selectActiveIndexInDashboard(s),
		isDailyChart: selectIsDailyChart(s),
	};
}

export function useFetchChart() {
	const { activeDashboard, isDailyChart } = useDashboardState(
		useShallow((s) => selectors(s)),
	);

	const fetchChart = useAction(api.indexChart.fetchChart);

	fetchChart({
		symbol: activeDashboard,
		timeframe: isDailyChart ? "1d" : "1m",
		type: "index",
	});

	return fetchChart;
}

export async function useFetchStockChart(
	symbol: string,
	isDailyChart: boolean,
) {
	const fetchChart = useAction(api.indexChart.fetchChart);

	await fetchChart({
		symbol: symbol,
		timeframe: isDailyChart ? "1d" : "1m",
		type: "stock",
	});

	return fetchChart;
}
