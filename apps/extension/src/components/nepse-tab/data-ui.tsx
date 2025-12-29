import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import { lazy, memo } from "react";
import { useIndexData } from "@/hooks/convex/useIndexData";
import Loading from "../loading";

const LoadingFailed = lazy(() => import("@/components/loading-failed"));

interface MetricBoxProps {
	label: string;
	value: string;
	isLoading: boolean;
}

const MetricBox = memo(({ label, value, isLoading }: MetricBoxProps) => (
	<div className="bg-zinc-800/50 p-2 rounded-lg transition-all duration-200 hover:bg-zinc-700/50 hover:scale-[1.02] hover:shadow-lg cursor-default">
		<div className="text-gray-400/60 text-xs mb-0.5">{label}</div>
		{isLoading ? (
			<Skeleton className="h-6 w-24 bg-zinc-700/50" />
		) : (
			<div className="text-base font-medium truncate">{value}</div>
		)}
	</div>
));

MetricBox.displayName = "MetricBox";

const IndexDataComponent = memo(() => {
	const { data, isPending, error } = useIndexData();

	if ((!isPending && !data) || error) {
		return (
			<Suspense fallback={<Loading />}>
				<LoadingFailed />
			</Suspense>
		);
	}

	return (
		<div className="grid grid-cols-2 gap-1.5 mt-1">
			<MetricBox
				label="OPEN"
				value={data?.open.toString() ?? "-"}
				isLoading={isPending}
			/>
			<MetricBox
				label="HIGH"
				value={data?.high.toString() ?? "-"}
				isLoading={isPending}
			/>
			<MetricBox
				label="LOW"
				value={data?.low.toString() ?? "-"}
				isLoading={isPending}
			/>
			<MetricBox
				label="TURNOVER"
				value={data?.turnover ?? "-"}
				isLoading={isPending}
			/>
			<MetricBox
				label="SHARES TRADED"
				value={data?.totalTradedShared.toString() ?? "-"}
				isLoading={isPending}
			/>
			<MetricBox
				label="TRANSACTIONS"
				value={data?.totalTransactions?.toString() ?? "-"}
				isLoading={isPending}
			/>
			<MetricBox
				label="SCRIPT TRADED"
				value={data?.totalScripsTraded?.toString() ?? "-"}
				isLoading={isPending}
			/>
			<MetricBox
				label="P CLOSE"
				value={data?.previousClose?.toString() ?? "-"}
				isLoading={isPending}
			/>
		</div>
	);
});

IndexDataComponent.displayName = "NepseIndexDataUI";

export default IndexDataComponent;
