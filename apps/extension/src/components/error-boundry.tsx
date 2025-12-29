import { Button } from "@nepse-dashboard/ui/components/button";
import { AlertTriangle, Copy, Mail, RotateCw } from "lucide-react";
import type { ReactNode } from "react";
import type { FallbackProps } from "react-error-boundary";
import { ErrorBoundary } from "react-error-boundary";
import { useClipboard } from "@/hooks/use-clipboard";
import { track } from "@/lib/analytics";
import { Env, EventName } from "@/types/analytics-types";

function ErrorDetails({ error }: { error: Error }) {
	const clipboard = useClipboard({ timeout: 500, objectName: "Error" });

	const { callAction } = useAppState();

	const errorInfo = {
		message: error.message,
		stack: error.stack,
		userAgent: navigator.userAgent,
		timestamp: new Date().toISOString(),
		version: getVersion(),
	};

	const handleCopyError = async () => {
		clipboard.copy(JSON.stringify(errorInfo, null, 2));
	};

	const handleEmailError = async () => {
		callAction("handleEmailSupport", { error: errorInfo }).then(
			handleActionResult,
		);
	};

	return (
		<div className="mt-4 space-y-2">
			<pre className="bg-muted/50 p-4 rounded-md text-[11px] font-mono overflow-auto max-h-[200px]">
				{JSON.stringify(errorInfo, null, 2)}
			</pre>
			<div className="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					className="text-xs"
					onClick={handleCopyError}
				>
					<Copy className="mr-1 h-3 w-3" />
					Copy Details
				</Button>
				<Button
					variant="outline"
					size="sm"
					className="text-xs"
					onClick={() => handleEmailError()}
				>
					<Mail className="mr-1 h-3 w-3" />
					Email Developer
				</Button>
			</div>
		</div>
	);
}

function AppErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
	return (
		<div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-card rounded-lg border shadow-lg p-6 space-y-4">
				<div className="flex items-center justify-center">
					<div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
						<AlertTriangle className="h-6 w-6 text-red-600" />
					</div>
				</div>

				<div className="text-center">
					<h2 className="text-lg font-semibold text-foreground">
						Something went wrong!
					</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						An unexpected error occurred in the extension.
					</p>
				</div>

				<div className="bg-muted/50 rounded-md p-4">
					<p className="text-sm text-muted-foreground font-mono break-all">
						{error.message}
					</p>
				</div>

				<ErrorDetails error={error} />

				<Button className="w-full" onClick={resetErrorBoundary}>
					<RotateCw className="mr-2 h-4 w-4" />
					Try Again
				</Button>
			</div>
		</div>
	);
}

function MainErrorBoundry({ children }: { children: ReactNode }) {
	return (
		<ErrorBoundary
			FallbackComponent={AppErrorFallback}
			onError={(error) => {
				track({
					context: Env.UNIVERSAL,
					eventName: EventName.ERROR_BOUNDARY_UNIVERSAL,
					params: {
						error: error.message,
						stack: error.stack,
						name: error.name,
					},
				});
			}}
		>
			{children}
		</ErrorBoundary>
	);
}

export default MainErrorBoundry;
