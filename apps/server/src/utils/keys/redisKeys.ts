export function getKeyName(...args: string[]) {
	return `${args.join(":")}`;
}

export const notificationKey = (id: string) => getKeyName("notifications", id);

//NEPSE Keys
export const isOpenKey = () => getKeyName("nepse", "isOpen");
export const lastBusinessDayKey = () => getKeyName("nepse", "lastBusinessDay");
export const allIndexVersionKey = () => getKeyName("nepse", "allIndexVersion"); //holds others index except nepse index
export const allIndexDataKey = () => getKeyName("nepse", "allIndexData"); //holds others index except nepse index
// export const nepseOpenedAtKey = () => getKeyName("nepse", "openedAt");
export const advanceDeclineKey = () => getKeyName("nepse", "advanceDecline");
export const nepseIndexVersionKey = () =>
	getKeyName("nepse", "nepseIndexVersion"); //holds only nepse index
export const nepseIndexDataKey = () => getKeyName("nepse", "nepseIndexData"); //holds only nepse index
export const completeIndexDataKey = () =>
	getKeyName("nepse", "completeIndexData"); //holds others + nepse index
export const nepseIndexIntradayChartKey = (symbol: string) =>
	getKeyName("nepse", "chart", "intraday", symbol);
export const nepseIndexDailyChartKey = (symbol: string) =>
	getKeyName("nepse", "chart", "daily", symbol);
export const nepseIndexIntradaySpamKey = (symbol: string) =>
	getKeyName("nepse", "chart", "intraday", "spam", symbol);
export const nepseIndexDailySpamKey = (symbol: string) =>
	getKeyName("nepse", "chart", "daily", "spam", symbol);
export const nepseIndexDashboardKey = () => getKeyName("nepse", "dashboard");
export const nepseSentimentKey = () => getKeyName("nepse", "sentiment");

//Stock Keys
export const listedCompaniesKey = () => getKeyName("nepse", "listedCompanies");
export const listedCompaniesDataKey = () =>
	getKeyName("nepse", "listedCompaniesData");
export const stockIntradayChartKey = (symbol: string) =>
	getKeyName("stock", "chart", "intraday", symbol);
export const stockDailyChartKey = (symbol: string) =>
	getKeyName("stock", "chart", "daily", symbol);
export const stockMarketDepthKey = (symbol: string) =>
	getKeyName("stock", "marketDepth", symbol);
export const stockDetailsKey = (symbol: string) =>
	getKeyName("stock", "details", symbol);
export const stockDetailsSpamKey = (symbol: string) =>
	getKeyName("stock", "details", "spam", symbol);
export const stockIntradaySpamKey = (symbol: string) =>
	getKeyName("stock", "chart", "intraday", "spam", symbol);
export const stockDailySpamKey = (symbol: string) =>
	getKeyName("stock", "chart", "daily", "spam", symbol);
export const stockOHLCKey = (symbol: string, timeframe: string) =>
	getKeyName("stock", "ohlc", timeframe, symbol);
export const supplyDemandKey = () => getKeyName("stock", "supplyDemand");

//Rate Limit Keys
export const wsRateLimitMinKey = (user_id: string) =>
	getKeyName("rateLimit", "ws", "min", user_id);

export const wsRateLimitDayKey = (user_id: string) =>
	getKeyName("rateLimit", "ws", "day", user_id);

export const apiRateLimitMinKey = (user_id: string) =>
	getKeyName("rateLimit", "api", "min", user_id);

export const apiRateLimitDayKey = (user_id: string) =>
	getKeyName("rateLimit", "api", "day", user_id);

export const newsRateLimitDayKey = (user_id: string) =>
	getKeyName("rateLimit", "news", "day", user_id);

export const chatRateLimitDayKey = (user_id: string) =>
	getKeyName("rateLimit", "chat", "day", user_id);

//World Market Keys
export const worldMarketKey = () => getKeyName("world", "market");

//Chat Keys
export const chatQuestionsKey = () => getKeyName("chat", "questions");

//Order Keys
export const orderKey = (orderId: string) => getKeyName("order", orderId);
export const orderFeedKey = () => getKeyName("orders", "feed");

//Keys for completions
export const completionKey = (completionId: string) =>
	`completion:${completionId}`;
export const completionsByOrderKey = (orderId: string) =>
	`order:${orderId}:completions`; // A list of completion IDs for an order
export const userCompletionsKey = (userId: string) =>
	`user:${userId}:completions`; // A list of completion IDs initiated by a user (optional, for "my requests")

// News Keys
export const newsSummaryKey = (summaryId: string) =>
	getKeyName("news", "summary", summaryId);

export const newsFeedbackKey = (summaryId: string, userUid: string) =>
	getKeyName("news", "feedback", summaryId, userUid);

// client ws data
export const clientWsDataKey = (userId: string) =>
	getKeyName("ws", "sessions", userId);
