import { AlertCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatErrorProps {
	isDark: boolean;
	onRetry: () => void;
}

export default function ChatError({ isDark, onRetry }: ChatErrorProps) {
	return (
		<div className="w-full h-full flex items-center justify-center p-6">
			<div className="w-full max-w-md">
				<div className="flex flex-col items-center text-center space-y-4">
					<div className="p-3 rounded-full">
						<AlertCircle
							className={cn(
								"w-10 h-10",
								isDark ? "text-red-400" : "text-red-500",
							)}
						/>
					</div>
					<div className="space-y-2">
						<h2
							className={cn(
								"text-xl font-bold",
								isDark ? "text-zinc-200" : "text-slate-800",
							)}
						>
							An error occurred
						</h2>
						<p
							className={cn(
								"text-sm leading-relaxed",
								isDark ? "text-zinc-200" : "text-slate-800",
							)}
						>
							There was a problem processing. Please make sure the website
							content is not empty, too large or filled with canvas elements.
							The issue was likely due to no content were able to extract from
							the page.
						</p>
					</div>
					<button
						type="button"
						onClick={onRetry}
						className={cn(
							"inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
							isDark
								? "bg-red-900 text-red-100 hover:bg-red-800"
								: "bg-red-100 text-red-900 hover:bg-red-200",
						)}
					>
						<RotateCcw size={16} />
						Retry
					</button>
				</div>
			</div>
		</div>
	);
}
