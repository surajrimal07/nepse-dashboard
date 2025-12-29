import { convexQuery } from "@convex-dev/react-query";
import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { useQuery } from "@tanstack/react-query";
import { selectSelectedIndexInDashboards } from "@/selectors/dashboard-selector";
import { useDashboardState } from "@/state/dashboard-state";
import { gcTime } from "./constants";

export function useIndexNames() {
	const otherDashboard = useDashboardState(selectSelectedIndexInDashboards);

	return useQuery({
		...convexQuery(api.indexNames.searchIndexes, {
			search: undefined,
			exclude: otherDashboard,
		}),
		gcTime,
	});
}
