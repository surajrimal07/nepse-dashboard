import { Briefcase } from "lucide-react";

/**
 * Component shown in Meroshare content script when portfolio has no stocks
 */
export default function EmptyPortfolioWidget() {
	return (
		<div className="space-y-3 py-2">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold text-gray-700">
					📊 Portfolio Insights
				</h3>
			</div>

			<div className="rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50 p-6">
				<div className="flex flex-col items-center text-center">
					<div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
						<Briefcase className="w-6 h-6 text-slate-400" />
					</div>
					<h4 className="text-sm font-semibold text-slate-700 mb-1">
						No Holdings Found
					</h4>
					<p className="text-xs text-slate-500 max-w-xs">
						Your portfolio is empty. No stocks are currently held in this
						account. Once you purchase stocks, your portfolio insights will
						appear here.
					</p>
				</div>
			</div>
		</div>
	);
}
