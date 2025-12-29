import { Button } from "@nepse-dashboard/ui/components/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { memo } from "react";

export const ServiceUnavailable = memo(
	({ chat, onRetry }: { chat: boolean; onRetry: () => void }) => {
		return (
			<div className="flex flex-col items-center justify-center h-full p-6 text-center bg-background/95 backdrop-blur-sm space-y-4">
				<div className="rounded-full bg-destructive/10 p-3">
					<AlertCircle className="h-10 w-10 text-destructive" />
				</div>

				<div className="space-y-2">
					<h3 className="text-lg font-medium">Service Unavailable</h3>
					<p className="text-sm text-muted-foreground max-w-md">
						{chat ? "Chat" : "Community chat"} service is currently not
						available or down. Please try again later.
					</p>
				</div>

				<Button
					onClick={onRetry}
					variant="outline"
					className="mt-4 flex items-center gap-2"
				>
					<RefreshCw className="h-4 w-4" />
					Try Again
				</Button>
			</div>
		);
	},
);

ServiceUnavailable.displayName = "ServiceUnavailable";
