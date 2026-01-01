import { cn } from "@/lib/utils";
import type { WidgetConfig } from "../type";
import { WidgetIcon } from "./icon";

type ColorType = "profit" | "loss" | "neutral" | "info" | "warning";

function getColorType(value: number): ColorType {
	if (value > 0) return "profit";
	if (value < 0) return "loss";
	return "neutral";
}

export default function WidgetCard({ config }: { config: WidgetConfig }) {
	const baseValueType = getColorType(config.valueTotal);
	const baseLabelType = getColorType(config.labelTotal);

	// Use colorOverride if specified, otherwise use computed value
	const valueType: ColorType = config.colorOverride || baseValueType;
	const labelValueType: ColorType = config.colorOverride || baseLabelType;

	const bgClasses: Record<ColorType, string> = {
		profit: "bg-linear-to-r from-emerald-50 to-green-50 border-l-[3px] border-emerald-500",
		loss: "bg-linear-to-r from-red-50 to-rose-50 border-l-[3px] border-red-500",
		neutral: "bg-linear-to-r from-slate-50 to-gray-50 border-l-[3px] border-slate-400",
		info: "bg-linear-to-r from-blue-50 to-indigo-50 border-l-[3px] border-blue-500",
		warning: "bg-linear-to-r from-amber-50 to-orange-50 border-l-[3px] border-amber-500",
	};

	const valueClasses: Record<ColorType, string> = {
		profit: "text-emerald-700",
		loss: "text-red-700",
		neutral: "text-slate-700",
		info: "text-blue-700",
		warning: "text-amber-700",
	};

	const subClasses: Record<ColorType, string> = {
		profit: "text-emerald-600",
		loss: "text-red-600",
		neutral: "text-slate-600",
		info: "text-blue-600",
		warning: "text-amber-600",
	};

	const labelSubClasses: Record<ColorType, string> = {
		profit: "text-emerald-600",
		loss: "text-red-600",
		neutral: "text-gray-500",
		info: "text-blue-600",
		warning: "text-amber-600",
	};

	return (
		<div
			className={cn(
				"flex items-center justify-between p-3 rounded-lg shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5",
				bgClasses[valueType],
			)}
		>
			<div className="flex flex-col gap-0.5">
				<div className="flex items-baseline gap-1">
					<span
						className={cn(
							"text-lg font-bold leading-tight",
							valueClasses[valueType],
						)}
					>
						{config.value}
					</span>
					<span
						className={cn(
							"text-xs font-semibold",
							subClasses[valueType],
						)}
					>
						({config.valueSub})
					</span>
				</div>
				<div className="flex items-center gap-1">
					<span className="text-sm font-medium text-gray-600">
						{config.label}
					</span>
					<span
						className={cn(
							"text-xs font-semibold",
							labelSubClasses[labelValueType],
						)}
					>
						({config.labelSub})
					</span>
				</div>
			</div>
			<WidgetIcon icon={config.icon} valueType={valueType} />
		</div>
	);
}
