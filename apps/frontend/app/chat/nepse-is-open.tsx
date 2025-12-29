import type React from "react";

interface MarketStatusData {
	state: string;
	isOpen: boolean;
	asOf: string;
}

interface NepseStatusCardProps {
	statusData: MarketStatusData;
}

interface MarketStatusStyle {
	bg: string;
	text: string;
	icon: string;
}

export const NepseStatusCard: React.FC<NepseStatusCardProps> = ({
	statusData,
}) => {
	const STYLES: Record<string, MarketStatusStyle> = {
		Open: {
			bg: "bg-emerald-600",
			text: "text-emerald-50",
			icon: "📈",
		},
		Close: {
			bg: "bg-red-600",
			text: "text-red-50",
			icon: "📉",
		},
		"Pre Open": {
			bg: "bg-amber-600",
			text: "text-amber-50",
			icon: "⏰",
		},
		"Pre Close": {
			bg: "bg-orange-600",
			text: "text-orange-50",
			icon: "🔔",
		},
	};

	const marketStyle =
		STYLES[statusData.state] ??
		(statusData.isOpen
			? STYLES["Open"]
			: { bg: "bg-slate-600", text: "text-slate-50", icon: "❓" });

	const formatTime = (dateStr: string) =>
		new Date(dateStr).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});

	return (
		<div
			className={`w-full rounded-lg px-4 py-3 flex items-center justify-between ${marketStyle.bg} ${marketStyle.text}`}
		>
			<div className="flex items-center gap-3">
				<span className="text-2xl">{marketStyle.icon}</span>
				<div className="flex flex-col leading-tight">
					<span className="font-semibold text-lg">NEPSE</span>
					<span className="text-sm opacity-80">{statusData.state}</span>
				</div>
			</div>

			<div className="text-right">
				<span className="text-xs opacity-80">As of</span>
				<div className="text-sm font-medium">{formatTime(statusData.asOf)}</div>
			</div>
		</div>
	);
};
