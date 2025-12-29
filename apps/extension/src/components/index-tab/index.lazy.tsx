import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import { createLazyRoute } from "@tanstack/react-router";
import { lazy, memo, useMemo } from "react";
import BackButton from "@/components/back-button/back-button";
import { useIndexesData } from "@/hooks/convex/useIndexData";
import Loading from "../loading";

const LoadingFailed = lazy(() => import("@/components/loading-failed"));

export const Route = createLazyRoute("/market-indices")({
	component: MarketIndices,
});

function getChangeColor(change: number): string {
	if (change > 0) return "text-green-600 bg-green-900/20";
	if (change < 0) return "text-red-600 bg-red-900/20";
	return "text-gray-600";
}

const DataCell = memo(
	({
		isLoading,
		value,
		className = "text-sm text-right",
		changeValue,
	}: {
		isLoading: boolean;
		value: string | number;
		className?: string;
		changeValue?: number;
	}) => {
		if (isLoading) {
			return <Skeleton className="h-4 w-12 ml-auto" />;
		}

		const colorClass =
			changeValue !== undefined ? getChangeColor(changeValue) : "";

		return <span className={`${className} ${colorClass}`}>{value}</span>;
	},
);

DataCell.displayName = "DataCell";

const excludedIndices = ["NEPSE Index"];

export default function MarketIndices() {
	const { data, isPending, error } = useIndexesData();

	const filteredIndices = useMemo(
		() => data?.filter((item) => !excludedIndices.includes(item.index)) || [],
		[data],
	);

	const nepseData = useMemo(() => {
		return data?.find((item) => item.index === "NEPSE Index");
	}, [data]);

	if (error) {
		return (
			<Suspense fallback={<Loading />}>
				<LoadingFailed />
			</Suspense>
		);
	}

	if (!data || data.length === 0) {
		return (
			<Suspense fallback={<Loading />}>
				<LoadingFailed />
			</Suspense>
		);
	}

	return (
		<div className="w-full overflow-hidden">
			<div className="grid grid-cols-1 gap-1">
				<div className="rounded bg-background mt-1 p-1">
					<div className="text-sm font-medium text-gray-400 mb-1 grid grid-cols-5">
						<span className="col-span-2">INDICES</span>
						<span className="text-right">CH</span>
						<span className="text-right">CH%</span>
						<span className="text-right">Rs</span>
					</div>

					<div className="grid grid-cols-5 items-center py-1">
						<span className="text-sm col-span-2 truncate" title="NEPSE Index">
							NEPSE Index
						</span>
						<DataCell
							isLoading={isPending}
							value={nepseData?.change.toString() || "N/A"}
							changeValue={nepseData?.change}
						/>
						<DataCell
							isLoading={isPending}
							value={`${nepseData?.percentageChange.toString() || "N/A"}%`}
							changeValue={nepseData?.percentageChange}
						/>
						<DataCell
							isLoading={isPending}
							value={nepseData?.turnover || "N/A"}
						/>
					</div>
				</div>

				<div className="bg-background rounded mt-1 p-1">
					<div className="text-sm font-medium text-gray-400 mb-1 grid grid-cols-5">
						<span className="col-span-2">SUB INDICES</span>
						<span className="text-right">CH</span>
						<span className="text-right">CH%</span>
						<span className="text-right">Rs</span>
					</div>
					{filteredIndices.map((item) => {
						return (
							<div
								key={item.index}
								className="grid grid-cols-5 items-center py-1"
							>
								<span
									className="text-sm col-span-2 truncate"
									title={item.index}
								>
									{item.index}
								</span>
								<DataCell
									isLoading={isPending}
									value={item.change.toString() || "N/A"}
									changeValue={item.change}
								/>
								<DataCell
									isLoading={isPending}
									value={`${item.percentageChange.toString() || "N/A"}%`}
									changeValue={item.percentageChange}
								/>
								<DataCell
									isLoading={isPending}
									value={item.turnover || "N/A"}
								/>
							</div>
						);
					})}
				</div>
			</div>
			<BackButton showBack={true} />
		</div>
	);
}
