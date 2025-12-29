import type { ReactElement } from "react";

import { Suspense as ReactSuspense } from "react";
import Loading from "@/components/loading";

export function Suspense({
	children,
	fallback,
}: {
	children: ReactElement;
	fallback?: ReactElement;
}) {
	if (fallback === undefined) {
		fallback = <Loading />;
	}
	return <ReactSuspense fallback={fallback}>{children}</ReactSuspense>;
}
