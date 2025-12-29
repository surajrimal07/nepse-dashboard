import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";

export function LoadingUI() {
	return (
		<div className="flex flex-col h-full min-h-[200px]">
			{/* Summary text area - mimics NewsSummary */}
			<div className="flex-1 space-y-2 p-0 mb-3">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-4/5" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-2/3" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-5/6" />
			</div>

			{/* Theme badges and bias - mimics ThemeBadges and BiasAnalysis */}
			<div className="space-y-3 mt-auto">
				<div className="flex gap-1.5">
					<Skeleton className="h-6 w-24" />
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-6 w-20" />
				</div>
				<Skeleton className="h-2 w-full rounded-full" />
			</div>

			{/* Bottom bar - mimics NewsBottomBar */}
			<div className="pt-1 mt-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-1.5">
						<Skeleton className="h-7 w-8" />
						<Skeleton className="h-7 w-7" />
						<Skeleton className="h-7 w-7" />
						<Skeleton className="h-7 w-7" />
						<Skeleton className="h-7 w-7" />
					</div>
					<div className="flex items-center gap-1.5">
						<Skeleton className="h-7 w-16" />
						<Skeleton className="h-7 w-16" />
					</div>
				</div>
			</div>
		</div>
	);
}
