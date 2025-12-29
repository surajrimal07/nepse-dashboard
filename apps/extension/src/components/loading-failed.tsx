import { Button } from "@nepse-dashboard/ui/components/button";
import { RotateCw } from "lucide-react";
import { memo } from "react";

interface LoadingFailedProps {
	onReload?: () => void;
	reason?: string | null;
}

const LoadingFailed = memo(({ onReload, reason }: LoadingFailedProps) => {
	return (
		<div className="w-full flex flex-col items-center justify-center p-4">
			<div className="text-red-400 text-base font-semibold mb-2">
				Data loading failed
			</div>
			<div className="text-zinc-400 text-xs mb-4 text-center">
				{reason || "We couldn't fetch the latest data. Please try reloading."}
			</div>
			{onReload && (
				<Button
					onClick={onReload}
					className="bg-zinc-900 text-zinc-100 hover:bg-zinc-700 transition-colors duration-200"
				>
					<RotateCw className="mr-2 h-4 w-4" />
					Reload
				</Button>
			)}
		</div>
	);
});

LoadingFailed.displayName = "LoadingFailed";

export default LoadingFailed;
