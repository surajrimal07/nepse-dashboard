import type {
	GainerLoserData,
	TopTabType,
	TradedData,
	TransactionData,
	TurnoverData,
} from "@/types/top-types";
import { TopTab } from "@/types/top-types";
import {
	MemoizedArrowRightLeft,
	MemoizedArrowTrendingDown,
	MemoizedArrowTrendingUp,
	MemoizedBarChart3,
	MemoizedLineChart,
} from "./shared-icons";

interface TabConfigItem {
	value: TopTabType;
	icon: React.ComponentType;
	data: (GainerLoserData | TransactionData | TurnoverData | TradedData)[];
}

export function createTabConfig(
	data: {
		gainers?: GainerLoserData[];
		losers?: GainerLoserData[];
		transactions?: TransactionData[];
		turnovers?: TurnoverData[];
		traded?: TradedData[];
	} | null,
): TabConfigItem[] {
	return [
		{
			value: TopTab.GAINERS,
			icon: MemoizedArrowTrendingUp,
			data: data?.gainers || [],
		},
		{
			value: TopTab.LOSERS,
			icon: MemoizedArrowTrendingDown,
			data: data?.losers || [],
		},
		{
			value: TopTab.TRANSACTIONS,
			icon: MemoizedArrowRightLeft,
			data: data?.transactions || [],
		},
		{
			value: TopTab.TURNOVERS,
			icon: MemoizedBarChart3,
			data: data?.turnovers || [],
		},
		{
			value: TopTab.TRADED,
			icon: MemoizedLineChart,
			data: data?.traded || [],
		},
	];
}
