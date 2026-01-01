/** biome-ignore-all lint/a11y/noStaticElementInteractions: <Known> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <Known> */
import { Clock, Info } from "lucide-react";
import TimeAgo from "react-timeago";
import { syncMeroshareData } from "../api";

export default function ChangedInfo({
	syncTimestamp,
}: {
	syncTimestamp: number | null;
}) {
	function handleSync(e: React.MouseEvent) {
		e.preventDefault();
		syncMeroshareData();
	}
	return (
		<div className="flex items-center justify-between py-2">
			<div
				onClick={handleSync}
				className="flex items-center gap-2 text-xs text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
			>
				<Info className="w-3.5 h-3.5" />
				<span>Stock quantity changed? To refresh click here</span>
			</div>
			<div className="flex items-center gap-1 text-xs text-gray-700">
				<Clock className="w-3 h-3" />
				<span>
					Last Synced:{" "}
					{syncTimestamp ? <TimeAgo date={syncTimestamp} /> : "Never synced"}
				</span>
			</div>
		</div>
	);
}
