/** biome-ignore-all lint/a11y/useButtonType: <iknow> */
import { Button } from "@nepse-dashboard/ui/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@nepse-dashboard/ui/components/tooltip";
import { createLazyRoute } from "@tanstack/react-router";
import {
	AlertCircle,
	BarChart3,
	Calendar,
	ChevronDown,
	Clock,
	ExternalLink,
	Shield,
	Target,
	TrendingDown,
	TrendingUp,
	Wallet,
	Zap,
} from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import TimeAgo from "react-timeago";
import { toast } from "sonner";
import { browser, useCallback } from "#imports";
import type { HoldingPerformance } from "@/entrypoints/meroshare.content/calculation";
import { useIndexStatus } from "@/hooks/convex/useIndexStatus";
import { handleActionResult } from "@/hooks/handle-action";
import { useAppState } from "@/hooks/use-app";
import {
	getAllClientDetails,
	insightsStorage,
	portfolioApiStorage,
	type StoredInsightsData,
	type WaccPendingError,
	waccPendingErrorStorage,
	waccStorage,
} from "@/lib/storage/meroshare-storage";
import { type Account, AccountType } from "@/types/account-types";
import type {
	StoredClientData,
	StoredPortfolioApiData,
	StoredWaccData,
} from "@/types/meroshare-type";
import { formatCurrency } from "@/utils/portfolio";
import BackButton from "../back-button/back-button";
import EmptyPortfolio from "./empty-portfolio";
import PortfolioLoading from "./loading";
import NoAccounts from "./no-accounts";
import { PortfolioNotEnabled } from "./not-enabled";
import WaccAlert from "./wacc-alert";

export const Route = createLazyRoute("/portfolio")({
	component: Portfolio,
});

// Gain/Loss color class - moved outside component for stable references
const getGainClass = (value: number): string => {
	if (value > 0) return "text-emerald-400";
	if (value < 0) return "text-red-400";
	return "text-muted-foreground";
};

const getBgClass = (value: number): string => {
	if (value > 0) return "bg-emerald-500/10 border-emerald-500/20";
	if (value < 0) return "bg-red-500/10 border-red-500/20";
	return "bg-muted/30 border-border/50";
};

// Account with matched client data
interface MeroshareAccountData {
	account: Account;
	clientData: StoredClientData | null;
	portfolioData: StoredPortfolioApiData | null;
	waccData: StoredWaccData | null;
	insights: StoredInsightsData | null;
	isSynced: boolean;
	isEmptyPortfolio: boolean; // Synced but no holdings
	waccPendingError: WaccPendingError | null; // WACC calculation pending
}

// Memoized holding row component to prevent unnecessary re-renders
interface HoldingRowProps {
	holding: HoldingPerformance;
	showTradeButtons: boolean;
	onTrade: (scrip: string, type: "Buy" | "Sell") => void;
}

const HoldingRow = memo(function HoldingRow({
	holding,
	showTradeButtons,
	onTrade,
}: HoldingRowProps) {
	const handleBuy = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			onTrade(holding.scrip, "Buy");
		},
		[holding.scrip, onTrade],
	);

	const handleSell = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			onTrade(holding.scrip, "Sell");
		},
		[holding.scrip, onTrade],
	);

	return (
		<div className="px-3 py-2 hover:bg-muted/30 transition-colors">
			<div className="flex items-center justify-between mb-1">
				<div className="flex items-center gap-1.5">
					<span className="text-sm font-medium text-foreground">
						{holding.scrip}
					</span>
					{showTradeButtons && (
						<div className="flex items-center gap-0.5">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										size="icon"
										variant="ghost"
										className="h-5 w-5 hover:bg-emerald-500/20"
										onClick={handleBuy}
									>
										<TrendingUp className="w-3 h-3 text-emerald-500" />
									</Button>
								</TooltipTrigger>
								<TooltipContent side="top">
									<p>Buy {holding.scrip}</p>
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										size="icon"
										variant="ghost"
										className="h-5 w-5 hover:bg-red-500/20"
										onClick={handleSell}
									>
										<TrendingDown className="w-3 h-3 text-red-500" />
									</Button>
								</TooltipTrigger>
								<TooltipContent side="top">
									<p>Sell {holding.scrip}</p>
								</TooltipContent>
							</Tooltip>
						</div>
					)}
				</div>
				<span
					className={`text-sm font-semibold ${getGainClass(holding.absoluteProfit)}`}
				>
					{holding.absoluteProfit >= 0 ? "+" : ""}
					Rs.{formatCurrency(holding.absoluteProfit)}
				</span>
			</div>
			<div className="flex items-center justify-between text-xs text-muted-foreground">
				<span>
					{holding.qty} × Rs.{holding.ltp.toFixed(2)}
				</span>
				<span className={getGainClass(holding.percentProfit)}>
					{holding.percentProfit >= 0 ? "+" : ""}
					{holding.percentProfit.toFixed(2)}%
				</span>
			</div>
			<div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
				<span>Avg: Rs.{holding.avgCost.toFixed(2)}</span>
				<span>Value: Rs.{formatCurrency(holding.currentValue)}</span>
			</div>
		</div>
	);
});

