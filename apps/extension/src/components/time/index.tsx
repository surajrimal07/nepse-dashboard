import { memo, useMemo } from "react";
import TimeAgo from "react-timeago";
import { useIsMarketOpen } from "@/hooks/convex/useIndexStatus";
import { useAppState } from "@/hooks/use-app";
import { cn } from "@/lib/utils";

// Nepal is UTC+5:45
const NEPAL_OFFSET_MS = 20700000; // 5h 45m in ms
const MARKET_OPEN_HOUR = 11;
const MARKET_CLOSE_HOUR = 15;

/** Get Nepal time */
const getNepalTime = () => new Date(Date.now() + NEPAL_OFFSET_MS + new Date().getTimezoneOffset() * 60000);

/** Get target time for countdown */
const getTargetTime = (hour: number) => {
	const nepal = getNepalTime();
	const target = new Date(nepal);
	target.setHours(hour, 0, 0, 0);
	return new Date(Date.now() + target.getTime() - nepal.getTime());
};

/** Compact countdown formatter */
const formatter = (v: number, u: string) => `${v}${{ second: "s", minute: "m", hour: "h", day: "d" }[u] || u[0]}`;

interface Props {
	className?: string;
}

/**
 * Compact time badge - uses useIsMarketOpen for accurate market status.
 * - currentTime: Always shows Nepal time
 * - countdown: Shows countdown to open/close based on market status
 */
export const TimeBadge = memo(function TimeBadge({ className }: Props) {
	const { useStateItem } = useAppState();
	const [config] = useStateItem("showTime");
	const isMarketOpen = useIsMarketOpen();

	const nepalHour = useMemo(() => getNepalTime().getHours(), []);

	// Not enabled - bail early
	if (!config?.enabled) return null;

	// Current time mode - always show
	if (config.type === "currentTime") {
		return <CurrentTime className={className} isOpen={isMarketOpen} />;
	}

	// Countdown mode
	if (config.type === "countdown") {
		// Market open - countdown to close
		if (isMarketOpen) {
			return (
				<Countdown
					target={getTargetTime(MARKET_CLOSE_HOUR)}
					isOpen={true}
					title="Closes in"
					className={className}
				/>
			);
		}

		// Pre-market (within 1 hour of open) - countdown to open
		if (nepalHour >= MARKET_OPEN_HOUR - 1 && nepalHour < MARKET_OPEN_HOUR) {
			return (
				<Countdown
					target={getTargetTime(MARKET_OPEN_HOUR)}
					isOpen={false}
					title="Opens in"
					className={className}
				/>
			);
		}

		// Outside market hours - hide
		return null;
	}

	return null;
});

/** Current Nepal time display */
const CurrentTime = memo(function CurrentTime({
	className,
	isOpen,
}: { className?: string; isOpen?: boolean }) {
	const time = useMemo(
		() =>
			getNepalTime().toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			}),
		[]
	);

	return (
		<span
			className={cn(
				"inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium",
				isOpen
					? "bg-emerald-500/90 text-white"
					: "bg-secondary text-secondary-foreground",
				className
			)}
			title={`Nepal Time: ${time}`}
		>
			{time}
		</span>
	);
});

/** Countdown display */
const Countdown = memo(function Countdown({
	target,
	isOpen,
	title,
	className,
}: {
	target: Date;
	isOpen: boolean;
	title: string;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium",
				isOpen
					? "bg-emerald-500/90 text-white"
					: "bg-amber-500/90 text-white",
				className
			)}
			title={title}
		>
			<TimeAgo date={target} live formatter={formatter} />
		</span>
	);
});

export default TimeBadge;
