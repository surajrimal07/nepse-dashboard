/** biome-ignore-all lint/a11y/noStaticElementInteractions: <Known> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <Known> */
import { History } from "lucide-react";
import { syncMeroshareData } from "../api";

export default function TransactionAlert() {
	function handleSync(e: React.MouseEvent) {
		e.preventDefault();
		syncMeroshareData();
	}
	return (
		<div
			onClick={handleSync}
			className="flex items-start gap-3 p-4 bg-linear-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg text-blue-900 hover:from-blue-100 hover:to-indigo-100 transition-colors cursor-pointer"
		>
			<History className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
			<div className="flex flex-col gap-1">
				<span className="font-semibold text-sm">
					Transaction History Required
				</span>
				<span className="text-xs text-blue-800">
					Please visit My Transaction History to sync your transaction data for
					accurate portfolio calculations.
				</span>
			</div>
		</div>
	);
}
