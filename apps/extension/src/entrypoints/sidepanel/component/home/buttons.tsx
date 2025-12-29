import { Button } from "@nepse-dashboard/ui/components/button";
import { ArrowDown, ArrowUp, Camera, Share2, X } from "lucide-react";
import { memo } from "react";

interface MoveButtonsProps {
	onMoveUp: () => void;
	onMoveDown: () => void;
	canMoveUp: boolean;
	canMoveDown: boolean;
}

export const MoveButtons = memo(
	({ onMoveUp, onMoveDown, canMoveUp, canMoveDown }: MoveButtonsProps) => (
		<>
			{canMoveUp && (
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
					onClick={onMoveUp}
					title="Move widget up"
				>
					<ArrowUp className="h-2 w-2" />
				</Button>
			)}

			{canMoveDown && (
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
					onClick={onMoveDown}
					title="Move widget down"
				>
					<ArrowDown className="h-2 w-2" />
				</Button>
			)}
		</>
	),
);

MoveButtons.displayName = "MoveButtons";

export const RemoveButton = memo(
	({
		onRemove,
		widgetId,
	}: {
		onRemove: (id: string) => void;
		widgetId: string;
	}) => {
		return (
			<Button
				variant="ghost"
				size="icon"
				className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
				onClick={() => onRemove(widgetId)}
				title="Remove widget"
			>
				<X className="h-2 w-2" />
			</Button>
		);
	},
);

RemoveButton.displayName = "RemoveButton";

export const ScreenshotButtons = memo(
	({ onScreenshot }: { onScreenshot: (shareLink: boolean) => void }) => {
		return (
			<>
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
					onClick={() => onScreenshot(false)}
					title="Copy screenshot to clipboard"
				>
					<Camera className="h-2 w-2" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
					onClick={() => onScreenshot(true)}
					title="Get shareable link"
				>
					<Share2 className="h-2 w-2" />
				</Button>
			</>
		);
	},
);

ScreenshotButtons.displayName = "ScreenshotButtons";
