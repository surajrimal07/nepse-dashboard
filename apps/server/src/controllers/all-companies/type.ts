import z from "@nepse-dashboard/zod";
import { CalculateVersion } from "@/utils/version";
import {
	getSecurityInternalSector,
	getSecurityName,
	getSecuritySector,
} from "../../utils/stock-mapper";

export const CompanyListApiSchema = z.array(
	z.object({
		id: z.number().optional(),
		date: z.string(),
		symbol: z.string(),
		open: z.number(),
		high: z.number(),
		low: z.number(),
		close: z.number(),
		amount: z.number(),
		curr_amount: z.number(),
		curr_volume: z.number(),
		prev_close: z.number(),
		point_change: z.number(),
		percentage_change: z.number(),
		volume: z.number(),
		volatile_percentage: z.number(),
	}),
);

export const CompanyListDataSchema = CompanyListApiSchema.min(
	1,
	"Company list must contain at least one item",
).transform((data) =>
	data.map((item) => ({
		time: item.date,
		symbol: item.symbol,
		openPrice: item.open,
		highPrice: item.high,
		lowPrice: item.low,
		closePrice: item.close,
		turnover: item.amount,
		previousClose: item.prev_close,
		change: Number(item.point_change.toFixed(2)),
		percentageChange: Number(item.percentage_change.toFixed(2)),
		totalTradedShared: item.volume,
		securityName: getSecurityName(item.symbol),
		sectorName: getSecuritySector(item.symbol),
		internalSector: getSecurityInternalSector(item.symbol),
		color: item.percentage_change >= 0 ? "#00ff00" : "#ef4444",
		version: CalculateVersion(item),
	})),
);

export type CompanyListData = z.infer<typeof CompanyListDataSchema>;

export const SingleStockItemSchema = z.object({
	time: z.string(),
	symbol: z.string(),
	open: z.string(),
	high: z.string(),
	low: z.string(),
	close: z.string(),
	turnover: z.string(),
	previousClose: z.string(),
	change: z.number(),
	percentageChange: z.number(),
	totalTradedShared: z.number(),
	securityName: z.string(),
	sectorName: z.string(),
	internalSector: z.string(),
	color: z.string(),
});

//schema used in intraday stock data
export const SingleStockDataSchema = z.object({
	symbol: z.string(),
	version: z.number(),
	data: SingleStockItemSchema,
});
export type SingleStockData = z.infer<typeof SingleStockDataSchema>;

export type SingleStockItem = z.infer<typeof SingleStockItemSchema>;
