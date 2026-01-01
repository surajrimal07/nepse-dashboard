import {
	ArrowDownCircle,
	ArrowUpCircle,
	BarChart3,
	Calendar,
	Activity,
	Percent,
	Target,
	Shield,
	Trophy,
	Skull,
	Star,
	Heart,
	Zap,
	Coins,
	LineChart,
	Clock,
	Users,
	Minus,
	Repeat,
	TrendingDown,
	TrendingUp,
	Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WidgetIconType } from "../type";

export function WidgetIcon({
	icon,
	valueType,
}: {
	icon: WidgetIconType;
	valueType: "profit" | "loss" | "neutral" | "info" | "warning";
}) {
	const iconClass = cn(
		"w-8 h-8 rounded-full flex items-center justify-center shrink-0",
		valueType === "profit" &&
			"bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-200",
		valueType === "loss" &&
			"bg-gradient-to-br from-red-500 to-red-600 shadow-red-200",
		valueType === "neutral" &&
			"bg-gradient-to-br from-slate-500 to-slate-600 shadow-slate-200",
		valueType === "info" &&
			"bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-200",
		valueType === "warning" &&
			"bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-200",
		"shadow-md",
	);

	const iconProps = { className: "w-4 h-4 text-white", strokeWidth: 2.5 };

	const iconMap: Record<WidgetIconType, React.ReactNode> = {
		overall: <Wallet {...iconProps} />,
		"trending-up": <TrendingUp {...iconProps} />,
		"trending-down": <TrendingDown {...iconProps} />,
		"arrow-up": <ArrowUpCircle {...iconProps} />,
		"arrow-down": <ArrowDownCircle {...iconProps} />,
		"today-total": <BarChart3 {...iconProps} />,
		"most-traded": <Repeat {...iconProps} />,
		calendar: <Calendar {...iconProps} />,
		activity: <Activity {...iconProps} />,
		percent: <Percent {...iconProps} />,
		target: <Target {...iconProps} />,
		shield: <Shield {...iconProps} />,
		trophy: <Trophy {...iconProps} />,
		skull: <Skull {...iconProps} />,
		star: <Star {...iconProps} />,
		heart: <Heart {...iconProps} />,
		zap: <Zap {...iconProps} />,
		coins: <Coins {...iconProps} />,
		chart: <LineChart {...iconProps} />,
		clock: <Clock {...iconProps} />,
		users: <Users {...iconProps} />,
	};

	return (
		<div className={iconClass}>
			{iconMap[icon] || <Minus {...iconProps} />}
		</div>
	);
}
