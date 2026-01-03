import { AlertCircle, RotateCcw } from "lucide-react";

interface ChatErrorProps {
	onRetry: () => void;
}

export default function ChatError({ onRetry }: ChatErrorProps) {
	return (
		<div className="w-full h-full flex items-center justify-center p-6">
			<div className="w-full max-w-md">
				<div className="flex flex-col items-center text-center space-y-4">
					<div className="p-3 rounded-full">
						<AlertCircle className="w-10 h-10 text-red-400" />
					</div>
					<div className="space-y-2">
						<h2 className="text-xl font-bold text-zinc-200">
							An error occurred
						</h2>
						<p className="text-sm leading-relaxed text-zinc-200">
							There was a problem processing. Please make sure the website
							content is not empty, too large or filled with canvas elements.
							The issue was likely due to no content were able to extract from
							the page.
						</p>
					</div>
					<button
						type="button"
						onClick={onRetry}
						className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-red-900 text-red-100 hover:bg-red-800"
					>
						<RotateCcw size={16} />
						Retry
					</button>
				</div>
			</div>
		</div>
	);
}
