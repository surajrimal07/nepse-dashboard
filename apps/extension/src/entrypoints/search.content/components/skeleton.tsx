import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import { cn } from "@/lib/utils";
import { RESULT_SKELETON_COUNT } from "../contants";

export function renderSkeletonRows(isDark: boolean) {
	return Array.from({ length: RESULT_SKELETON_COUNT }, (_, index) => (
		<div
			key={`search-skeleton-${index}`}
			className={cn(
				"w-full rounded-lg border px-4 py-3.5",
				isDark
					? "border-slate-700 bg-slate-800/50"
					: "border-slate-200 bg-white",
			)}
		>
			<div className="flex items-center justify-between gap-4">
				<div className="space-y-2">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-3 w-32" />
				</div>
				<div className="space-y-1 text-right">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-3 w-20" />
				</div>
			</div>
			<Skeleton className="mt-3 h-3 w-28" />
		</div>
	));
}