// Memoized dropdown item component
interface AccountDropdownItemProps {
	data: MeroshareAccountData;
	isSelected: boolean;
	onSelect: () => void;
}

const AccountDropdownItem = memo(function AccountDropdownItem({
	data,
	isSelected,
	onSelect,
}: AccountDropdownItemProps) {
	// Determine sync status display
	const getSyncStatus = () => {
		if (data.isSynced) {
			return <span className="text-[10px] text-emerald-400">✓</span>;
		}
		if (data.isEmptyPortfolio) {
			return <span className="text-[10px] text-slate-400">Empty</span>;
		}
		return <span className="text-[10px] text-amber-400">Not synced</span>;
	};

	return (
		<button
			onClick={onSelect}
			className={`w-full flex items-center justify-between px-3 py-2 hover:bg-muted transition-colors ${
				isSelected ? "bg-muted" : ""
			}`}
		>
			<div className="flex items-center gap-2">
				<span className="text-sm text-foreground">
					{data.clientData?.name || data.account.alias}
				</span>
				{data.account.isPrimary && (
					<span className="px-1.5 py-0.5 text-[10px] bg-primary/20 text-primary rounded">
						Primary
					</span>
				)}
			</div>
			{getSyncStatus()}
		</button>
	);
});

export default function Portfolio() {
	const { useStateItem, callAction } = useAppState();
	const [accounts] = useStateItem("accounts");
	const [isSyncEnabled, setSyncEnabled] = useStateItem("syncPortfolio");
	const [tmsUrl] = useStateItem("tmsUrl");

	const [allClientDetails, setAllClientDetails] = useState<
		Record<string, StoredClientData>
	>({});
	const [allPortfolioData, setAllPortfolioData] = useState<
		Record<string, StoredPortfolioApiData>
	>({});
	const [allWaccData, setAllWaccData] = useState<
		Record<string, StoredWaccData>
	>({});
	const [allInsights, setAllInsights] = useState<
		Record<string, StoredInsightsData>
	>({});
	const [allWaccPendingErrors, setAllWaccPendingErrors] = useState<
		Record<string, WaccPendingError>
	>({});
	const [selectedAccountAlias, setSelectedAccountAlias] = useState<
		string | null
	>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const { data: nepseState } = useIndexStatus();

	// Get meroshare accounts only - stable reference
	const meroshareAccounts = useMemo(
		() =>
			(accounts || []).filter(
				(acc: Account) => acc.type === AccountType.MEROSHARE,
			),
		[accounts],
	);

	// Load all data from storage
	useEffect(() => {
		let isMounted = true;

		async function loadData() {
			setIsLoading(true);
			try {
				const [clients, portfolios, waccs, insights, waccErrors] =
					await Promise.all([
						getAllClientDetails(),
						portfolioApiStorage.getValue(),
						waccStorage.getValue(),
						insightsStorage.getValue(),
						waccPendingErrorStorage.getValue(),
					]);

				if (!isMounted) return;

				setAllClientDetails(clients || {});
				setAllPortfolioData(portfolios || {});
				setAllWaccData(waccs || {});
				setAllInsights(insights || {});
				setAllWaccPendingErrors(waccErrors || {});
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}
		loadData();

		// Watch for storage changes
		const unwatchPortfolio = portfolioApiStorage.watch((data) => {
			if (isMounted) setAllPortfolioData(data || {});
		});
		const unwatchWacc = waccStorage.watch((data) => {
			if (isMounted) setAllWaccData(data || {});
		});
		const unwatchInsights = insightsStorage.watch((data) => {
			if (isMounted) setAllInsights(data || {});
		});
		const unwatchWaccErrors = waccPendingErrorStorage.watch((data) => {
			if (isMounted) setAllWaccPendingErrors(data || {});
		});

		return () => {
			isMounted = false;
			unwatchPortfolio();
			unwatchWacc();
			unwatchInsights();
			unwatchWaccErrors();
		};
	}, []);

	// Match accounts with their portfolio data - consolidated lookup
	const accountsWithData: MeroshareAccountData[] = useMemo(() => {
		// Pre-index client details by boid for O(1) lookup
		const clientsByBoid = new Map<string, StoredClientData>();
		for (const client of Object.values(allClientDetails)) {
			if (client.boid) {
				clientsByBoid.set(client.boid, client);
			}
		}

		return meroshareAccounts.map((account: Account) => {
			const clientData = clientsByBoid.get(account.username) || null;
			const fullDemat = clientData?.demat;

			// Early return pattern for missing demat
			if (!fullDemat) {
				return {
					account,
					clientData,
					portfolioData: null,
					waccData: null,
					insights: null,
					isSynced: false,
					isEmptyPortfolio: false,
					waccPendingError: null,
				};
			}

			const portfolioData = allPortfolioData[fullDemat] || null;
			const waccData = allWaccData[fullDemat] || null;
			const insights = allInsights[fullDemat] || null;
			const waccPendingError = allWaccPendingErrors[fullDemat] || null;

			// Check if data was synced (portfolioData and waccData exist)
			const hasData = !!(portfolioData && waccData);
			// Check if portfolio is empty (synced but no holdings)
			const isEmptyPortfolio = hasData && portfolioData.portfolio.length === 0;
			// isSynced means has data AND has holdings
			const isSynced = hasData && portfolioData.portfolio.length > 0;

			return {
				account,
				clientData,
				portfolioData,
				waccData,
				insights,
				isSynced,
				isEmptyPortfolio,
				waccPendingError,
			};
		});
	}, [
		meroshareAccounts,
		allClientDetails,
		allPortfolioData,
		allWaccData,
		allInsights,
		allWaccPendingErrors,
	]);

	// Set default selected account - only when needed
	useEffect(() => {
		if (selectedAccountAlias || accountsWithData.length === 0) return;

		const primary = accountsWithData.find((a) => a.account.isPrimary);
		const synced = accountsWithData.find((a) => a.isSynced);
		const defaultAccount = primary || synced || accountsWithData[0];

		if (defaultAccount) {
			setSelectedAccountAlias(defaultAccount.account.alias);
		}
	}, [accountsWithData, selectedAccountAlias]);

	// Get selected account data
	const selectedData = useMemo(
		() =>
			accountsWithData.find((a) => a.account.alias === selectedAccountAlias) ||
			null,
		[accountsWithData, selectedAccountAlias],
	);

	// Memoized callbacks
	const refresh = useCallback(() => {
		toast.success("Opening Meroshare to sync portfolio data");
		browser.tabs.create({
			url: "https://meroshare.cdsc.com.np/#/portfolio",
			active: true,
		});
	}, []);

	const goToTMS = useCallback(
		async (stock: string, type: "Buy" | "Sell") => {
			if (tmsUrl) {
				await callAction("openTradePage", stock, type).then(handleActionResult);
			}
		},
		[tmsUrl, callAction],
	);

	const toggleDropdown = useCallback(() => {
		setIsDropdownOpen((prev) => !prev);
	}, []);

	const handleAccountSelect = useCallback((alias: string) => {
		setSelectedAccountAlias(alias);
		setIsDropdownOpen(false);
	}, []);

	const handleEnableSync = useCallback(() => {
		setSyncEnabled(true);
	}, [setSyncEnabled]);

	// Derived values
	const insights = selectedData?.insights?.insights;
	const lastSynced = selectedData?.portfolioData?.syncedAt;
	const showTradeButtons = !!(nepseState?.isOpen && tmsUrl);

	// Loading state
	if (isLoading) {
		return <PortfolioLoading />;
	}

	// Sync disabled
	if (!isSyncEnabled) {
		return <PortfolioNotEnabled onEnable={handleEnableSync} />;
	}

	// No accounts
	if (meroshareAccounts.length === 0) {
		return <NoAccounts />;
	}

	return (
		<div className="flex flex-col h-full w-full bg-background overflow-hidden">
			<div className="p-1 pb-2">
				<div className="relative">
					<button
						onClick={toggleDropdown}
						className="w-full flex items-center justify-between px-3 py-2 bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors"
					>
						<div className="flex items-center gap-2">
							<Wallet className="w-4 h-4 text-primary" />
							<span className="text-sm font-medium text-foreground">
								{selectedData?.clientData?.name || selectedData?.account.alias}
							</span>
							{selectedData?.isSynced && (
								<span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 rounded">
									Synced
								</span>
							)}
						</div>
						<ChevronDown
							className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
						/>
					</button>

					{isDropdownOpen && (
						<div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
							{accountsWithData.map((data) => (
								<AccountDropdownItem
									key={data.account.alias}
									data={data}
									isSelected={data.account.alias === selectedAccountAlias}
									onSelect={() => handleAccountSelect(data.account.alias)}
								/>
							))}
						</div>
					)}
				</div>
				{lastSynced && (
					<div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
						<Clock className="w-3 h-3" />
						<span>
							Synced <TimeAgo date={lastSynced} />
						</span>
					</div>
				)}
			</div>

			{selectedData &&
				!selectedData.isSynced &&
				!selectedData.isEmptyPortfolio &&
				!selectedData.waccPendingError && (
					<div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
						<AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
						<h3 className="text-lg font-semibold text-foreground mb-2">
							Portfolio Not Synced
						</h3>
						<p className="text-sm text-muted-foreground mb-4">
							Please log in to Meroshare with this account and visit the
							portfolio page to sync your data.
						</p>
						<button
							onClick={refresh}
							className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
						>
							Open Meroshare <ExternalLink className="w-4 h-4" />
						</button>
					</div>
				)}

			{selectedData?.waccPendingError && (
				<WaccAlert
					accountName={
						selectedData.clientData?.name || selectedData.account.alias
					}
					message={selectedData.waccPendingError.message}
				/>
			)}

			{selectedData?.isEmptyPortfolio && !selectedData.waccPendingError && (
				<EmptyPortfolio
					accountName={
						selectedData.clientData?.name || selectedData.account.alias
					}
					hasOtherAccounts={accountsWithData.length > 1}
				/>
			)}

			{selectedData?.isSynced && insights && (
				<div className="flex-1 overflow-y-auto px-2 pb-2 space-y-3">
					<div className="grid grid-cols-2 gap-2">
						<div className="bg-muted/30 border border-border/50 rounded-lg p-2">
							<div className="text-xs text-muted-foreground mb-0.5">
								Portfolio Value
							</div>
							<div className="text-lg font-bold text-foreground">
								Rs.{formatCurrency(insights.portfolio.totalValue)}
							</div>
							<div className="text-xs text-muted-foreground">
								Cost: Rs.{formatCurrency(insights.portfolio.totalInvestment)}
							</div>
						</div>

						<div
							className={`border rounded-lg p-2.5 ${getBgClass(insights.portfolio.totalUnrealizedPL)}`}
						>
							<div className="text-xs text-muted-foreground mb-0.5">
								Unrealized P&L
							</div>
							<div
								className={`text-lg font-bold ${getGainClass(insights.portfolio.totalUnrealizedPL)}`}
							>
								{insights.portfolio.totalUnrealizedPL >= 0 ? "+" : ""}
								Rs.{formatCurrency(insights.portfolio.totalUnrealizedPL)}
							</div>
							<div
								className={`text-xs ${getGainClass(insights.portfolio.totalUnrealizedPLPercent)}`}
							>
								{insights.portfolio.totalUnrealizedPLPercent >= 0 ? "+" : ""}
								{insights.portfolio.totalUnrealizedPLPercent.toFixed(2)}%
							</div>
						</div>

						<div
							className={`border rounded-lg p-2.5 ${getBgClass(insights.portfolio.dayChange)}`}
						>
							<div className="text-xs text-muted-foreground mb-0.5">
								Today's Change
							</div>
							<div
								className={`text-lg font-bold ${getGainClass(insights.portfolio.dayChange)}`}
							>
								{insights.portfolio.dayChange >= 0 ? "+" : ""}
								Rs.{formatCurrency(insights.portfolio.dayChange)}
							</div>
							<div
								className={`text-xs ${getGainClass(insights.portfolio.dayChangePercent)}`}
							>
								{insights.portfolio.dayChangePercent >= 0 ? "+" : ""}
								{insights.portfolio.dayChangePercent.toFixed(2)}%
							</div>
						</div>

						<div className="bg-muted/30 border border-border/50 rounded-lg p-2">
							<div className="text-xs text-muted-foreground mb-0.5">
								Win Rate
							</div>
							<div className="text-lg font-bold text-foreground">
								{insights.winRate.holdingsWinRate.toFixed(0)}%
							</div>
							<div className="text-xs text-muted-foreground">
								{insights.winRate.winCount}W / {insights.winRate.lossCount}L
							</div>
						</div>
					</div>

					<div className="grid grid-cols-4 gap-1 rounded-lg">
						<div className="bg-muted/60 rounded-lg p-1 text-center">
							<BarChart3 className="w-4 h-4 text-blue-400 mx-auto mb-1" />
							<div className="text-sm font-bold text-foreground">
								{insights.summary.currentlyHolding}
							</div>
							<div className="text-[10px] text-muted-foreground">Stocks</div>
						</div>
						<div className="bg-muted/60 rounded-lg p-1 text-center">
							<Target className="w-4 h-4 text-purple-400 mx-auto mb-1" />
							<div className="text-sm font-bold text-foreground">
								{insights.health.score}
							</div>
							<div className="text-[10px] text-muted-foreground">Health</div>
						</div>
						<div className="bg-muted/60 rounded-lg p-1 text-center">
							<Calendar className="w-4 h-4 text-green-400 mx-auto mb-1" />
							<div className="text-sm font-bold text-foreground">
								{insights.trading.tradingDays}
							</div>
							<div className="text-[10px] text-muted-foreground">
								Active Days
							</div>
						</div>
						<div className="bg-muted/60 rounded-lg p-1 text-center">
							<Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
							<div className="text-xs font-bold text-foreground truncate">
								{insights.personality.type}
							</div>
							<div className="text-[10px] text-muted-foreground">Style</div>
						</div>
					</div>

					<div className="bg-muted/20 border border-border/50 rounded-lg overflow-hidden">
						<div className="px-3 py-2 border-b border-border/50 flex items-center justify-between">
							<span className="text-sm font-semibold text-foreground">
								Holdings
							</span>
							<span className="text-xs text-muted-foreground">
								{insights.portfolio.holdings.length} stocks
							</span>
						</div>
						<div className="divide-y divide-border/30 max-h-64 overflow-y-auto">
							{insights.portfolio.holdings.map(
								(holding: HoldingPerformance) => (
									<HoldingRow
										key={holding.scrip}
										holding={holding}
										showTradeButtons={showTradeButtons}
										onTrade={goToTMS}
									/>
								),
							)}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-2">
						{insights.bestPerformer && (
							<div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
								<div className="flex items-center gap-1 text-xs text-emerald-400 mb-1">
									<TrendingUp className="w-3 h-3" />
									Best Performer
								</div>
								<div className="text-sm font-bold text-foreground">
									{insights.bestPerformer.scrip}
								</div>
								<div className="text-xs text-emerald-400">
									+{insights.bestPerformer.percentProfit.toFixed(1)}%
								</div>
							</div>
						)}
						{insights.worstPerformer && (
							<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
								<div className="flex items-center gap-1 text-xs text-red-400 mb-1">
									<TrendingDown className="w-3 h-3" />
									Worst Performer
								</div>
								<div className="text-sm font-bold text-foreground">
									{insights.worstPerformer.scrip}
								</div>
								<div className="text-xs text-red-400">
									{insights.worstPerformer.percentProfit.toFixed(1)}%
								</div>
							</div>
						)}
					</div>

					<div className="flex items-center justify-center gap-1.5 py-2 text-[10px] text-muted-foreground">
						<Shield className="w-3 h-3 text-emerald-500" />
						<span>
							All data stored locally • Never sent to external servers
						</span>
					</div>
				</div>
			)}

			<BackButton showBack={true} onRefresh={refresh} />
		</div>
	);
}
