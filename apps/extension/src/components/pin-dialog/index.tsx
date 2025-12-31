import { Button } from "@nepse-dashboard/ui/components/button";
import { ChevronRight, Pin, X } from "lucide-react";
import { memo, useCallback } from "react";
import { BrowserInfo } from "@/components/pin-dialog/browser-info";
import useScreenView from "@/hooks/usePageView";

interface PinExtensionDialogProps {
	onDismiss?: () => void;
}

const PinUI = memo(({ onDismiss }: PinExtensionDialogProps) => {
	useScreenView("/pin-dialog");

	const handleDismiss = useCallback(() => {
		onDismiss?.();
	}, [onDismiss]);

	return (
		<div className="fixed inset-0 flex items-center justify-center z-50">
			<div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
			<div className="relative w-full max-w-xs rounded-lg bg-linear-to-br from-gray-900 to-gray-800 p-4 shadow-lg border border-gray-700 text-gray-100 transition-all duration-300 animate-fadeIn">
				<div className="flex items-start justify-between mb-3">
					<div className="flex items-center gap-2">
						<Pin className="h-4 w-4 text-indigo-400" />
						<h3 className="text-sm font-medium">Extension Not Pinned</h3>
					</div>
					<Button
						variant="ghost"
						onClick={handleDismiss}
						className="text-gray-400 hover:text-gray-200 transition-colors duration-200 focus:outline-none"
						aria-label="Dismiss"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>

				<div className="mb-3">
					<p className="text-xs text-gray-300 mb-2">
						Pinning enables live update visibility and easy access to toggle the
						extension. Follow these steps:
					</p>
				</div>

				<div className="bg-gray-800/50 rounded p-2 mb-3">
					<BrowserInfo />
				</div>

				<Button
					onClick={handleDismiss}
					className="w-full flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1.5 px-3 rounded transition-colors duration-200"
				>
					Got it
					<ChevronRight className="h-3 w-3" />
				</Button>
			</div>
		</div>
	);
});

PinUI.displayName = "PinUI";

export default PinUI;
