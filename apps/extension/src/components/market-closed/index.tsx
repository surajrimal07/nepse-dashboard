import { Button } from "@nepse-dashboard/ui/components/button";
import { useRouter } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { memo, useCallback } from "react";
import { canGoBack } from "@/hooks/canGoBack";

const MarketClosed = memo(() => {
	const router = useRouter();

	const handleBack = useCallback(() => {
		router.history.back();
	}, [router.history]);

	return (
		<div className="w-full max-w-md mx-auto overflow-hidden isolate">
			<div className="relative h-64 flex items-center justify-center">
				<div className="absolute inset-0 bg-grid-white/[0.02] mix-blend-soft-light" />
				<div className="relative flex flex-col items-center gap-6">
					<div className="p-4 rounded-full bg-linear-to-r from-green-500 to-emerald-600 shadow-lg relative">
						<div className="absolute inset-0 rounded-full bg-gradient-radial from-green-400/30 to-transparent animate-pulse isolate" />
						<Clock className="w-12 h-12 text-white" />
					</div>
					<h2 className="text-3xl font-bold text-green-50 tracking-tight">
						Market Closed
					</h2>
				</div>
			</div>

			<div className="p-6 space-y-6">
				<div className="p-4 rounded-lg bg-gray-800/50 border border-green-900/30">
					<p className="text-sm text-gray-300 leading-relaxed text-center">
						You can still use other features of the app.
						<span className="block mt-2 text-emerald-400 font-medium">
							Live data will be available during market hours.
						</span>
					</p>
				</div>
				{canGoBack() && (
					<Button
						variant="outline"
						onClick={handleBack}
						className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-hidden focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
					>
						Go Back
					</Button>
				)}
			</div>
		</div>
	);
});

MarketClosed.displayName = "MarketClosed";

export default MarketClosed;
