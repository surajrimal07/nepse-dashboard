import z from "@nepse-dashboard/zod";
import { formatTurnover } from "@/utils/time";

//Gainers Looser
const TopGainersLosersApiSchema = z.object({
	symbol: z.string().default("-"),
	securityName: z.string().default("-"),
	ltp: z.number(),
	pointChange: z.number(),
	percentageChange: z.number(),
});

// Define schema that transforms API response into the desired format
export const TopGainersLosersSchema = TopGainersLosersApiSchema.transform(
	(item) => ({
		symbol: item.symbol,
		name: item.securityName, // Rename securityName -> name
		ltp: item.ltp,
		pointchange: item.pointChange, // Rename pointChange -> pointchange
		percentchange: item.percentageChange, // Rename percentageChange -> percentchange
	}),
);

// export const gainerslooserResponseSchema = z.object({
// 	data: z.array(TopGainersLosersSchema),
// });

// export type TopGainersLosersResponseType = z.infer<
// 	typeof gainerslooserResponseSchema
// >;
export type TopGainersLosers = z.infer<typeof TopGainersLosersSchema>;
//end of gainers looser

//turnover
const TopTurnoversApiSchema = z.object({
	symbol: z.string().default("-"),
	securityName: z.string().default("-"),
	closingPrice: z.number(),
	turnover: z.number(),
});

export const TopTurnoverSchema = TopTurnoversApiSchema.transform((item) => ({
	symbol: item.symbol,
	name: item.securityName, // Rename securityName -> name
	ltp: item.closingPrice,
	turnover: formatTurnover(item.turnover), // Format turnover
}));

// export const turnoverResponseSchema = z.object({
// 	data: z.array(TopTurnoverSchema),
// });

// export type TopTurnoverResponseType = z.infer<typeof turnoverResponseSchema>;
export type TopTurnover = z.infer<typeof TopTurnoverSchema>;

//end of turnover

//top traded
const TopTradedApiSchema = z.object({
	symbol: z.string().default("-"),
	securityName: z.string().default("-"),
	closingPrice: z.number(),
	shareTraded: z.number(),
});

export const TopTradedSchema = TopTradedApiSchema.transform((item) => ({
	symbol: item.symbol,
	name: item.securityName, // Rename securityName -> name
	ltp: item.closingPrice,
	shareTraded: item.shareTraded,
}));

// export const tradedResponseSchema = z.object({
// 	data: z.array(TopTradedSchema),
// });

// export type TopTradedResponseType = z.infer<typeof tradedResponseSchema>;
export type TopTraded = z.infer<typeof TopTradedSchema>;

//end of TRADED

//top transactions
const TopTransactionApiSchema = z.object({
	symbol: z.string().default("-"),
	securityName: z.string().default("-"),
	lastTradedPrice: z.number(),
	totalTrades: z.number(),
});

export const TopTransactionSchema = TopTransactionApiSchema.transform(
	(item) => ({
		symbol: item.symbol,
		name: item.securityName, // Rename securityName -> name
		ltp: item.lastTradedPrice,
		transactions: item.totalTrades,
	}),
);

// export const transactionResponseSchema = z.object({
// 	data: z.array(TopTransactionSchema),
// });

// export type TopTransactionResponseType = z.infer<
// 	typeof transactionResponseSchema
// >;
export type TopTransaction = z.infer<typeof TopTransactionSchema>;

//end of transactions

//dashboard data (top gainers, top losers, top turnovers, top traded, top transactions)
export const TopDashboardSchema = z.object({
	gainers: z.array(TopGainersLosersSchema),
	losers: z.array(TopGainersLosersSchema),
	transactions: z.array(TopTransactionSchema),
	turnovers: z.array(TopTurnoverSchema),
	traded: z.array(TopTradedSchema),
	version: z.string(),
});

export type TopDashboard = z.infer<typeof TopDashboardSchema>;
