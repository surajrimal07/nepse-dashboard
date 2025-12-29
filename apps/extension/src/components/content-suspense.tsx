import type { ReactElement } from "react";
import { Suspense as ReactSuspense } from "react";

interface ContentSuspenseProps {
	children: ReactElement;
	fallback?: ReactElement;
}

function DefaultFallback() {
	return (
		<div className="flex items-center justify-center p-4">
			<div className="flex flex-col items-center gap-2">
				<div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
				<span className="text-xs text-muted-foreground">Loading...</span>
			</div>
		</div>
	);
}

const defaultFallback = <DefaultFallback />;

export function ContentSuspense({
	children,
	fallback = defaultFallback,
}: ContentSuspenseProps) {
	return <ReactSuspense fallback={fallback}>{children}</ReactSuspense>;
}
