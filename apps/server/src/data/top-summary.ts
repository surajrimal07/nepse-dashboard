import type {
	TopDashboard,
	TopGainersLosers,
	TopTraded,
	TopTransaction,
	TopTurnover,
} from "@/controllers/nepse-dashboard/types";
import { redis } from "@/redis-client";
import { nepseIndexDashboardKey } from "@/utils/keys/redisKeys";

type TopCategory =
	| "gainers"
	| "losers"
	| "turnovers"
	| "traded"
	| "transactions";

/**
 * Generates a formatted summary for top market performers in a specific category
 * @param category The category of top performers to summarize
 * @param format The format of the message ('markdown' or 'html')
 * @param limit The number of items to include (default: 5)
 * @returns A formatted top performers summary message
 */
export async function generateTopSummary(
	category: TopCategory,
	format: "markdown" | "html" = "markdown",
	limit = 5,
): Promise<string> {
	const dashboardData = (await redis.json.get(
		nepseIndexDashboardKey(),
	)) as TopDashboard | null;

	if (!dashboardData) {
		return "Unable to fetch market data at this time.";
	}

	// Get the appropriate data based on category
	const data = dashboardData[category];
	if (!data) {
		return `No data available for top ${category}.`;
	}

	// Limit the number of items
	const items = data.slice(0, limit);

	// Generate the title based on category
	const titles = {
		gainers: "Top Gainers",
		losers: "Top Losers",
		turnovers: "Top Turnover",
		traded: "Most Traded",
		transactions: "Most Transactions",
	};

	const title = titles[category] || `Top ${category}`;

	// Format the final message
	if (format === "markdown") {
		return formatMarkdownMessage(category, title, items);
	}
	return formatHtmlMessage(category, title, items);
}

/**
 * Formats the message in markdown
 */
function formatMarkdownMessage(
	category: TopCategory,
	title: string,
	// biome-ignore lint/suspicious/noExplicitAny: <ss>
	items: any[],
): string {
	let itemsList = "";

	switch (category) {
		case "gainers":
		case "losers": {
			const gainersLosers = items as TopGainersLosers[];
			const sign = category === "gainers" ? "▲" : "▼";
			itemsList = gainersLosers
				.map(
					(item, index) =>
						`${index + 1}. *${item.symbol}*: ${item.ltp} (${sign} ${Math.abs(item.pointchange).toFixed(2)} | ${Math.abs(item.percentchange).toFixed(2)}%)`,
				)
				.join("\n");
			break;
		}

		case "turnovers": {
			const turnovers = items as TopTurnover[];
			itemsList = turnovers
				.map(
					(item, index) =>
						`${index + 1}. *${item.symbol}*: Rs. ${item.turnover} `,
				)
				.join("\n");
			break;
		}

		case "traded": {
			const traded = items as TopTraded[];
			itemsList = traded
				.map(
					(item, index) =>
						`${index + 1}. *${item.symbol}*: ${item.shareTraded} shares)`,
				)
				.join("\n");
			break;
		}

		case "transactions": {
			const transactions = items as TopTransaction[];
			itemsList = transactions
				.map(
					(item, index) =>
						`${index + 1}. *${item.symbol}*: ${item.transactions} transactions`,
				)
				.join("\n");
			break;
		}
		default: {
			break;
		}
	}

	return `
📊 *${title}*

${itemsList}

Last Updated: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })}
`;
}

/**
 * Formats the message in HTML
 */
