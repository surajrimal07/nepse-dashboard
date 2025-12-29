import type { IndexData } from "@/controllers/other-index-data/types.js";
import { redis } from "@/redis-client.js";
import { allIndexDataKey } from "@/utils/keys/redisKeys.js";
import type { IndexKey } from "../types/indexes.js";

/**
 * Generates a formatted summary for a specific market index
 * @param indexName The name of the index to summarize
 * @param format The format of the message ('markdown' or 'html')
 * @returns A formatted index summary message
 */
export async function generateIndexSummary(
	indexName: IndexKey,
	format: "markdown" | "html" = "markdown",
): Promise<string> {
	const allIndexData = (await redis.json.get(allIndexDataKey())) as
		| IndexData[]
		| null;

	if (!allIndexData) {
		return "Unable to fetch market data at this time.";
	}

	const indexData = allIndexData.find((item) => item.index === indexName);

	if (!indexData) {
		return "An error occurred while fetching Index data.";
	}

	if (format === "markdown") {
		return `
📊 *${indexName} Summary*

🔹 Current: ${indexData.close} (${indexData.percentageChange >= 0 ? "▲" : "▼"} ${Math.abs(indexData.change).toFixed(2)} | ${indexData.percentageChange.toFixed(2)}%)
🔹 Open: ${indexData.open}
🔹 High: ${indexData.high}
🔹 Low: ${indexData.low}
🔹 Previous Close: ${indexData.previousClose}
🔹 Turnover: ${indexData.turnover}
🔹 Traded Shares: ${indexData.totalTradedShared}
🔹 Adv/Dec/Neutral: ${indexData.adLine.advance}/${indexData.adLine.decline}/${indexData.adLine.neutral}

Last Updated: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })}
`;
	}
	return `<b>${indexName} Summary</b>

Current: ${indexData.close} (${indexData.percentageChange >= 0 ? "↑" : "↓"} ${Math.abs(indexData.change).toFixed(2)}, ${indexData.percentageChange.toFixed(2)}%)
Open: ${indexData.open}
High: ${indexData.high}
Low: ${indexData.low}
Previous Close: ${indexData.previousClose}
Turnover: ${indexData.turnover}
Traded Shares: ${indexData.totalTradedShared}
Adv/Dec/Neutral: ${indexData.adLine.advance}/${indexData.adLine.decline}/${indexData.adLine.neutral}

Last Updated: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })}`;
}

/**
 * Generates a formatted summary for all market indices
 * @param format The format of the message ('markdown' or 'html')
 * @returns A formatted summary of all indices
 */
export async function generateAllIndicesSummary(
	format: "markdown" | "html" = "markdown",
): Promise<string> {
	const allIndexData = (await redis.json.get(allIndexDataKey())) as
		| IndexData[]
		| null;

	if (!allIndexData) {
		return "Unable to fetch market data at this time.";
	}

	const indicesList = Object.entries(allIndexData)
		.map(([name, data]) => {
			const changeSymbol =
				data.percentageChange >= 0
					? format === "markdown"
						? "▲"
						: "↑"
					: format === "markdown"
						? "▼"
						: "↓";

			return format === "markdown"
				? `*${name}*: ${data.close} (${changeSymbol} ${Math.abs(data.change).toFixed(2)} | ${data.percentageChange.toFixed(2)}%)`
				: `<b>${name}</b>: ${data.close} (${changeSymbol} ${Math.abs(data.change).toFixed(2)}, ${data.percentageChange.toFixed(2)}%)`;
		})
		.join("\n");

	if (format === "markdown") {
		return `
📊 *NEPSE Sub-Indices Summary*

${indicesList}

Last Updated: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })}
`;
	}
	return `<b>NEPSE Indices Summary</b>

${indicesList}

Last Updated: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })}`;
}
