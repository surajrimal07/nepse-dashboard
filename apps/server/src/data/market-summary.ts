import { isNepseOpen } from "@/controllers/event-listners";
import type { TopDashboard } from "@/controllers/nepse-dashboard/types";
import type { IndexData } from "@/controllers/other-index-data/types";
import { redis } from "@/redis-client";
import {
	allIndexDataKey,
	nepseIndexDashboardKey,
} from "@/utils/keys/redisKeys";

export async function generateMarketSummary(): Promise<string> {
	const indexData = (await redis.json.get(allIndexDataKey())) as
		| IndexData[]
		| null;

	const dashboardData = (await redis.json.get(
		nepseIndexDashboardKey(),
	)) as TopDashboard | null;

	if (!(indexData && dashboardData)) {
		return "Unable to fetch market data at this time.";
	}

	const nepseIndexData = indexData.find((item) => item.index === "NEPSE Index");

	if (!nepseIndexData) {
		return "An error occurred while fetching NEPSE Index data.";
	}

	return `
NEPSE: ${nepseIndexData.close} (${
		nepseIndexData.percentageChange >= 0 ? "+" : "-"
	} ${Math.abs(nepseIndexData.change).toFixed(2)}, ${nepseIndexData.percentageChange.toFixed(2)}%)
Turnover: ${nepseIndexData.turnover}
Traded Shares: ${nepseIndexData.totalTradedShared}
Adv/Dec/Neutral: ${nepseIndexData.adLine.advance}/${nepseIndexData.adLine.decline}/${
		nepseIndexData.adLine.neutral
	}

Top Gainer: ${dashboardData.gainers[0].symbol} (${dashboardData.gainers[0].percentchange.toFixed(2)}%)
Top Loser: ${dashboardData.losers[0].symbol} (${dashboardData.losers[0].percentchange.toFixed(2)}%)
Highest Turnover: ${dashboardData.turnovers[0].symbol} (${dashboardData.turnovers[0].turnover})
Highest Traded: ${dashboardData.traded[0].symbol} (${dashboardData.traded[0].shareTraded})

Market ${isNepseOpen ? "is currently open" : "has closed"} for the day.`;
}
