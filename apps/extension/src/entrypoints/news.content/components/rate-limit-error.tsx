import { Button } from "@nepse-dashboard/ui/components/button";
import { AlertTriangle, Clock } from "lucide-react";
import useScreenView from "@/hooks/usePageView";

interface RateLimitErrorProps {
	message: string;
	onClose: () => void;
}

export function RateLimitError({ message, onClose }: RateLimitErrorProps) {
	useScreenView("/news-rate-limit-error", "News Rate Limit Error");

	return (
		<div className="bg-linear-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
			<div className="flex flex-col items-center text-center space-y-4">
				<div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
					<AlertTriangle className="w-8 h-8 text-orange-600" />
				</div>

				<div className="space-y-2">
					<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 justify-center">
						<Clock className="w-5 h-5 text-orange-600" />
						Rate Limit Reached
					</h3>
					<p className="text-sm text-gray-700 max-w-md">{message}</p>
				</div>

				<div className="bg-orange-100 rounded-lg p-3 w-full">
					<p className="text-xs text-gray-600 font-medium">
						💡 You can still view previously generated summaries without limits!
					</p>
				</div>

				<Button variant="outline" size="sm" onClick={onClose} className="mt-2">
					Close
				</Button>
			</div>
		</div>
	);
}
