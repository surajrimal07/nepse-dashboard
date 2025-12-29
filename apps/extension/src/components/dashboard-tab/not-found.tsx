import { Button } from "@nepse-dashboard/ui/components/button";
import { Card } from "@nepse-dashboard/ui/components/card";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { memo } from "react";

interface NotFoundProps {
	onBack?: () => void;
	title?: string;
	message?: string;
}

export const NotFound = memo(
	({
		onBack,
		title = "Widget Not Found",
		message = "The requested widget could not be found or is temporarily unavailable.",
	}: NotFoundProps) => (
		<div className="flex items-center justify-center min-h-[400px] p-4">
			<Card className="w-full max-w-md p-6 text-center">
				<div className="flex flex-col items-center gap-4">
					<div className="rounded-full bg-orange-100 dark:bg-orange-900/20 p-3">
						<AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
					</div>

					<div className="space-y-2">
						<h2 className="text-lg font-semibold text-foreground">{title}</h2>
						<p className="text-sm text-muted-foreground max-w-sm">{message}</p>
					</div>

					{onBack && (
						<Button
							onClick={onBack}
							variant="outline"
							className="flex items-center gap-2"
						>
							<ArrowLeft className="h-4 w-4" />
							Back to Dashboard
						</Button>
					)}
				</div>
			</Card>
		</div>
	),
);

NotFound.displayName = "NotFound";
