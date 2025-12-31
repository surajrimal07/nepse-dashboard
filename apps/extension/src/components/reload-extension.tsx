import { Button } from "@nepse-dashboard/ui/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@nepse-dashboard/ui/components/tooltip";
import { RotateCw } from "lucide-react";
import { memo, useCallback } from "react";
import { handleActionResult } from "@/hooks/handle-action";
import { useAppState } from "@/hooks/use-app";

const ReloadExtension = memo(() => {
	const { callAction } = useAppState();

	const handleReload = useCallback(async () => {
		callAction("handleReloadExtension").then(handleActionResult);
	}, []);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					type="button"
					onClick={handleReload}
					className="h-7 w-7 rounded-lg border-none transition-colors p-0"
					aria-label="Reload extension"
					variant="ghost"
					size="icon"
				>
					<RotateCw className="h-4 w-4" />
				</Button>
			</TooltipTrigger>
			<TooltipContent side="bottom">
				<p>Reload extension</p>
			</TooltipContent>
		</Tooltip>
	);
});

ReloadExtension.displayName = "ReloadExtension";

export default ReloadExtension;
