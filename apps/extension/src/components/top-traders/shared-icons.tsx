import {
	ArrowRightLeft,
	ArrowDownIcon as ArrowTrendingDown,
	ArrowUpIcon as ArrowTrendingUp,
	BarChart3,
	LineChart,
} from "lucide-react";
import { memo } from "react";

export const MemoizedArrowTrendingUp = memo(() => (
	<ArrowTrendingUp className="h-4 w-4" />
));

MemoizedArrowTrendingUp.displayName = "MemoizedArrowTrendingUp";

export const MemoizedArrowTrendingDown = memo(() => (
	<ArrowTrendingDown className="h-4 w-4" />
));

MemoizedArrowTrendingDown.displayName = "MemoizedArrowTrendingDown";

export const MemoizedArrowRightLeft = memo(() => (
	<ArrowRightLeft className="h-4 w-4" />
));

MemoizedArrowRightLeft.displayName = "MemoizedArrowRightLeft";

export const MemoizedBarChart3 = memo(() => <BarChart3 className="h-4 w-4" />);

MemoizedBarChart3.displayName = "MemoizedBarChart3";

export const MemoizedLineChart = memo(() => <LineChart className="h-4 w-4" />);

MemoizedLineChart.displayName = "MemoizedLineChart";
