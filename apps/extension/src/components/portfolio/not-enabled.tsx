import { Database, Eye, Lock, Shield } from "lucide-react";
import { memo } from "react";

interface PortfolioNotEnabledProps {
	onEnable: () => void;
}

function PortfolioNotEnabledComponent({ onEnable }: PortfolioNotEnabledProps) {
	return (
		<div className="flex flex-col h-full w-full bg-background overflow-hidden">
			<div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
				<div className="relative mb-6">
					<div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
						<Lock className="w-8 h-8 text-amber-400" />
					</div>
					<div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-amber-500/30 flex items-center justify-center">
						<Database className="w-3 h-3 text-amber-400" />
					</div>
				</div>
				<h2 className="text-xl font-bold text-foreground mb-2">
					Portfolio Sync Disabled
				</h2>

				<p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
					Enable portfolio sync to view your holdings, track performance, and
					get detailed insights from your Meroshare account.
				</p>

				<button
					onClick={onEnable}
					className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium text-sm transition-colors mb-6"
				>
					Enable Portfolio Sync
				</button>
				<div className="w-full max-w-sm space-y-3">
					<div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
						<Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
						<div className="text-left">
							<p className="text-sm font-medium text-emerald-400 mb-1">
								100% Local & Private
							</p>
							<p className="text-xs text-muted-foreground">
								All portfolio data is stored locally on your device. No data is
								ever sent to external servers.
							</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
						<Eye className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
						<div className="text-left">
							<p className="text-sm font-medium text-blue-400 mb-1">
								Only You Can See It
							</p>
							<p className="text-xs text-muted-foreground">
								Your portfolio data stays in your browser's local storage and is
								never shared with anyone.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

const PortfolioNotEnabled = memo(PortfolioNotEnabledComponent);
PortfolioNotEnabled.displayName = "PortfolioNotEnabled";

export { PortfolioNotEnabled };
