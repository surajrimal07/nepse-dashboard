import { convexQuery } from "@convex-dev/react-query";
import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { useQuery } from "@tanstack/react-query";
import { selectActiveIndexInDashboard } from "@/selectors/dashboard-selector";
import { useDashboardState } from "@/state/dashboard-state";
import type { IndexKeys } from "@/types/indexes-type";
import { gcTime } from "./constants";

export function useIndexData() {
	const activeDashboard = useDashboardState(selectActiveIndexInDashboard);

	return useQuery({
		...convexQuery(api.IndexData.get, { index: activeDashboard }),
		gcTime,
	});
}

export function useThisIndexData(index: IndexKeys) {
	return useQuery({
		...convexQuery(api.IndexData.get, { index }),
		gcTime,
	});
}

export function useIndexesData() {
	return useQuery({
		...convexQuery(api.IndexData.getAll, {}),
		gcTime,
	});
}

export function useNepseIndexData() {
	return useQuery({
		...convexQuery(api.IndexData.getNepseIndexData, {}),
		gcTime,
	});
}
