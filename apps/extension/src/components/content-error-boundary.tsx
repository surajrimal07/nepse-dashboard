import { Button } from "@nepse-dashboard/ui/components/button";
import { AlertCircle, RotateCw, X } from "lucide-react";
import type { ReactNode } from "react";
import type { FallbackProps } from "react-error-boundary";
import { ErrorBoundary } from "react-error-boundary";
import { track } from "@/lib/analytics";
import { Env, EventName } from "@/types/analytics-types";

function ContentErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
	return (
		<div className="bg-background border rounded-lg shadow-lg p-4 max-w-md">
			<div className="flex items-start gap-3">
				<div className="shrink-0">
					<div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
						<AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
					</div>
				</div>

				<div className="flex-1 min-w-0">
					<h3 className="text-sm font-semibold text-foreground">
						Something went wrong
					</h3>
					<p className="mt-1 text-xs text-muted-foreground line-clamp-2">
						{error.message}
					</p>

					<div className="mt-3 flex gap-2">
						<Button
							size="sm"
							variant="outline"
							className="text-xs h-7"
							onClick={resetErrorBoundary}
						>
							<RotateCw className="mr-1 h-3 w-3" />
							Retry
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export function ContentErrorBoundary({ children }: { children: ReactNode }) {
	return (
		<ErrorBoundary
			FallbackComponent={(props) => <ContentErrorFallback {...props} />}
			onError={(error, errorInfo) => {
				track({
					context: Env.UNIVERSAL,
					eventName: EventName.CONTENT_UNIVERSAL_ERROR,
					params: {
						errorMessage: error.message,
						stack: error.stack,
						errorInfo: errorInfo.componentStack,
					},
				});
			}}
		>
			{children}
		</ErrorBoundary>
	);
}
