import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@nepse-dashboard/ui/components/tooltip";
import { AlertTriangle, Info } from "lucide-react";
import { memo, useMemo } from "react";
import TimeAgo from "react-timeago";
import { connectionStateConfig } from "@/components/nepse-tab/connection-state-icons";
import { useIndexData } from "@/hooks/convex/useIndexData";

interface BottomInfoProps {
	isSidpenal: boolean;
}

const BottomInfo = memo(({ isSidpenal }: BottomInfoProps) => {
	const { useStateItem } = useAppState();
	const [connectionStatus] = useStateItem("userLatency");

	const { data, isPending } = useIndexData();

	const lastUpdatedTime = useMemo(() => {
		return data?.time ?? Date.now();
	}, [data?.time]);

	const Icon = useMemo(
		() => connectionStateConfig[connectionStatus.isConnected].icon,
		[connectionStatus.isConnected],
	);

	const infoTooltipContent = useMemo(() => {
		if (isPending) {
			return <Skeleton className="h-3 w-24 bg-zinc-700/50" />;
		}
		return (
			<div>
				Last updated: <TimeAgo date={lastUpdatedTime} />
			</div>
		);
	}, [isPending, lastUpdatedTime]);

	const warningTooltipContent = useMemo(
		() => (
			<div className="flex flex-col gap-1">
				<p>Author does not guarantee the timeliness of the data.</p>
				<p>Please note daily charts are adjusted for dividends.</p>
			</div>
		),
		[],
	);

	const connectionTooltipContent = useMemo(() => {
		const hasConnection = connectionStatus.isConnected !== "no_connection";
		return (
			<>
				<p className="text-xs">Connection: {connectionStatus.message}</p>
				{hasConnection && (
					<p className="text-xs">Latency: {connectionStatus.latency} ms</p>
				)}
			</>
		);
	}, [
		connectionStatus.message,
		connectionStatus.latency,
		connectionStatus.isConnected,
	]);

	return (
		<div className="flex items-center justify-center gap-2 mt-1">
			{!isSidpenal && (
				<Tooltip>
					<TooltipTrigger>
						<Info className="h-3 w-3" />
					</TooltipTrigger>
					<TooltipContent side="bottom" className="text-xs">
						{infoTooltipContent}
					</TooltipContent>
				</Tooltip>
			)}
			<Tooltip>
				<TooltipTrigger>
					<AlertTriangle className="h-3 w-3" />
				</TooltipTrigger>
				<TooltipContent side="bottom" className="text-xs">
					{warningTooltipContent}
				</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="inline-flex">
						<Icon className="h-3 w-3" />
					</div>
				</TooltipTrigger>
				<TooltipContent side="bottom" align="center">
					{connectionTooltipContent}
				</TooltipContent>
			</Tooltip>
		</div>
	);
});

BottomInfo.displayName = "BottomInfo";

export default BottomInfo;
