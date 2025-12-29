import { convexQuery } from "@convex-dev/react-query";
import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { useQuery } from "@tanstack/react-query";
import { gcTime } from "./constants";

export function useCompanyList() {
	return useQuery({
		...convexQuery(api.company.getAllCompanies, {}),
		gcTime,
	});
}

export function useGetCompany(symbol: string) {
	return useQuery({
		...convexQuery(api.company.getSingleCompany, { symbol }),
		gcTime,
	});
}
