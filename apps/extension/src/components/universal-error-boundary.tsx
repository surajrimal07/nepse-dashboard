import { Button } from "@nepse-dashboard/ui/components/button";
import { AlertTriangle, RotateCw } from "lucide-react";
import type { ReactNode } from "react";
import type { FallbackProps } from "react-error-boundary";
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Env, EventName } from "@/types/analytics-types";

interface ErrorFallbackProps extends FallbackProps {
	componentName: string;
	className?: string;
	minimal?: boolean;
}

function UniversalErrorFallback({
	error,
	componentName,
	className,
	minimal,
}: ErrorFallbackProps) {
	const { resetBoundary } = useErrorBoundary();

	if (minimal) {
		return (
			<div
				className={cn(
					"w-full flex flex-col items-center justify-center p-2 min-h-[100px]",
					"bg-red-500/5 border border-red-500/10 rounded-md",
					className,
				)}
			>
				<AlertTriangle className="h-4 w-4 text-red-400 mb-2" />
				<p className="text-xs text-muted-foreground text-center px-2">
					{error.message}
				</p>
				<Button
					onClick={resetBoundary}
					variant="ghost"
					size="sm"
					className="mt-2 h-7 text-xs"
				>
					<RotateCw className="mr-1 h-3 w-3" />
					Retry
				</Button>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"w-full h-full flex flex-col items-center justify-center p-4",
				"bg-destructive/5 border border-destructive/10 rounded-lg",
				className,
			)}
		>
			<div className="flex items-center gap-2 mb-3">
				<AlertTriangle className="h-5 w-5 text-destructive" />
				<div className="text-base font-semibold text-destructive">
					{componentName} Error
				</div>
			</div>

			<div className="text-center space-y-1 mb-4">
				<p className="text-sm text-muted-foreground">
					Something went wrong while loading this component.
				</p>
				<p className="text-xs bg-muted/50 py-1 px-2 rounded-md font-mono max-w-[300px] truncate">
					{error.message}
				</p>
			</div>

			<Button
				onClick={resetBoundary}
				variant="destructive"
				size="sm"
				className="min-w-[100px]"
			>
				<RotateCw className="mr-2 h-3 w-3" />
				Retry
			</Button>
		</div>
	);
}

interface UniversalErrorBoundaryProps {
	children: ReactNode;
	componentName: string;
	className?: string;
	minimal?: boolean;
}

export function UniversalErrorBoundry({
	children,
	componentName,
	className,
	minimal = false,
}: UniversalErrorBoundaryProps) {
	const handleError = (error: Error) => {
		track({
			context: Env.UNIVERSAL,
			eventName: EventName.ERROR_BOUNDARY_UNIVERSAL,
			params: {
				component: componentName,
				errorMessage: error.message,
				stack: error.stack,
			},
		});
	};

	return (
		<ErrorBoundary
			FallbackComponent={(props) => (
				<UniversalErrorFallback
					{...props}
					componentName={componentName}
					className={className}
					minimal={minimal}
				/>
			)}
			onError={handleError}
		>
			{children}
		</ErrorBoundary>
	);
}
