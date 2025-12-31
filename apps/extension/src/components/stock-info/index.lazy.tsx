import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { Card } from "@nepse-dashboard/ui/components/card";
import { Separator } from "@nepse-dashboard/ui/components/separator";
import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@nepse-dashboard/ui/components/tabs";
import { createLazyRoute, useRouteContext } from "@tanstack/react-router";
import { useAction } from "convex/react";
import { Globe, Mail, User } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect } from "react";
import { toast } from "sonner";
import BackButton from "@/components/back-button/back-button";
import Loading from "@/components/loading";
import { useGetCompany } from "@/hooks/convex/useCompanyList";
import { handleActionResult } from "@/hooks/handle-action";
import { useAppState } from "@/hooks/use-app";
import { companyDetailsRoute } from "@/routes";
import { calculatePricePosition } from "@/utils/utils";
import { toDate, truncate } from "./utils";

const LoadingFailed = lazy(() => import("@/components/loading-failed"));

export const Route = createLazyRoute("/company-details")({
	component: CompanyInfo,
});

export default function CompanyInfo() {
	const { callAction } = useAppState();
	const routeContext = useRouteContext({ strict: false });

	const search = companyDetailsRoute.useSearch();
	const { symbol } = search;

	const handleFetch = useAction(api.company.fetchCompanyDetails);
	const { data, isPending: loading, error } = useGetCompany(symbol);

	const handleFetchCompanyData = useCallback(async () => {
		const result = await handleFetch({ symbol });
		toast[result.success ? "success" : "error"](result.message);
	}, [symbol, handleFetch]);

	async function showChart() {
		callAction("handleVisitChart", symbol).then(handleActionResult);
	}

	useEffect(() => {
		handleFetchCompanyData();
	}, [handleFetchCompanyData]);

	const handleLinkClick = useCallback((url: string) => {
		window.open(url, "_blank");
	}, []);

	if (!data || error) {
		if (loading) {
			return <Loading />;
		}
		return (
			<Suspense fallback={<Loading />}>
				<LoadingFailed
					onReload={handleFetchCompanyData}
					reason="Failed to load company details. Please try again."
				/>
			</Suspense>
		);
	}

	const dailyRange = data.highPrice - data.lowPrice;
	const dailyRangePercent = (dailyRange / data.openPrice) * 100 || 0;

	// Helper renderers for each section
	const renderTrading = () => (
		<>
			<Card className="p-2">
				<div className="grid grid-cols-6 gap-2 text-sm">
					{/* First row */}
					<div className="col-span-2">
						<p className="text-sm text-muted-foreground">Open</p>
						{loading ? (
							<Skeleton className="h-6 w-full" />
						) : (
							<p className="text-lg font-semibold">{data.openPrice}</p>
						)}
					</div>
					<div className="col-span-2">
						<p className="text-sm text-muted-foreground">High</p>
						{loading ? (
							<Skeleton className="h-6 w-full" />
						) : (
							<p className="text-lg font-semibold">
								Rs
								{data.highPrice}
							</p>
						)}
					</div>
					<div className="row-span-2 col-span-2 flex flex-col items-center">
						<p className="text-sm text-muted-foreground">Candlestick</p>
						<div className="relative h-32 w-12  mt-1">
							{loading ? (
								<Skeleton className="h-full w-full" />
							) : (
								<>
									<div
										className="absolute w-3 bg-primary rounded-sm"
										style={{
											height: `${Math.abs(
												((data.closePrice - data.openPrice) / dailyRange) * 100,
											)}%`,
											top: `${Math.min(
												((data.highPrice -
													Math.max(data.openPrice, data.closePrice)) /
													dailyRange) *
													100,
												100,
											)}%`,
											left: "50%",
											transform: "translateX(-50%)",
											backgroundColor:
												data.closePrice > data.openPrice ? "green" : "red",
										}}
									/>
									<div
										className="absolute w-px bg-white"
										style={{
											height: `${((data.highPrice - data.lowPrice) / dailyRange) * 100}%`,
											top: "0%",
											left: "50%",
											transform: "translateX(-50%)",
										}}
									/>
								</>
							)}
						</div>
					</div>
					{/* Second row */}
					<div className="col-span-2">
						<p className="text-sm text-muted-foreground">Low</p>
						{loading ? (
							<Skeleton className="h-6 w-full" />
						) : (
							<p className="text-lg font-semibold">
								Rs
								{data.lowPrice}
							</p>
						)}
					</div>
					<div className="col-span-2">
						<p className="text-sm text-muted-foreground">Close</p>
						{loading ? (
							<Skeleton className="h-6 w-full" />
						) : (
							<p
								className={`text-lg font-semibold ${data.closePrice < data.openPrice ? "text-red-500" : "text-green-500"}`}
							>
								Rs {data.closePrice}
							</p>
						)}
					</div>
					<div className="col-span-3">
						<p className="text-sm ">Daily Range</p>
						{loading ? (
							<Skeleton className="h-6 w-full" />
						) : (
							<p className="text-lg font-semibold flex items-center gap-2">
								Rs {dailyRange.toFixed(2)}
								<span className="text-sm text-muted-foreground">
									({dailyRangePercent.toFixed(2)}
									%)
								</span>
							</p>
						)}
					</div>
				</div>
			</Card>
			<Card className="p-2">
				<div className="text-sm space-y-2">
					<div className="flex justify-between items-center">
						<div>52W Range</div>
						<div className="text-muted-foreground text-xs">
							{loading ? (
								<Skeleton className="h-4 w-20" />
							) : (
								`Current: ${data.closePrice}`
							)}
						</div>
					</div>
					<div className="relative h-2 bg-muted rounded-full">
						{loading ? (
							<Skeleton className="h-full w-full" />
						) : (
							<div
								className="absolute h-full bg-primary rounded-full"
								style={{
									width: `${calculatePricePosition(data.closePrice, data.fiftyTwoWeekLow, data.fiftyTwoWeekHigh)}%`,
								}}
							/>
						)}
					</div>
					<div className="flex justify-between text-xs">
						{loading ? (
							<>
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-4 w-20" />
							</>
						) : (
							<>
								<div>{data.fiftyTwoWeekLow}</div>
								<div>{data.fiftyTwoWeekHigh}</div>
							</>
						)}
					</div>
					<div className="flex justify-between text-xs text-muted-foreground">
						{loading ? (
							<>
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-4 w-20" />
							</>
						) : (
							<>
								<div>
									{(
										((data.closePrice - (data.fiftyTwoWeekLow ?? 0)) /
											(data.fiftyTwoWeekLow ?? 1)) *
										100
									).toFixed(2)}
									% from low
								</div>
								<div>
									{(
										(((data.fiftyTwoWeekHigh ?? 1) - data.closePrice) /
											(data.fiftyTwoWeekHigh ?? 1)) *
										100
									).toFixed(2)}
									% from high
								</div>
							</>
						)}
					</div>
				</div>
				<Separator className="my-2" />
				<div className="grid grid-cols-3 gap-2 text-sm">
					<div>
						<div className="text-muted-foreground">Change</div>
						{loading ? (
							<Skeleton className="h-6 w-full" />
						) : (
							<div
								className={`font-semibold ${
									data.closePrice > data.openPrice
										? "text-green-500"
										: "text-red-500"
								}`}
							>
								{`${data.change} / ${data.percentageChange}%`}
							</div>
						)}
					</div>
					<div>
						<div className="text-muted-foreground">Total Trades</div>
						{loading ? (
							<Skeleton className="h-6 w-full" />
						) : (
							<div className="font-semibold">{data.totalTrades}</div>
						)}
					</div>
					<div>
						<div className="text-muted-foreground">Trade Quantity</div>
						{loading ? (
							<Skeleton className="h-6 w-full" />
						) : (
							<div className="font-semibold">{data.totalTradeQuantity}</div>
						)}
					</div>
				</div>
				<div className="w-full flex justify-center mt-3">
					<span className="text-xs text-muted-foreground text-center">
						As of {toDate(data.lastUpdatedDateTime)}
					</span>
				</div>
			</Card>
		</>
	);

	const renderCompany = () => (
		<>
			<Card className="p-2">
				<div className="grid grid-cols-2 gap-2 text-sm">
					<div>
						<div className="text-muted-foreground">Listed Shares</div>
						{loading ? (
							<Skeleton className="h-6 w-full" />
						) : (
							<div className="font-semibold">{data.stockListedShares}</div>
						)}
					</div>
					<div>
						<div className="text-muted-foreground">Market Cap</div>
						{loading ? (
							<Skeleton className="h-6 w-full" />
						) : (
							<div className="font-semibold">{data.marketCapitalization}</div>
						)}
					</div>
					<div>
						<div className="text-muted-foreground">Paid Up Capital</div>
						{loading ? (
							<Skeleton className="h-6 w-full" />
						) : (
							<div className="font-semibold">{data.paidUpCapital}</div>
						)}
					</div>
					<div>
						<div className="text-muted-foreground">Issued Capital</div>
						{loading ? (
							<Skeleton className="h-6 w-full" />
						) : (
							<div className="font-semibold">{data.issuedCapital}</div>
						)}
					</div>
				</div>
				<Separator className="my-2" />
				<div className="text-sm">
					<div className="text-muted-foreground">Listing Date</div>
					{loading ? (
						<Skeleton className="h-6 w-full" />
					) : (
						<div className="font-semibold">{toDate(data.listingDate)}</div>
					)}
				</div>
			</Card>
			<Card className="p-2">
				<div className="text-sm space-y-2">
					<div>
						<div className="text-muted-foreground">Public Shares</div>
						{loading ? (
							<Skeleton className="h-6 w-full" />
						) : (
							<div className="font-semibold">
								{data.publicShares} ({data.publicPercentage}
								%)
							</div>
						)}
						<div className="h-1 bg-muted rounded-full mt-1">
							{loading ? (
								<Skeleton className="h-full w-full" />
							) : (
								<div
									className="h-full bg-primary rounded-full"
									style={{ width: `${data.publicPercentage}%` }}
								/>
							)}
						</div>
					</div>
					<div>
						<div className="text-muted-foreground">Promoter Shares</div>
						{loading ? (
							<Skeleton className="h-6 w-full" />
						) : (
							<div className="font-semibold">
								{data.promoterShares} ({data.promoterPercentage}
								%)
							</div>
						)}
						<div className="h-1 bg-muted rounded-full mt-1">
							{loading ? (
								<Skeleton className="h-full w-full" />
							) : (
								<div
									className="h-full bg-primary rounded-full"
									style={{ width: `${data.promoterPercentage}%` }}
								/>
							)}
						</div>
					</div>
				</div>
			</Card>
		</>
	);

	const renderContact = () => (
		<Card className="p-2">
			<div className="space-y-2 text-sm">
				{data.email && (
					<button
						type="button"
						className="flex items-center gap-2 cursor-pointer hover:text-primary w-full text-left"
						onClick={() => handleLinkClick(`mailto:${data.email}`)}
					>
						<Mail className="h-4 w-4 text-muted-foreground" />
						<span>{data.email}</span>
					</button>
				)}
				{data.companyWebsite && data.companyWebsite !== "N/A" && (
					<button
						type="button"
						className="flex items-center gap-2 cursor-pointer hover:text-primary w-full text-left"
						// biome-ignore lint/style/noNonNullAssertion: <not null>
						onClick={() => handleLinkClick(data.companyWebsite!)}
					>
						<Globe className="h-4 w-4 text-muted-foreground" />
						<span>{data.companyWebsite}</span>
					</button>
				)}
				<div className="flex items-center gap-2">
					<User className="h-4 w-4 text-muted-foreground" />
					<span>{data.companyContactPerson}</span>
				</div>
			</div>
		</Card>
	);

	return (
		<div className="w-full overflow-y-auto space-y-2">
			<div className="space-y-2">
				<Card>
					<div className="flex items-center gap-2">
						<div className="text-lg font-bold">
							{loading ? (
								<Skeleton className="h-6 w-48" />
							) : (
								truncate(data.companyName || "N/A")
							)}
						</div>
						<div className="text-xl font-semibold text-primary">({symbol})</div>
					</div>
				</Card>

				{routeContext.fullscreen ? (
					// Show all sections in fullscreen mode
					<div className="space-y-2">
						{renderTrading()}
						{renderCompany()}
						{renderContact()}
					</div>
				) : (
					// Show tabbed version when not fullscreen
					<Tabs defaultValue="trading" className="w-full">
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger
								className="bg-gray-100 dark:bg-zinc-800 data-[state=active]:bg-gray-300 dark:data-[state=active]:bg-zinc-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400"
								value="trading"
							>
								Trading
							</TabsTrigger>
							<TabsTrigger
								className="bg-gray-100 dark:bg-zinc-800 data-[state=active]:bg-gray-300 dark:data-[state=active]:bg-zinc-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400"
								value="company"
							>
								Company
							</TabsTrigger>
							<TabsTrigger
								className="bg-gray-100 dark:bg-zinc-800 data-[state=active]:bg-gray-300 dark:data-[state=active]:bg-zinc-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400"
								value="contact"
							>
								Contact
							</TabsTrigger>
						</TabsList>
						<TabsContent value="trading" className="space-y-2">
							{renderTrading()}
						</TabsContent>
						<TabsContent value="company" className="space-y-2">
							{renderCompany()}
						</TabsContent>
						<TabsContent value="contact">{renderContact()}</TabsContent>
					</Tabs>
				)}
			</div>
			<BackButton
				showBack={true}
				onRefresh={handleFetchCompanyData}
				showChat={showChart}
			/>
		</div>
	);
}
