import { connect } from "crann-fork";
import { useCallback, useEffect, useState } from "#imports";
import { appState } from "@/lib/service/app-service";
import { cn } from "@/lib/utils";

export default function MarketSignal() {
	const [isLive, setIsLive] = useState<boolean | null>(null);
	const connection = connect(appState);

	const checkMarketStatus = useCallback(async () => {
		try {
			const isOpen = await connection.callAction("isMarketOpen");
			setIsLive(isOpen ?? false);
		} catch {
			setIsLive(false);
		}
	}, [connection]);

	useEffect(() => {
		checkMarketStatus();
		const interval = setInterval(checkMarketStatus, 60000);
		return () => clearInterval(interval);
	}, [checkMarketStatus]);

	if (isLive === null) {
		return (
			<div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
				<span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
				Checking...
			</div>
		);
	}

	return (
		<div
			className={cn(
				"inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
				isLive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700",
			)}
			title={isLive ? "Market is Live" : "Market is Closed"}
		>
			<span
				className={cn(
					"w-2 h-2 rounded-full",
					isLive ? "bg-emerald-500 animate-pulse" : "bg-red-500",
				)}
			/>
			{isLive ? "Live" : "Closed"}
		</div>
	);
}
