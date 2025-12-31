/** biome-ignore-all lint/suspicious/noExplicitAny: <iknow> */
import { Badge } from "@nepse-dashboard/ui/components/badge";
import { Card } from "@nepse-dashboard/ui/components/card";
import { Separator } from "@nepse-dashboard/ui/components/separator";
import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import {
	Tabs,
	TabsList,
	TabsTrigger,
} from "@nepse-dashboard/ui/components/tabs";
import { createLazyRoute, useRouteContext } from "@tanstack/react-router";
import {
	AlertTriangle,
	Calendar,
	CheckCircle2,
	Clock2,
	ReceiptText,
	User2,
} from "lucide-react";
import { memo, useMemo, useState } from "react";
import TimeAgo from "react-timeago";
import BackButton from "@/components/back-button/back-button";
import { LIST_HEIGHT } from "@/constants/app-config";
import { getAllIpos, getCurrentIssues } from "@/hooks/convex/use-ipo";
import { TAB_TRIGGER_STYLES } from "@/utils/tab-style";

const STATUS_COLORS = {
	Open: "bg-green-500/10 text-green-500 border-green-500/20",
	Closed: "bg-red-500/10 text-red-500 border-red-500/20",
	Nearing: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
	default: "bg-gray-500/10 text-gray-500 border-gray-500/20",
} as const;

// Utility functions
function getStatusColor(status: string) {
	return (
		STATUS_COLORS[status as keyof typeof STATUS_COLORS] ?? STATUS_COLORS.default
	);
}

function calculateSubscriptionMetrics(issued: number, applied: number) {
	if (issued <= 0) return { percentApplied: 0, oversub: 0 };
	return {
		percentApplied: Math.round((applied / issued) * 100),
		oversub: applied / issued,
	};
}

// Reusable components
const LoadingState = memo(() => (
	<div className="space-y-3 pb-3">
		{[1, 2, 3].map((i) => (
			<Card key={i} className="p-3">
				<Skeleton className="h-5 w-3/4 mb-2" />
				<Skeleton className="h-4 w-1/2 mb-3" />
				<Skeleton className="h-3 w-full mb-1" />
				<Skeleton className="h-3 w-2/3" />
			</Card>
		))}
	</div>
));
LoadingState.displayName = "LoadingState";

const EmptyState = memo(({ message }: { message: string }) => (
	<div className="flex items-center justify-center h-32 text-muted-foreground">
		<p>{message}</p>
	</div>
));
EmptyState.displayName = "EmptyState";

// Card components
const CurrentIssueCard = memo(({ issue }: { issue: any }) => {
	const issued = Number(issue.issuedUnit);
	const applied = Number(issue.appliedUnit);
	const { percentApplied, oversub } = calculateSubscriptionMetrics(
		issued,
		applied,
	);

	return (
		<Card className="p-3 bg-accent/20 hover:bg-accent/50 transition-colors">
			<div className="flex items-start justify-between gap-2 mb-2">
				<div className="flex-1 min-w-0">
					<h3 className="font-semibold text-sm truncate flex items-center gap-2">
						<User2 className="h-4 w-4 text-primary" />
						{issue.companyName}
					</h3>
					<p className="text-xs text-muted-foreground">
						Issue Manager:{" "}
						<span className="font-medium">{issue.issueManager}</span>
					</p>
				</div>
			</div>

			<Separator className="my-2" />

			<div className="grid grid-cols-2 gap-2 text-xs">
				<div>
					<span className="text-muted-foreground">Issued Units:</span>
					<span className="font-medium ml-1">{issued.toLocaleString()}</span>
				</div>
				<div>
					<span className="text-muted-foreground">Applied Units:</span>
					<span className="font-medium ml-1">{applied.toLocaleString()}</span>
				</div>
				<div>
					<span className="text-muted-foreground">Applications:</span>
					<span className="font-medium ml-1">
						{Number(issue.numberOfApplication).toLocaleString()}
					</span>
				</div>
				<div>
					<span className="text-muted-foreground">Amount:</span>
					<span className="font-medium ml-1">
						Rs.
						{issue.amount}
					</span>
				</div>
			</div>

			<Separator className="my-2" />

			<div className="flex items-center justify-between text-xs">
				<span className="text-muted-foreground flex items-center gap-1">
					<Calendar className="h-3 w-3" />
					Open:
				</span>
				<span className="font-medium">{issue.openDate}</span>
			</div>
			<div className="flex items-center justify-between text-xs">
				<span className="text-muted-foreground flex items-center gap-1">
					<Calendar className="h-3 w-3" />
					Close:
				</span>
				<span className="font-medium">{issue.closeDate}</span>
			</div>

			<div className="mt-2 text-right text-[10px] text-muted-foreground">
				Last Update: <TimeAgo date={issue.lastUpdate} live={true} />
			</div>

			<div className="mt-2 text-xs text-center font-semibold flex items-center justify-center gap-1">
				{oversub > 1 ? (
					<>
						<AlertTriangle className="inline-block h-4 w-4 text-red-600 mr-1" />
						<span className="text-red-600">
							Over subscribed by {oversub.toFixed(2)} times
						</span>
					</>
				) : (
					<>
						<CheckCircle2 className="inline-block h-4 w-4 text-green-600 mr-1" />
						<span className="text-green-600">
							{percentApplied}% of share applied
						</span>
					</>
				)}
			</div>
		</Card>
	);
});
CurrentIssueCard.displayName = "CurrentIssueCard";

