import { Button } from "@nepse-dashboard/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo } from "react";

export const NavigationButtons = memo(
	({
		currentPage,
		totalPages,
		onPrev,
		onNext,
		isSidepanel = false,
	}: {
		currentPage: number;
		totalPages: number;
		onPrev: () => void;
		onNext: () => void;
		isSidepanel?: boolean;
	}) => (
		<div
			className={`fixed left-0 right-0 flex items-center justify-center gap-4 py-2 z-50 bg-background/80 backdrop-blur-sm ${isSidepanel ? "bottom-16" : "bottom-3"}`}
		>
			<Button
				variant="outline"
				size="icon"
				onClick={onPrev}
				disabled={currentPage === 1}
				className="min-w-[30px] min-h-[30px] touch-manipulation"
			>
				<ChevronLeft className="h-3 w-3" />
			</Button>

			<p className="text-sm text-muted-foreground min-w-[50px] text-center px-2">
				{currentPage} of {totalPages}
			</p>

			<Button
				variant="outline"
				size="icon"
				onClick={onNext}
				disabled={currentPage === totalPages}
				className="min-w-[30px] min-h-[30px] touch-manipulation"
			>
				<ChevronRight className="h-3 w-3" />
			</Button>
		</div>
	),
);
NavigationButtons.displayName = "NavigationButtons";
