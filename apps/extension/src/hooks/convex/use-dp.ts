import { convexQuery } from "@convex-dev/react-query";
import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { useQuery } from "@tanstack/react-query";
import { gcTime } from "./constants";

export function getDp() {
	return useQuery({
		...convexQuery(api.brokers.getDP, {}),
		gcTime,
	});
}

export function getDPById(id: number) {
	return useQuery({
		...convexQuery(api.brokers.getDPById, {
			id,
		}),
		gcTime,
	});
}
