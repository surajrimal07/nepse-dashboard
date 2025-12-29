import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { Card, CardContent } from "@nepse-dashboard/ui/components/card";
import { ScrollArea } from "@nepse-dashboard/ui/components/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@nepse-dashboard/ui/components/tooltip";
import { useAction } from "convex/react";
import { ArrowDownIcon, ArrowUpIcon, BarChart3Icon, Info } from "lucide-react";
import { lazy, useCallback, useMemo } from "react";
import TimeAgo from "react-timeago";
import { useShallow } from "zustand/react/shallow";
import BackButton from "@/components/back-button/back-button";
import Loading from "@/components/loading";
import { useCompanyDepth } from "@/hooks/convex/use-depth";
import { useCompanyList } from "@/hooks/convex/useCompanyList";
import { useIsMarketOpen } from "@/hooks/convex/useIndexStatus";
import {
	selectMarketDepthStock,
	selectSetMarketDepthSymbol,
} from "@/selectors/dashboard-selector";
import { selectAddDepthSymbol } from "@/selectors/sidepanel-selectors";
import { useDashboardState } from "@/state/dashboard-state";
import { useSidebarDashboardState } from "@/state/sidepanel-state";
import type { Company } from "@/types/company-types";

const SelectCompany = lazy(
	() => import("@/components/market-depth/select-company"),
);
const MarketClosed = lazy(() => import("@/components/market-closed"));

const LoadingFailed = lazy(() => import("@/components/loading-failed"));

interface MarketDepthCoreProps {
	symbol?: string | null;
	sidepanel?: boolean;
	widgetId?: string;
}

