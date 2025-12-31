import { memo, useId } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { createTooltipRenderer } from "@/components/nepse-tab/tooltip";
import type { ChartDatas } from "@/components/nepse-tab/utils";
import { calculateChartBounds } from "@/components/nepse-tab/utils";

interface ChartProps {
	currentIndexColor: string | undefined;
	transformedChartData: ChartDatas[] | null;
}

const Chart = memo(
	({ currentIndexColor, transformedChartData }: ChartProps) => {
		const chartId = useId();

		if (!transformedChartData || !currentIndexColor) {
			return null; // Return null if no data, parent will handle loading/error states
		}

		const [minValue, maxValue, padding] =
			calculateChartBounds(transformedChartData);

		const renderTooltip = createTooltipRenderer(currentIndexColor);

		return (
			<ResponsiveContainer
				width="100%"
				height={170}
				style={{ outline: "none" }}
			>
				<AreaChart
					data={transformedChartData}
					margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
					style={{ outline: "none" }}
				>
					<YAxis
						domain={[minValue - padding, maxValue + padding]}
						hide={true}
					/>
					<Tooltip
						cursor={{ stroke: currentIndexColor, strokeWidth: 1 }}
						content={renderTooltip}
					/>
					<defs>
						<linearGradient id={chartId} x1="0" y1="0" x2="0" y2="1">
							<stop
								offset="0%"
								stopColor={currentIndexColor}
								stopOpacity={0.2}
							/>
							<stop
								offset="100%"
								stopColor={currentIndexColor}
								stopOpacity={0}
							/>
						</linearGradient>
					</defs>
					<Area
						dataKey="value"
						type="monotone"
						fill={`url(#${chartId})`}
						stroke={currentIndexColor}
						strokeWidth={1.6}
						isAnimationActive={false}
						animationDuration={500}
						animationEasing="ease-out"
					/>
				</AreaChart>
			</ResponsiveContainer>
		);
	},
);

Chart.displayName = "Chart";

export default Chart;
