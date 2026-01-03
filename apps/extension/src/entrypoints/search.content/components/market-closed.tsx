import { Clock, Moon, Zap } from "lucide-react";
import type React from "react";

const MarketClosed: React.FC = () => {
	return (
		<div className="w-full h-full flex items-center justify-center p-1">
			<div className="w-full max-w-md">
				<div className="flex flex-col items-center text-center space-y-4">
					<div className="relative p-4 rounded-full bg-linear-to-br from-indigo-900/40 to-purple-900/40">
						<div className="absolute inset-0 rounded-full  bg-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
						<Moon className="w-12 h-12 relative z-10  text-zinc-200" />
					</div>

					<div className="space-y-3">
						<h2 className="text-xl font-bold text-zinc-200">
							Market is Closed
						</h2>

						<p className="text-sm leading-relaxed text-zinc-400">
							This feature requires the market to be open to function properly.
						</p>

						<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-700/40">
							<Clock className="w-3.5 h-3.5" />
							<span>Opens 11:00 AM NPT</span>
						</div>
					</div>

					<div className="w-full mt-2 p-3 rounded-xl border transition-all hover:scale-[1.02] bg-slate-800/50 border-slate-700/50 hover:border-slate-600/60">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-lg bg-emerald-900/40">
								<Zap className="w-4 h-4 text-emerald-400" />
							</div>
							<div className="text-left">
								<p className="text-xs font-semibold text-zinc-200">
									Try other modes!
								</p>
								<p className="text-xs text-zinc-300">
									Press Tab to switch modes
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MarketClosed;
