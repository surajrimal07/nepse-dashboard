import type { ChartDataPoint } from "@/components/nepse-tab/tooltip";
import type { AdvanceDecline } from "@/types/indexes-type";
import { PLAYBACK_SPEEDS, type PlaybackSpeed } from "@/types/replay-types";

interface AdvanceDeclineWidths {
	advanceWidth: number;
	neutralWidth: number;
	declineWidth: number;
}

export function calculateAdvanceDeclineWidths(
	data: AdvanceDecline | null | undefined,
): AdvanceDeclineWidths {
	if (!data) {
		return { advanceWidth: 0, neutralWidth: 0, declineWidth: 0 };
	}

	const total = data.advance + data.decline + data.neutral;

	if (total === 0) {
		return { advanceWidth: 0, neutralWidth: 0, declineWidth: 0 };
	}

	return {
		advanceWidth: (data.advance / total) * 100,
		neutralWidth: (data.neutral / total) * 100,
		declineWidth: (data.decline / total) * 100,
	};
}

export interface ChartDatas {
	time: string;
	value: number;
	change: number;
}

export function formatTime(timestamp: number, isDaily?: boolean) {
	const dateTimestamp = timestamp * 1000;

	if (isDaily) {
		return new Date(dateTimestamp).toLocaleDateString("en-US", {
			timeZone: "Asia/Kathmandu",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
	}

	return new Date(dateTimestamp).toLocaleString("en-US", {
		timeZone: "Asia/Kathmandu",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
}

export function calculateChartBounds(
	chartData: ChartDataPoint[],
): [number, number, number] {
	if (chartData.length === 0) {
		return [0, 0, 0];
	}

	const values = chartData.map((point) => point.value);
	const min = Math.min(...values);
	const max = Math.max(...values);

	const pad = (max - min) * 0.1;

	return [min, max, pad];
}

// Stable reference for chart configuration outside React
export const createChartConfig = (color: string) => ({
	value: {
		label: "Index Chart",
		color,
	},
});

// Generate stable chart ID outside React
export const generateChartId = Math.random().toString(36).substring(2, 5);

// Transform raw chart data to chart format
export const transformChartData = (
	currentIndexChart?: number[][],
	previousClose?: number,
	isDaily?: boolean,
): ChartDatas[] => {
	if (!currentIndexChart || previousClose === undefined) {
		return [];
	}
	return currentIndexChart.map(([time, value]) => ({
		time: formatTime(time, isDaily),
		value,
		change: value - previousClose,
	}));
};

export function getNextPlaybackSpeed(current: PlaybackSpeed): PlaybackSpeed {
	const i = PLAYBACK_SPEEDS.indexOf(current);
	return PLAYBACK_SPEEDS[(i + 1) % PLAYBACK_SPEEDS.length];
}
