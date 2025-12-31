import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import { Card, CardContent } from "@nepse-dashboard/ui/components/card";
import { ScrollArea } from "@nepse-dashboard/ui/components/scroll-area";
import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nepse-dashboard/ui/components/table";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@nepse-dashboard/ui/components/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@nepse-dashboard/ui/components/tooltip";
import { createLazyRoute, useRouter } from "@tanstack/react-router";
import { useAction } from "convex/react";
import { Info } from "lucide-react";
import { lazy, memo, Suspense, useCallback, useMemo, useState } from "react";
import TimeAgo from "react-timeago";
import { toast } from "sonner";
import BackButton from "@/components/back-button/back-button";
import { useIsMarketOpen } from "@/hooks/convex/useIndexStatus";
import { useSupplyDemandData } from "@/hooks/convex/useSupplyDemand";
import Loading from "../loading";

const LoadingFailed = lazy(() => import("@/components/loading-failed"));

const MarketClosed = lazy(() => import("@/components/market-closed"));

interface SupplyDemandTableRowProps {
	item: Doc<"supplyDemand">["highestSupply"][number];
}

interface RenderSDOrderTableComponentProps {
	data?: Doc<"supplyDemand">["highestQuantityperOrder"];
	isPending: boolean;
}

const LoadingRow = memo(() => (
	<TableRow>
		<TableCell>
			<Skeleton className="h-4 w-20" />
		</TableCell>
		<TableCell>
			<Skeleton className="h-4 w-16 mx-auto" />
		</TableCell>
		<TableCell>
			<Skeleton className="h-4 w-16 mx-auto" />
		</TableCell>
		<TableCell>
			<Skeleton className="h-4 w-16 mx-auto" />
		</TableCell>
	</TableRow>
));

LoadingRow.displayName = "LoadingRow";

const LoadingRows = memo(() => (
	<>
		{Array.from({ length: 10 })
			.fill(null)
			.map((_, index) => (
				<LoadingRow key={index} />
			))}
	</>
));

LoadingRows.displayName = "LoadingRows";

const SDOrderTableHeader = memo(() => (
	<TableHeader>
		<TableRow>
			<TableHead className="w-max">Symbol</TableHead>
			<Tooltip>
				<TooltipTrigger asChild>
					<TableHead className="text-center cursor-help">Qty : Order</TableHead>
				</TooltipTrigger>
				<TooltipContent>
					<p>Average quantity per order for the symbol</p>
				</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<TableHead className="text-center cursor-help">
						Buy : Sell Order
					</TableHead>
				</TooltipTrigger>
				<TooltipContent>
					<p>Ratio of buy orders to sell orders</p>
				</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger asChild>
					<TableHead className="text-center cursor-help">
						Buy : Sell Qty
					</TableHead>
				</TooltipTrigger>
				<TooltipContent>
					<p>Ratio of buy quantity to sell quantity</p>
				</TooltipContent>
			</Tooltip>
		</TableRow>
	</TableHeader>
));

SDOrderTableHeader.displayName = "SDOrderTableHeader";

const SupplyDemandTableHeader = memo(() => (
	<TableHeader>
		<TableRow>
			<TableHead className="w-max">Symbol</TableHead>
			<TableHead className="text-center">Total Qty</TableHead>
			<TableHead className="text-center">Total Orders</TableHead>
		</TableRow>
	</TableHeader>
));

SupplyDemandTableHeader.displayName = "SupplyDemandTableHeader";

export const Route = createLazyRoute("/supply-demand")({
	component: SupplyDemandTab,
});

