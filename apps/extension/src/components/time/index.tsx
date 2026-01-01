import { Clock, Timer } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useIsMarketOpen } from "@/hooks/convex/useIndexStatus";
import { useAppState } from "@/hooks/use-app";
import { cn } from "@/lib/utils";

// Constants
const NEPAL_OFFSET_MS = 20700000; // 5h 45m in ms
const MARKET_OPEN_HOUR = 11;
const MARKET_CLOSE_HOUR = 15;
const UPDATE_INTERVAL_MS = 60000;

// Pre-cached formatter for performance (avoid creating on each call)
const timeFormatter = new Intl.DateTimeFormat("en-US", {
	hour: "numeric",
	minute: "2-digit",
	hour12: true,
});

// Static class strings (avoid recalculation)
const BASE_CLASSES =
	"inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium";
const OPEN_CLASSES = `${BASE_CLASSES} bg-emerald-500/90 text-white`;
const CLOSED_CLASSES = `${BASE_CLASSES} bg-secondary text-secondary-foreground`;
const OPENING_CLASSES = `${BASE_CLASSES} bg-amber-500/90 text-white`;
const ICON_CLASSES = "h-2.5 w-2.5 opacity-80";

/** Get Nepal time - inlined offset calculation */
const getNepalTime = (): Date =>
	new Date(
		Date.now() + NEPAL_OFFSET_MS + new Date().getTimezoneOffset() * 60000,
	);

/** Get ms until next minute boundary for efficient syncing */
const getMsToNextMinute = (): number => {
	const now = Date.now();
	return UPDATE_INTERVAL_MS - (now % UPDATE_INTERVAL_MS);
};

/** Format minutes to compact duration - optimized with early returns */
const formatDuration = (mins: number): string => {
	if (mins <= 0) return "0m";
	if (mins < 60) return `${mins}m`;
	const h = (mins / 60) | 0; // Bitwise floor for speed
	return `${h}h ${mins - h * 60}m`;
};

/** Custom hook for countdown - syncs to minute boundary */
const useCountdown = (targetHour: number): number => {
	const [minutesLeft, setMinutesLeft] = useState(() => {
		const nepal = getNepalTime();
		return Math.max(
			0,
			targetHour * 60 - (nepal.getHours() * 60 + nepal.getMinutes()),
		);
	});

	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

	useEffect(() => {
		const update = () => {
			const nepal = getNepalTime();
			setMinutesLeft(
				Math.max(
					0,
					targetHour * 60 - (nepal.getHours() * 60 + nepal.getMinutes()),
				),
			);
		};

		// Sync to next minute boundary, then update every minute
		timeoutRef.current = setTimeout(() => {
			update();
			intervalRef.current = setInterval(update, UPDATE_INTERVAL_MS);
		}, getMsToNextMinute());

		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [targetHour]);

	return minutesLeft;
};

/** Custom hook for Nepal time - syncs to minute boundary */
const useNepalTime = (): string => {
	const [time, setTime] = useState(() => timeFormatter.format(getNepalTime()));

	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

	useEffect(() => {
		const update = () => setTime(timeFormatter.format(getNepalTime()));

		// Sync to next minute boundary, then update every minute
		timeoutRef.current = setTimeout(() => {
			update();
			intervalRef.current = setInterval(update, UPDATE_INTERVAL_MS);
		}, getMsToNextMinute());

		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, []);

	return time;
};

interface Props {
	className?: string;
}

export const TimeBadge = memo(function TimeBadge({ className }: Props) {
	const { useStateItem } = useAppState();
	const [config] = useStateItem("showTime");
	const isMarketOpen = useIsMarketOpen();

	if (!config?.enabled) return null;

	const nepalHour = getNepalTime().getHours();

	if (config.type === "currentTime") {
		return <CurrentTime className={className} isOpen={isMarketOpen} />;
	}

	if (config.type === "countdown") {
		if (isMarketOpen) {
			return (
				<CountdownBadge
					targetHour={MARKET_CLOSE_HOUR}
					variant="closing"
					className={className}
				/>
			);
		}
		if (nepalHour >= MARKET_OPEN_HOUR - 2 && nepalHour < MARKET_OPEN_HOUR) {
			return (
				<CountdownBadge
					targetHour={MARKET_OPEN_HOUR}
					variant="opening"
					className={className}
				/>
			);
		}
		return <ClosedBadge className={className} />;
	}

	return null;
});

const CurrentTime = memo(function CurrentTime({
	className,
	isOpen,
}: {
	className?: string;
	isOpen?: boolean;
}) {
	const time = useNepalTime();
	const classes = useMemo(
		() => cn(isOpen ? OPEN_CLASSES : CLOSED_CLASSES, className),
		[isOpen, className],
	);

	return (
		<span className={classes} title={`Nepal: ${time}`}>
			<Clock className={ICON_CLASSES} />
			{time}
		</span>
	);
});

const CountdownBadge = memo(function CountdownBadge({
	targetHour,
	variant,
	className,
}: {
	targetHour: number;
	variant: "opening" | "closing";
	className?: string;
}) {
	const minutesLeft = useCountdown(targetHour);
	const isOpening = variant === "opening";

	const classes = useMemo(
		() => cn(isOpening ? OPENING_CLASSES : OPEN_CLASSES, className),
		[isOpening, className],
	);

	const title = isOpening ? "Opens in" : "Closes in";
	const text = isOpening
		? `Opens ${formatDuration(minutesLeft)}`
		: `${formatDuration(minutesLeft)} left`;

	return (
		<span className={classes} title={title}>
			<Timer className={ICON_CLASSES} />
			{text}
		</span>
	);
});

const ClosedBadge = memo(function ClosedBadge({
	className,
}: {
	className?: string;
}) {
	const classes = useMemo(() => cn(CLOSED_CLASSES, className), [className]);

	return (
		<span className={classes} title="Closed">
			<Clock className={ICON_CLASSES} />
			Closed
		</span>
	);
});

export default TimeBadge;