// Core component that accepts props directly
export default function MarketDepthCore(props: MarketDepthCoreProps) {
	const { symbol, sidepanel, widgetId } = props;
	const { useStateItem, callAction } = useAppState();

	const [tmsUrl] = useStateItem("tmsUrl");
	const fetchMarketDepth = useAction(api.marketDepth.fetchMarketDepth);

	const { marketDepthStockinPopup, setMarketDepthSymbolinPopup } =
		useDashboardState(
			useShallow((state) => ({
				marketDepthStockinPopup: selectMarketDepthStock(state),
				setMarketDepthSymbolinPopup: selectSetMarketDepthSymbol(state),
			})),
		);
	const allCompanies = useCompanyList();

	const setMarketDepthSymbolinSidepanel =
		useSidebarDashboardState(selectAddDepthSymbol);

	const isNepseOpen = useIsMarketOpen();

	// Use a memoized value for the current company
	const currentCompany = useMemo(() => {
		return sidepanel ? symbol : marketDepthStockinPopup;
	}, [symbol, sidepanel, marketDepthStockinPopup]);

	// get matched company from current company
	const matchedCompany = useMemo(() => {
		if (currentCompany && allCompanies?.data) {
			return allCompanies.data.find((c) => c.symbol === currentCompany);
		}
		return null;
	}, [currentCompany, allCompanies]);

	// Calculate whether to show SelectCompany instead of market depth
	const shouldShowSelectCompany = useMemo(() => {
		if (!sidepanel && !marketDepthStockinPopup) {
			return true;
		}
		if (sidepanel && !symbol) {
			return true;
		}
		return false;
	}, [sidepanel, marketDepthStockinPopup, symbol]);

	// Define the current symbol - guaranteed to be string when shouldShowSelectCompany is false
	const currentSymbol = useMemo(() => {
		return (sidepanel ? symbol : marketDepthStockinPopup) as string;
	}, [sidepanel, symbol, marketDepthStockinPopup]);

	//call covex action to say fetch the depth again
	const handleRefresh = useCallback(async () => {
		if (!currentSymbol) {
			return;
		}
		await fetchMarketDepth({ symbol: currentSymbol });
	}, [currentSymbol, fetchMarketDepth]);

	// Handle company selection
	const handleCompanySelect = useCallback(
		async (selectedCompany: Company) => {
			if (sidepanel && widgetId) {
				await setMarketDepthSymbolinSidepanel(widgetId, selectedCompany.symbol);
			} else {
				setMarketDepthSymbolinPopup(selectedCompany.symbol);
			}

			callAction("addMarketDepthStock", selectedCompany.symbol).then(
				handleActionResult,
			);
		},
		[
			sidepanel,
			widgetId,
			callAction,
			setMarketDepthSymbolinPopup,
			setMarketDepthSymbolinSidepanel,
		],
	);

	// Handle buy button
	const handleBuy = useCallback(() => {
		if (tmsUrl && currentSymbol) {
			callAction("openTradePage", currentSymbol, "Buy").then(
				handleActionResult,
			);
		}
	}, [tmsUrl, currentSymbol]);

	// Handle sell button
	const handleSell = useCallback(() => {
		if (tmsUrl && currentSymbol) {
			callAction("openTradePage", currentSymbol, "Sell").then(
				handleActionResult,
			);
		}
	}, [tmsUrl, currentSymbol]);

	// now we know current symbol is defined
	const {
		data: marketDepthData,
		isPending,
		error: depthError,
	} = useCompanyDepth(currentSymbol);

	const maxQuantity = useMemo(() => {
		if (!marketDepthData) return 0;

		return marketDepthData.marketDepth.buyMarketDepthList.length > 0 ||
			marketDepthData.marketDepth.sellMarketDepthList.length > 0
			? Math.max(
					...marketDepthData.marketDepth.buyMarketDepthList.map(
						(item) => item.quantity,
					),
					...marketDepthData.marketDepth.sellMarketDepthList.map(
						(item) => item.quantity,
					),
				)
			: 0;
	}, [marketDepthData]);

	const allPrices = useMemo(() => {
		if (!marketDepthData) return [];
		return [
			...marketDepthData.marketDepth.buyMarketDepthList,
			...marketDepthData.marketDepth.sellMarketDepthList,
		].sort((a, b) => b.orderBookOrderPrice - a.orderBookOrderPrice);
	}, [marketDepthData]);

	const { buyerPercentage, sellerPercentage } = useMemo(() => {
		if (!marketDepthData) {
			return { totalQuantity: 0, buyerPercentage: 0, sellerPercentage: 0 };
		}

		const total = marketDepthData.totalBuyQty + marketDepthData.totalSellQty;

		return {
			totalQuantity: total,
			buyerPercentage:
				total > 0 ? (marketDepthData.totalBuyQty / total) * 100 : 0,
			sellerPercentage:
				total > 0 ? (marketDepthData.totalSellQty / total) * 100 : 0,
		};
	}, [marketDepthData]);

	if (!isNepseOpen) {
		return (
			<Suspense fallback={<Loading />}>
				<MarketClosed />
			</Suspense>
		);
	}

	if (shouldShowSelectCompany) {
		return (
			<Suspense fallback={<Loading />}>
				<SelectCompany onSelectCompany={handleCompanySelect} />
			</Suspense>
		);
	}

	// TypeScript now knows currentSymbol is not null after this point
	if (!currentSymbol) {
		return (
			<Suspense fallback={<Loading />}>
				<SelectCompany onSelectCompany={handleCompanySelect} />
			</Suspense>
		);
	}

	if (isPending) {
		return <Loading />;
	}

	if (!marketDepthData || depthError) {
		return (
			<Suspense fallback={<Loading />}>
				<LoadingFailed />
			</Suspense>
		);
	}

	return (
		<Card className="w-full">
			<CardContent className="space-y-2">
				<div className="text-base text-left ml-2 border-b border-gray-200 mb-1">
					{matchedCompany?.symbol} (Rs
					{matchedCompany?.closePrice} / Rs{" "}
					<span
						className={
							(matchedCompany?.change ?? 0) >= 0
								? "text-green-500"
								: "text-red-500"
						}
					>
						{matchedCompany?.change}
					</span>{" "}
					/{" "}
					<span
						className={
							(matchedCompany?.percentageChange ?? 0) >= 0
								? "text-green-500"
								: "text-red-500"
						}
					>
						{matchedCompany?.percentageChange}%
					</span>
					)
				</div>
				<div className="flex justify-between text-sm">
					<div className="flex items-center">
						<ArrowUpIcon className="w-4 h-4 mr-1 text-green-400" />
						<span>
							Buy:
							{marketDepthData.totalBuyQty.toLocaleString()}
						</span>
					</div>
					<div className="flex items-center">
						<ArrowDownIcon className="w-4 h-4 mr-1 text-red-400" />
						<span>
							Sell:
							{marketDepthData.totalSellQty.toLocaleString()}
						</span>
					</div>
				</div>
				<div className="flex justify-between text-xs font-semibold">
					<span>Quantity</span>
					<span>Price</span>
				</div>
				<div className="border border-gray-200 rounded-md">
					<ScrollArea className="h-[218px] w-full">
						<div className="space-y-1 p-2">
							{allPrices.map((item) => (
								<div
									key={`${currentSymbol || ""}-${item.orderBookOrderPrice}-${item.buy ? "buy" : "sell"}`}
									className="flex text-xs items-center w-full"
								>
									<div className="w-16 text-left">{item.quantity}</div>
									<div className="h-4 grow bg-gray-700 relative">
										<div
											className={`h-full absolute ${item.buy ? "bg-green-500" : "bg-red-500"}`}
											style={{
												width: `${(item.quantity / maxQuantity) * 100}%`,
											}}
										/>
									</div>
									<div className="w-16 text-right">
										{item.orderBookOrderPrice.toFixed(2)}
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
				</div>
				<div className="grid grid-cols-2 gap-2 text-xs mt-4 border-t border-gray-200 pt-4">
					<div>
						<h3 className="font-semibold mb-1 text-green-400">Buy Orders</h3>
						<table className="w-full">
							<thead>
								<tr>
									<th className="text-left">Price</th>
									<th className="text-right">Qty</th>
									<th className="text-right">Orders</th>
								</tr>
							</thead>
							<tbody>
								{marketDepthData.marketDepth.buyMarketDepthList.map((item) => (
									<tr
										key={`buy-${item.orderBookOrderPrice}-${item.quantity}-${item.orderCount}`}
									>
										<td>{item.orderBookOrderPrice.toFixed(2)}</td>
										<td className="text-right">{item.quantity}</td>
										<td className="text-right">{item.orderCount}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div>
						<h3 className="font-semibold mb-1 text-red-400">Sell Orders</h3>
						<table className="w-full">
							<thead>
								<tr>
									<th className="text-left">Price</th>
									<th className="text-right">Qty</th>
									<th className="text-right">Orders</th>
								</tr>
							</thead>
							<tbody>
								{marketDepthData.marketDepth.sellMarketDepthList.map((item) => (
									<tr
										key={`sell-${item.orderBookOrderPrice}-${item.quantity}-${item.orderCount}`}
									>
										<td>{item.orderBookOrderPrice.toFixed(2)}</td>
										<td className="text-right">{item.quantity}</td>
										<td className="text-right">{item.orderCount}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</CardContent>
			<div className="border-t mt-2 border-gray-200 pt-2 space-y-2">
				<div className="flex items-center space-x-2 text-xs">
					<BarChart3Icon className="w-4 h-4" />
					<div className="grow h-4 bg-gray-100 rounded-full overflow-hidden flex">
						<div
							className="h-full bg-green-500 flex items-center justify-end pr-1 text-white"
							style={{ width: `${buyerPercentage}%` }}
						>
							{`${buyerPercentage.toFixed(1)}%`}
						</div>
						<div
							className="h-full bg-red-500 flex items-center justify-start pl-1 text-white"
							style={{ width: `${sellerPercentage}%` }}
						>
							{`${sellerPercentage.toFixed(1)}%`}
						</div>
					</div>
				</div>
			</div>
			<div className="flex items-center px-2 py-1 relative">
				<p className="text-xs text-gray-400">
					Updated: <TimeAgo date={marketDepthData.timeStamp} live={true} />
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
								Buy Sell data is derived from visible market depth orders and
								serves as a directional estimate. Please make sure to check the
								actual market conditions before making any trading decisions.
							</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>

			<BackButton
				// onRefresh={handleRefresh}
				switchButton={async () => {
					if (currentSymbol) {
						callAction("removeMarketDepthStock", currentSymbol).then(
							handleActionResult,
						);
					}

					if (sidepanel && widgetId) {
						setMarketDepthSymbolinSidepanel(widgetId, null);
					} else {
						setMarketDepthSymbolinPopup(null);
					}
				}}
				showBuy={tmsUrl ? handleBuy : undefined}
				showSell={tmsUrl ? handleSell : undefined}
				onRefresh={handleRefresh}
			/>
		</Card>
	);
}
