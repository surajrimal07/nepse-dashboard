import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import { memo } from "react";

// Static skeleton rows - defined outside component for stable reference
const SKELETON_ROWS = [1, 2, 3, 4] as const;

function PortfolioLoadingComponent() {
	return (
		<div className="flex flex-col h-full w-full bg-background overflow-hidden">
			<div className="p-3 pb-2">
				<Skeleton className="h-10 w-full rounded-lg" />
				<Skeleton className="h-4 w-24 mt-2" />
			</div>

			<div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3">
				<div className="grid grid-cols-2 gap-2">
					<Skeleton className="h-20 rounded-lg" />
					<Skeleton className="h-20 rounded-lg" />
					<Skeleton className="h-20 rounded-lg" />
					<Skeleton className="h-20 rounded-lg" />
				</div>

				<div className="grid grid-cols-4 gap-2">
					<Skeleton className="h-16 rounded-lg" />
					<Skeleton className="h-16 rounded-lg" />
					<Skeleton className="h-16 rounded-lg" />
					<Skeleton className="h-16 rounded-lg" />
				</div>

				<div className="bg-muted/20 border border-border/50 rounded-lg overflow-hidden">
					<div className="px-3 py-2 border-b border-border/50 flex items-center justify-between">
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-3 w-12" />
					</div>
					<div className="divide-y divide-border/30">
						{SKELETON_ROWS.map((i) => (
							<div key={i} className="px-3 py-2.5">
								<div className="flex items-center justify-between mb-1.5">
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-4 w-20" />
								</div>
								<div className="flex items-center justify-between">
									<Skeleton className="h-3 w-24" />
									<Skeleton className="h-3 w-12" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

const PortfolioLoading = memo(PortfolioLoadingComponent);
PortfolioLoading.displayName = "PortfolioLoading";

export default PortfolioLoading;