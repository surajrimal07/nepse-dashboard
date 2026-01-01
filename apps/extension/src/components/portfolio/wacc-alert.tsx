import { AlertTriangle, ExternalLink } from "lucide-react";

interface WaccAlertProps {
	accountName?: string;
	message?: string;
}

/**
 * Alert shown in sidepanel when WACC calculation is pending for an account
 */
export default function WaccAlert({ accountName, message }: WaccAlertProps) {
	// Extract scrip name from the message if available
	const scripMatch = message?.match(/SCRIP:\s*(\w+)/i);
	const scripName = scripMatch ? scripMatch[1] : null;

	const handleOpenMeroshare = () => {
		window.open("https://meroshare.cdsc.com.np/#/purchase", "_blank");
	};

	return (
		<div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
			<div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
				<AlertTriangle className="w-7 h-7 text-amber-400" />
			</div>
			<h3 className="text-lg font-semibold text-foreground mb-2">
				WACC Calculation Required
			</h3>
			<p className="text-sm text-muted-foreground mb-4 max-w-xs">
				{scripName ? (
					<>
						Please complete the WACC calculation for{" "}
						<span className="font-medium text-foreground">{scripName}</span>
						{accountName && (
							<>
								{" "}in <span className="font-medium text-foreground">{accountName}</span>'s account
							</>
						)}
						{" "}on Meroshare before viewing portfolio insights.
					</>
				) : (
					<>
						{accountName && (
							<>
								<span className="font-medium text-foreground">{accountName}</span>'s account requires{" "}
							</>
						)}
						WACC calculation to be completed on Meroshare before viewing portfolio insights.
					</>
				)}
			</p>
			<button
				onClick={handleOpenMeroshare}
				className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
			>
				Open Meroshare <ExternalLink className="w-4 h-4" />
			</button>
			<p className="text-xs text-muted-foreground mt-4 max-w-xs">
				Go to My Purchase → Calculate WACC for all scrips, then revisit this page.
			</p>
		</div>
	);
}
