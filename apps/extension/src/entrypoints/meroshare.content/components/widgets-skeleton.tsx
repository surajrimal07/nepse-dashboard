import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";

function WidgetCardSkeleton() {
	return (
		<div className="flex items-center justify-between p-3 rounded-lg shadow-sm bg-white border border-gray-100">
			<div className="flex flex-col gap-1.5 w-full">
				<div className="flex items-baseline gap-2">
					<Skeleton className="h-6 w-24" />
					<Skeleton className="h-3 w-12" />
				</div>

				<div className="flex items-center gap-2">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-3 w-10" />
				</div>
			</div>
			<Skeleton className="w-8 h-8 rounded-full shrink-0" />
		</div>
	);
}

export default function WidgetsSkeleton() {
	return (
		<div className="space-y-3 py-2">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold text-gray-700">
					📊 Portfolio Insights
				</h3>
                <Skeleton className="h-5 w-16 rounded-full" />
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2">
				{Array.from({ length: 7 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: strictly for display
					<WidgetCardSkeleton key={i} />
				))}
			</div>
		</div>
	);
}
