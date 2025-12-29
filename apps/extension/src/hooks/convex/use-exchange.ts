import { convexQuery } from "@convex-dev/react-query";
import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { useQuery } from "@tanstack/react-query";
import { gcTime } from "./constants";

export function getCompanyNews() {
	return useQuery({
		...convexQuery(api.companyNews.getAll, {}),
		gcTime,
	});
}

export function gtExchangeMessages() {
	return useQuery({
		...convexQuery(api.exchangeMessages.getAll, {}),
		gcTime,
	});
}
