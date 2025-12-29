import { AlertTriangle } from "lucide-react";
import useScreenView from "@/hooks/usePageView";

interface ParsingErrorProps {
	message: string;
	onRetry?: () => void;
}

export function ParsingError({ message, onRetry }: ParsingErrorProps) {
	useScreenView("/news-parsing-error", "News Parsing Error");

	return (
		<div className="flex items-start gap-3">
			<div className="shrink-0 mt-0.5">
				<AlertTriangle size={20} className="text-red-500" />
			</div>
			<div className="flex-1">
				<h3 className="text-sm font-medium text-gray-900 mb-1">
					Parsing Error
				</h3>
				<p className="text-sm text-gray-600 mb-3">{message}</p>
				{onRetry && (
					// biome-ignore lint/a11y/useButtonType: <I know>
					<button
						onClick={onRetry}
						className="text-sm bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1 rounded-md border border-red-200 transition-colors"
					>
						Try Again
					</button>
				)}
			</div>
		</div>
	);
}
