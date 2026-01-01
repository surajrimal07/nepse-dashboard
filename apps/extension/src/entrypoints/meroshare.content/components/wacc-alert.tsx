import { AlertTriangle, ArrowRight, ExternalLink } from "lucide-react";
import type { WaccPendingError } from "../../../lib/storage/meroshare-storage";

interface WaccAlertProps {
	error?: WaccPendingError | null;
}

/**
 * Alert component shown when WACC calculation is pending.
 * This happens when user needs to complete WACC calculation on Meroshare first.
 */
export default function WaccAlert({ error }: WaccAlertProps) {
	// Extract scrip name from the message if available
	const scripMatch = error?.message?.match(/SCRIP:\s*(\w+)/i);
	const scripName = scripMatch ? scripMatch[1] : null;

	const handleGoToWacc = () => {
		// Navigate to WACC calculation page on Meroshare
		window.location.hash = "#/purchase";
	};

	return (
		<div className="space-y-3 py-2">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold text-gray-700">
					📊 Portfolio Insights
				</h3>
			</div>

			<div className="rounded-lg border border-amber-200 bg-linear-to-r from-amber-50 to-yellow-50 p-4">
				<div className="flex items-start gap-3">
					<AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />

					<div className="flex-1 min-w-0">
						<h4 className="text-sm font-semibold text-amber-800">
							WACC Calculation Required
						</h4>
						<p className="mt-1 text-sm text-amber-700">
							{scripName ? (
								<>
									Please complete the WACC calculation for{" "}
									<strong>{scripName}</strong> on Meroshare before viewing
									portfolio insights.
								</>
							) : (
								<>
									Please complete the remaining WACC calculation on Meroshare
									before viewing portfolio insights.
								</>
							)}
						</p>

						<div className="mt-3 flex flex-wrap gap-2">
							<button
								type="button"
								onClick={handleGoToWacc}
								className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
							>
								<ArrowRight className="h-3.5 w-3.5" />
								Go to My Purchase
							</button>
							<a
								href="https://meroshare.cdsc.com.np/#/purchase"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-amber-700 shadow-sm ring-1 ring-inset ring-amber-300 hover:bg-amber-50 transition-colors"
							>
								<ExternalLink className="h-3.5 w-3.5" />
								Open in New Tab
							</a>
						</div>
					</div>
				</div>
			</div>

			<p className="text-xs text-gray-500 text-center">
				Portfolio insights will be available after completing the WACC
				calculation.
			</p>
		</div>
	);
}