function formatHtmlMessage(
	category: TopCategory,
	title: string,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	items: any[],
): string {
	let itemsList = "";

	switch (category) {
		case "gainers":
		case "losers": {
			const gainersLosers = items as TopGainersLosers[];
			itemsList = gainersLosers
				.map(
					(item, index) =>
						`${index + 1}. <b>${item.symbol}</b>: ${item.ltp} (${Math.abs(item.pointchange).toFixed(2)}, ${Math.abs(item.percentchange).toFixed(2)}%)`,
				)
				.join("\n");
			break;
		}

		case "turnovers": {
			const turnovers = items as TopTurnover[];
			itemsList = turnovers
				.map(
					(item, index) =>
						`${index + 1}. <b>${item.symbol}</b>: Rs. ${item.turnover})`,
				)
				.join("\n");
			break;
		}

		case "traded": {
			const traded = items as TopTraded[];
			itemsList = traded
				.map(
					(item, index) =>
						`${index + 1}. <b>${item.symbol}</b>: ${item.shareTraded} shares`,
				)
				.join("\n");
			break;
		}

		case "transactions": {
			const transactions = items as TopTransaction[];
			itemsList = transactions
				.map(
					(item, index) =>
						`${index + 1}. <b>${item.symbol}</b>: ${item.transactions} transactions`,
				)
				.join("\n");
			break;
		}
		default: {
			break;
		}
	}

	return `<b>${title}</b>

${itemsList}

Last Updated: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })}`;
}

/**
 * Generates a formatted summary for all top market performers categories
 * @param format The format of the message ('markdown' or 'html')
 * @param limit The number of items to include per category (default: 3)
 * @returns A formatted summary of all top performers categories
 */
export async function generateAllTopsSummary(
	format: "markdown" | "html" = "markdown",
	limit = 3,
): Promise<string> {
	const dashboardData = (await redis.json.get(
		nepseIndexDashboardKey(),
	)) as TopDashboard | null;

	if (!dashboardData) {
		return "Unable to fetch market data at this time.";
	}

	const categories: TopCategory[] = [
		"gainers",
		"losers",
		"turnovers",
		"traded",
		"transactions",
	];
	const sections: string[] = [];

	for (const category of categories) {
		const data = dashboardData[category];
		if (!data) {
			continue;
		}

		const items = data.slice(0, limit);
		const titles = {
			gainers: "Top Gainers",
			losers: "Top Losers",
			turnovers: "Top Turnover",
			traded: "Most Traded",
			transactions: "Most Transactions",
		};

		const title = titles[category] || `Top ${category}`;
		let itemsList = "";

		switch (category) {
			case "gainers":
			case "losers": {
				const gainersLosers = items as TopGainersLosers[];

				itemsList = gainersLosers
					.map((item, index) => {
						return format === "markdown"
							? `${index + 1}. *${item.symbol}*: ${item.ltp} (${Math.abs(item.percentchange).toFixed(2)}%)`
							: `${index + 1}. <b>${item.symbol}</b>: ${item.ltp} ( ${Math.abs(item.percentchange).toFixed(2)}%)`;
					})
					.join("\n");
				break;
			}

			case "turnovers": {
				const turnovers = items as TopTurnover[];
				itemsList = turnovers
					.map((item, index) => {
						return format === "markdown"
							? `${index + 1}. *${item.symbol}*: Rs. ${item.turnover}`
							: `${index + 1}. <b>${item.symbol}</b>: Rs. ${item.turnover}`;
					})
					.join("\n");
				break;
			}

			case "traded": {
				const traded = items as TopTraded[];
				itemsList = traded
					.map((item, index) => {
						return format === "markdown"
							? `${index + 1}. *${item.symbol}*: ${item.shareTraded} shares`
							: `${index + 1}. <b>${item.symbol}</b>: ${item.shareTraded} shares`;
					})
					.join("\n");
				break;
			}

			case "transactions": {
				const transactions = items as TopTransaction[];
				itemsList = transactions
					.map((item, index) => {
						return format === "markdown"
							? `${index + 1}. *${item.symbol}*: ${item.transactions} trades`
							: `${index + 1}. <b>${item.symbol}</b>: ${item.transactions} trades`;
					})
					.join("\n");
				break;
			}
			default: {
				break;
			}
		}

		const sectionTitle =
			format === "markdown" ? `*${title}*` : `<b>${title}</b>`;
		sections.push(`${sectionTitle}\n${itemsList}`);
	}

	if (format === "markdown") {
		// Format the final message
		return `
📊 *NEPSE Top Performers*

${sections.join("\n\n")}

Last Updated: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })}
`;
	}
	return `<b>NEPSE Top Performers</b>

${sections.join("\n\n")}

Last Updated: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })}`;
}
