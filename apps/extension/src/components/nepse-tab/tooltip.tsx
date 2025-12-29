import type { FC } from "react";
import type { TooltipProps } from "recharts";

export interface ChartDataPoint {
	time: string;
	value: number;
	change: number;
}

interface ChartTooltipProps {
	active?: boolean;
	payload?: Array<{ payload: ChartDataPoint }>;
	borderColor?: string;
}

export const tooltipStyle = {
	backgroundColor: "#000000",
	padding: "8px",
	borderRadius: "5px",
	color: "#fff",
	textAlign: "center" as const,
	border: "1px solid #4caf50",
	boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",
};
export const ChartTooltip: FC<ChartTooltipProps> = ({
	active,
	payload,
	borderColor = "#4caf50",
}) => {
	if (!active || !payload || !payload.length) {
		return null;
	}

	const data = payload?.[0]?.payload as ChartDataPoint;
	const isPositive = data.change >= 0;
	const changeColor = isPositive ? "#4caf50" : "#f44336";

	const tooltipStyleWithBorder = {
		...tooltipStyle,
		border: `1px solid ${borderColor}`,
	};

	return (
		<div style={tooltipStyleWithBorder}>
			<div
				style={{
					fontSize: "14px",
					fontWeight: "bold",
					marginBottom: "3px",
				}}
			>
				{data.value.toFixed(2)}
			</div>

			<div
				style={{
					fontSize: "11px",
					marginBottom: "3px",
				}}
			>
				{data.time}
			</div>

			<div
				style={{
					fontSize: "12px",
					color: changeColor,
					fontWeight: "bold",
				}}
			>
				{isPositive ? "+" : ""}
				{data.change.toFixed(2)}
			</div>
		</div>
	);
};

// Simplified helper function that only allows setting the border color
export function createTooltipRenderer(borderColor: string) {
	return (props: TooltipProps<number, string>) => (
		<ChartTooltip {...props} borderColor={borderColor} />
	);
}
export default ChartTooltip;
