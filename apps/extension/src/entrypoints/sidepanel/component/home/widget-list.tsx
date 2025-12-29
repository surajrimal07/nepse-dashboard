import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import type { Company } from "@/types/company-types";
import { allIndexes } from "@/types/indexes-type";
import type { TopTabType } from "@/types/top-types";
import { TopType } from "@/types/top-types";

export const chartWidgets = allIndexes.map((index) => ({
	title: `${index.replace(/\sInd\.|Index/g, "")} Index`,
	type: "chart" as const,
	index,
	isDaily: false,
}));

// MarketIndices
export const topWidgets = TopType.map((index) => ({
	title: `Top ${index}`,
	type: "top" as const,
	topvalue: index as TopTabType,
}));

export const marketIndices = {
	title: "Market Overview",
	type: "marketindexes" as const,
};

export function marketDepth() {
	return {
		id: `${Math.floor(Math.random() * 1000)}-depth`,
		title: "Market Depth",
		type: "depth" as const,
	};
}

export function highestOrders() {
	return {
		title: "Highest Orders",
		type: "orders" as const,
	};
}

export function marketSummary() {
	return {
		title: "NEPSE Summary",
		type: "summary" as const,
	};
}

export function generateStockWidgets(companiesData: Doc<"company">[] | null) {
	if (!companiesData) return [];

	return companiesData.map((company: Company) => ({
		title: `${company.symbol} - ${company.securityName}`,
		type: "stock" as const,
		symbol: company.symbol,
		isDaily: false,
	}));
}
