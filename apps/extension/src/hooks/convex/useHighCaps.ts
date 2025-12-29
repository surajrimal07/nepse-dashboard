import { convexQuery } from "@convex-dev/react-query";
import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { useQuery } from "@tanstack/react-query";
import { gcTime } from "./constants";

export function useHighCaps() {
	return useQuery({
		...convexQuery(api.companyNames.getHighCaps, {}),
		gcTime,
	});
}
