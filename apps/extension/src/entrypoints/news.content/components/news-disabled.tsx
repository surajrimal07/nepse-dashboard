import { InfoIcon } from "lucide-react";
import useScreenView from "@/hooks/usePageView";

interface NewsDisabledProps {
	reason?: "disabled" | "unsupported-site";
}

export function NewsDisabled({ reason = "disabled" }: NewsDisabledProps) {
	useScreenView("/news-disabled", "News Disabled");

	const getMessage = () => {
		switch (reason) {
			case "unsupported-site":
				return "News analysis is not available for this website";
			case "disabled":
				return "News analysis is currently turned off";
			default:
				return "News analysis is currently turned off";
		}
	};

	return (
		<div className="flex items-start gap-3">
			<div className="shrink-0 mt-0.5">
				<InfoIcon size={20} className="text-blue-500" />
			</div>
			<div>
				<h3 className="text-sm font-medium text-gray-900 mb-1">
					News Analysis Unavailable
				</h3>
				<p className="text-sm text-gray-600">{getMessage()}</p>
			</div>
		</div>
	);
}