export default function SupplyDemandTab() {
	const router = useRouter();

	const { data, isPending, error } = useSupplyDemandData();

	const handleFetch = useAction(api.supplyDemand.fetch);

	const isNepseOpen = useIsMarketOpen();

	const handleRefresh = useCallback(async () => {
		const response = await handleFetch();
		toast[response.success ? "success" : "error"](response.message);
	}, [handleFetch]);

	const [activeTab, setActiveTab] = useState<keyof Doc<"supplyDemand">>(
		"highestQuantityperOrder",
	);

	const handleTabChange = useCallback((value: string) => {
		setActiveTab(value as keyof Doc<"supplyDemand">);
	}, []);

	const SupplyDemandTableRow = memo(({ item }: SupplyDemandTableRowProps) => {
		return (
			<TableRow
				onClick={() =>
					router.navigate({
						to: "/company-details",
						search: { symbol: item.symbol },
					})
				}
				className="border-b border-gray-200 dark:border-gray-700 cursor-pointer"
			>
				<TableCell className="font-medium">{item.symbol}</TableCell>
				<TableCell className="text-center">{item.totalQuantity}</TableCell>
				<TableCell className="text-center">{item.totalOrder}</TableCell>
			</TableRow>
		);
	});

	SupplyDemandTableRow.displayName = "SupplyDemandTableRow";

	interface SDOrderTableRowProps {
		item: Doc<"supplyDemand">["highestQuantityperOrder"][number];
	}

	const SDOrderTableRow = memo(({ item }: SDOrderTableRowProps) => {
		return (
			<TableRow
				onClick={() =>
					router.navigate({
						to: "/company-details",
						search: { symbol: item.symbol },
					})
				}
				className="border-b border-gray-200 dark:border-gray-700 cursor-pointer"
			>
				<TableCell className="font-medium">{item.symbol}</TableCell>
				<TableCell className="text-center">
					{item.buyQuantityPerOrder}
				</TableCell>
				<TableCell className="text-center">
					{item.buyToSellOrderRatio}
				</TableCell>
				<TableCell className="text-center">
					{item.buyToSellQuantityRatio}
				</TableCell>
			</TableRow>
		);
	});

	SDOrderTableRow.displayName = "SDOrderTableRow";

	const renderSDOrderTable = useMemo(() => {
		function RenderSDOrderTableComponent({
			data,
			isPending,
		}: RenderSDOrderTableComponentProps) {
			return (
				<ScrollArea className="h-[420px]">
					<Table>
						<SDOrderTableHeader />
						<TableBody>
							{isPending ? (
								<LoadingRows />
							) : (
								data?.map((item) => (
									<SDOrderTableRow key={item.symbol} item={item} />
								))
							)}
						</TableBody>
					</Table>
				</ScrollArea>
			);
		}

		return RenderSDOrderTableComponent;
	}, [SDOrderTableRow]);

	interface RenderSupplyDemandTableComponentProps {
		data?: Doc<"supplyDemand">["highestSupply"];
		isPending: boolean;
	}

	const renderSupplyDemandTable = useMemo(() => {
		function RenderSupplyDemandTableComponent({
			data,
			isPending,
		}: RenderSupplyDemandTableComponentProps) {
			return (
				<ScrollArea className="h-[420px]">
					<Table>
						<SupplyDemandTableHeader />
						<TableBody>
							{isPending ? (
								<LoadingRows />
							) : (
								data?.map((item) => (
									<SupplyDemandTableRow key={item.symbol} item={item} />
								))
							)}
						</TableBody>
					</Table>
				</ScrollArea>
			);
		}

		return RenderSupplyDemandTableComponent;
	}, [SupplyDemandTableRow]);

	if (!isNepseOpen) {
		return (
			<Suspense fallback={<Loading />}>
				<MarketClosed />
			</Suspense>
		);
	}

	if (
		error ||
		(!isPending && !data) ||
		(!isPending &&
			data &&
			(!data.highestQuantityperOrder ||
				!data.highestSupply ||
				!data.highestDemand))
	) {
		return (
			<Suspense fallback={<Loading />}>
				<LoadingFailed onReload={handleRefresh} />
			</Suspense>
		);
	}

	return (
		<Card className="p-1">
			<CardContent>
				<Tabs value={activeTab} onValueChange={handleTabChange}>
					<TabsList className="w-full mb-2">
						<TabsTrigger
							value="highestQuantityperOrder"
							className="flex-1 bg-gray-100 dark:bg-zinc-800 data-[state=active]:bg-gray-300 dark:data-[state=active]:bg-zinc-600"
						>
							Quantity/ Order
						</TabsTrigger>
						<TabsTrigger
							value="highestDemand"
							className="flex-1 bg-gray-100 dark:bg-zinc-800 data-[state=active]:bg-gray-300 dark:data-[state=active]:bg-zinc-600"
						>
							Demand
						</TabsTrigger>
						<TabsTrigger
							value="highestSupply"
							className="flex-1 bg-gray-100 dark:bg-zinc-800 data-[state=active]:bg-gray-300 dark:data-[state=active]:bg-zinc-600"
						>
							Supply
						</TabsTrigger>
					</TabsList>
					<TabsContent value="highestQuantityperOrder">
						{renderSDOrderTable({
							data: data?.highestQuantityperOrder,
							isPending,
						})}
					</TabsContent>
					<TabsContent value="highestSupply">
						{renderSupplyDemandTable({
							data: data?.highestSupply,
							isPending,
						})}
					</TabsContent>
					<TabsContent value="highestDemand">
						{renderSupplyDemandTable({
							data: data?.highestDemand,
							isPending,
						})}
					</TabsContent>
				</Tabs>
			</CardContent>
			<div className="flex items-center px-2 py-1 relative">
				<p className="text-xs text-gray-400">
					Updated:{" "}
					<TimeAgo
						date={
							data?._creationTime ? new Date(data._creationTime) : new Date()
						}
						live={true}
					/>
				</p>
				<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center">
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="cursor-help p-2">
								<Info className="h-4 w-4 text-muted-foreground" />
							</div>
						</TooltipTrigger>
						<TooltipContent
							className="text-center"
							style={{ maxWidth: "300px", whiteSpace: "normal" }}
						>
							<p>
								Order data is derived from visible market depth orders and
								serves as a directional estimate.
							</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
			<BackButton showBack={true} onRefresh={handleRefresh} />
		</Card>
	);
}
