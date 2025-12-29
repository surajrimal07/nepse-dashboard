import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import { createLazyRoute, useRouteContext } from "@tanstack/react-router";
import { memo, useId, useMemo } from "react";
import { useCompanyList } from "@/hooks/convex/useCompanyList";
import { useHighCaps } from "@/hooks/convex/useHighCaps";
import BackButton from "../back-button/back-button";

const LIST_HEIGHT = 535;
const LIST_HEIGHT_FULLSCREEN = 940;

function getChangeColor(change: number | null): string {
	if (!change) return "text-gray-600";
	if (change > 0) return "text-green-600 bg-green-900/20";
	if (change < 0) return "text-red-600 bg-red-900/20";
	return "text-gray-600";
}

const LoadingSkeleton = memo(() => {
	const baseId = useId();

	return (
		<div className="bg-gray-800/50 rounded mt-2 p-3">
			<div className="text-sm font-medium text-gray-400 mb-2">
				TOP COMPANIES
			</div>
			<div className="space-y-2">
				{Array.from({ length: 15 }, (_) => (
					<div key={baseId} className="grid grid-cols-6 gap-2 items-center">
						<Skeleton className="h-4 w-16 col-span-2" />
						<Skeleton className="h-4 w-12" />
						<Skeleton className="h-4 w-12" />
						<Skeleton className="h-4 w-12" />
						<Skeleton className="h-4 w-12" />
					</div>
				))}
			</div>
		</div>
	);
});

LoadingSkeleton.displayName = "LoadingSkeleton";

const EmptyState = memo(() => (
	<div className="bg-gray-800/50 rounded mt-2 p-3">
		<div className="text-sm font-medium text-gray-400 mb-2">TOP COMPANIES</div>
		<div className="text-sm text-gray-500">No data available</div>
	</div>
));

EmptyState.displayName = "EmptyState";

type CompanyRowProps = {
	company: {
		symbol: string;
		name?: string;
		ltp: number | null;
		volume?: number | null;
		pointchange: number | null;
		percentchange: number | null;
	};
};

const CompanyRow = memo(({ company }: CompanyRowProps) => {
	const pointChangeColor = useMemo(
		() => getChangeColor(company.pointchange),
		[company.pointchange],
	);
	const percentChangeColor = useMemo(
		() => getChangeColor(company.percentchange),
		[company.percentchange],
	);

	const formattedValues = useMemo(
		() => ({
			ltp:
				company.ltp !== null && company.ltp !== undefined
					? company.ltp.toFixed(2)
					: "N/A",
			pointChange:
				company.pointchange !== null && company.pointchange !== undefined
					? company.pointchange.toFixed(2)
					: "N/A",
			volume:
				company.volume !== undefined && company.volume !== null
					? company.volume.toLocaleString()
					: "N/A",
			percentChange:
				company.percentchange !== undefined && company.percentchange !== null
					? `${company.percentchange.toFixed(2)}%`
					: "N/A",
		}),
		[company.ltp, company.pointchange, company.percentchange, company.volume],
	);

	return (
		<div className="grid grid-cols-6 gap-2 items-center py-1">
			<div className="col-span-2">
				<div className="text-sm font-medium truncate" title={company.name}>
					{company.symbol}
				</div>
			</div>
			<span className="text-sm text-right">{formattedValues.ltp}</span>
			<span className="text-sm text-right">{formattedValues.volume}</span>
			<span
				className={`text-sm text-right font-medium px-1 rounded ${pointChangeColor}`}
			>
				{formattedValues.pointChange}
			</span>
			<span className={`text-sm text-right px-1 rounded ${percentChangeColor}`}>
				{formattedValues.percentChange}
			</span>
		</div>
	);
});

CompanyRow.displayName = "CompanyRow";

export const Route = createLazyRoute("/high-caps")({
	component: HighCaps,
});

export default function HighCaps() {
	const routeContext = useRouteContext({ strict: false });

	const {
		data: highCaps,
		isPending: isHighCapsPending,
		error: highCapsError,
	} = useHighCaps();
	const {
		data: companyList,
		isPending: isCompanyListPending,
		error: companyListError,
	} = useCompanyList();

	const listHeight = useMemo(
		() => (routeContext.fullscreen ? LIST_HEIGHT_FULLSCREEN : LIST_HEIGHT),
		[routeContext.fullscreen],
	);

	const enrichedCompanies = useMemo(() => {
		if (!highCaps || !companyList) return [];
		// Use a Map for O(1) lookups
		const companyMap = new Map<string, Doc<"company">>();
		for (const c of companyList) {
			companyMap.set(c.symbol, c);
		}
		// Enrich and limit to top 20
		return highCaps.map((highcap: Doc<"highcaps">) => {
			const company = companyMap.get(highcap.symbol);
			return {
				symbol: highcap.symbol,
				name: company?.securityName ?? highcap.symbol,
				ltp: company?.closePrice ?? null,
				volume: highcap.volume ?? null,
				pointchange: company?.change ?? null,
				percentchange: company?.percentageChange ?? null,
			};
		});
	}, [highCaps, companyList]);

	if (isHighCapsPending || isCompanyListPending) {
		return <LoadingSkeleton />;
	}
	if (highCapsError || companyListError || !highCaps || !companyList) {
		return <EmptyState />;
	}

	return (
		<div
			className="bg-background rounded pr-1 pb-1 pl-1 overflow-y-auto scrollbar-hide"
			style={{ maxHeight: listHeight }}
		>
			<div className="sticky top-0 left-0 right-0 z-20 bg-background pb-1 border-b border-gray-600">
				<div className="text-sm font-medium text-gray-400 pt-2 px-1">
					TOP COMPANIES BY MARKET CAP
				</div>
				<div className="text-xs font-medium text-gray-500 grid grid-cols-6 gap-2 px-1 pt-1 pb-1">
					<span className="col-span-2">SYMBOL</span>
					<span className="text-right">LTP</span>
					<span className="text-right">VOLUME</span>
					<span className="text-right">CHANGE</span>
					<span className="text-right">CH%</span>
				</div>
			</div>

			<div className="space-y-1">
				{enrichedCompanies.map((company, index) => (
					<CompanyRow key={`${company.symbol}-${index}`} company={company} />
				))}
			</div>
			<BackButton showBack={true} />
		</div>
	);
}