const IPOCard = memo(({ ipo }: { ipo: any }) => (
	<Card className="p-3 bg-accent/20 hover:bg-accent/50 transition-colors">
		<div className="flex items-start justify-between gap-2 mb-2">
			<div className="flex-1 min-w-0">
				<h3 className="font-semibold text-sm truncate">{ipo.companyName}</h3>
				<p className="text-xs text-muted-foreground">
					{ipo.stockSymbol} •{ipo.shareType}
				</p>
			</div>
			<Badge
				variant="outline"
				className={`${getStatusColor(ipo.status)} text-xs shrink-0`}
			>
				{ipo.status}
			</Badge>
		</div>

		<Separator className="my-2" />

		<div className="space-y-1.5 text-xs">
			<div className="flex items-center justify-between">
				<span className="text-muted-foreground">Price/Unit:</span>
				<span className="font-medium flex items-center gap-1">
					Rs. {ipo.pricePerUnit}
				</span>
			</div>
			<div className="flex items-center justify-between">
				<span className="text-muted-foreground">Units:</span>
				<span className="font-medium">
					{Number(ipo.units).toLocaleString()}
				</span>
			</div>
			<div className="flex items-center justify-between">
				<span className="text-muted-foreground flex items-center gap-1">
					<Calendar className="h-3 w-3" />
					Opens:
				</span>
				<span className="font-medium">{ipo.openingDateBS}</span>
			</div>
			<div className="flex items-center justify-between">
				<span className="text-muted-foreground flex items-center gap-1">
					<Calendar className="h-3 w-3" />
					Closes:
				</span>
				<span className="font-medium">{ipo.closingDateBS}</span>
			</div>
		</div>

		{ipo.shareRegistrar && (
			<div className="mt-2 pt-2 border-t">
				<p className="text-xs text-muted-foreground">
					Registrar: <span className="font-medium">{ipo.shareRegistrar}</span>
				</p>
			</div>
		)}
	</Card>
));
IPOCard.displayName = "IPOCard";

function useTabData(tab: string) {
	const allIposQuery = getAllIpos();
	const currentIssuesQuery = getCurrentIssues();

	return tab === "current" ? currentIssuesQuery : allIposQuery;
}

export const Route = createLazyRoute("/ipo")({
	component: UpcomingIPO,
});

export default function UpcomingIPO() {
	const routeContext = useRouteContext({ strict: false });
	const [tab, setTab] = useState("current");

	const { data, isPending, error } = useTabData(tab);

	const listHeight = useMemo(
		() =>
			routeContext.fullscreen ? LIST_HEIGHT.FULLSCREEN : LIST_HEIGHT.NORMAL,
		[routeContext.fullscreen],
	);

	const content = useMemo(() => {
		if (isPending) return <LoadingState />;

		if (error) {
			const errorMessage =
				tab === "current"
					? "Failed to load Current Issues"
					: "Failed to load IPOs";
			return <EmptyState message={errorMessage} />;
		}

		if (!data || data.length === 0) {
			const emptyMessage =
				tab === "current" ? "No Current Issues available" : "No IPOs available";
			return <EmptyState message={emptyMessage} />;
		}

		return (
			<div className="space-y-3 pb-3">
				{tab === "current"
					? data.map((issue, idx) => (
							<CurrentIssueCard
								key={`${issue.companyName}-${idx}`}
								issue={issue}
							/>
						))
					: data.map((ipo) => <IPOCard key={ipo._id} ipo={ipo} />)}
			</div>
		);
	}, [isPending, error, data, tab]);

	return (
		<div className="w-full h-full flex flex-col">
			<div className="sticky top-0 z-10 bg-background p-1">
				<Tabs value={tab} onValueChange={setTab} className="w-full">
					<TabsList className="w-full grid grid-cols-2 gap-1">
						<TabsTrigger value="current" className={TAB_TRIGGER_STYLES}>
							<Clock2 className="w-4 h-4 shrink-0" />
							Current Issues
						</TabsTrigger>
						<TabsTrigger value="all" className={TAB_TRIGGER_STYLES}>
							<ReceiptText className="w-4 h-4 shrink-0" />
							All IPOs
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>
			<div
				style={{
					height: listHeight,
					scrollbarWidth: "none",
					msOverflowStyle: "none",
				}}
				className="overflow-y-auto overflow-x-hidden px-1"
			>
				{content}
			</div>
			<BackButton showBack={true} />
		</div>
	);
}
