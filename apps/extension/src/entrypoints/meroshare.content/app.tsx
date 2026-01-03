import { createCrannStateHook } from "crann-fork";
import { useEffect, useState } from "react";
import { appState } from "@/lib/service/app-service";
import {
	getCachedInsights,
	getCurrentTransactions,
	getCurrentWacc,
	getCurrentWaccPendingError,
	getRawPortfolioApi,
	insightsStorage,
	portfolioApiStorage,
	transactionStorage,
	type WaccPendingError,
	waccPendingErrorStorage,
	waccStorage,
} from "../../lib/storage/meroshare-storage";
import type {
	RawHoldingTransaction,
	StoredPortfolioApiData,
	WaccApiItem,
} from "../../types/meroshare-type";
import {
	type AdvancedUserInsights,
	generateAdvancedInsights,
} from "./calculation";
import EmptyPortfolioWidget from "./components/empty-portfolio";
import WaccAlert from "./components/wacc-alert";
import PortfolioWidgets from "./components/widget";
import WidgetsSkeleton from "./components/widgets-skeleton";
import type { ProcessedStats } from "./type";
import { processPortfolioData } from "./utils";

export default function App() {
	const useAppState = createCrannStateHook(appState);
	const { useStateItem } = useAppState();
	const [companiesList] = useStateItem("companiesList");

	const [stats, setStats] = useState<ProcessedStats | null>(null);
	const [waccData, setWaccData] = useState<WaccApiItem[] | null>(null);
	const [portfolioData, setPortfolioData] =
		useState<StoredPortfolioApiData | null>(null);
	const [transactionData, setTransactionData] = useState<
		RawHoldingTransaction[] | null
	>(null);
	const [insights, setInsights] = useState<AdvancedUserInsights | null>(null);
	const [waccPendingError, setWaccPendingError] =
		useState<WaccPendingError | null>(null);

	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let mounted = true;

		async function loadData() {
			setIsLoading(true);
			const [waccD, txnD, portD, cachedInsights, pendingError] =
				await Promise.all([
					getCurrentWacc(),
					getCurrentTransactions(),
					getRawPortfolioApi(),
					getCachedInsights(),
					getCurrentWaccPendingError(),
				]);
			if (!mounted) return;

			setWaccData(waccD || null);
			setTransactionData(txnD || null);
			setPortfolioData(portD || null);
			setWaccPendingError(pendingError);

			// Use cached insights if available
			if (cachedInsights) {
				setInsights(cachedInsights);
			}

			setIsLoading(false);
		}

		loadData();

		// Listen for storage changes - reload current wacc
		const unwatchWacc = waccStorage.watch(async () => {
			if (!mounted) return;
			const wacc = await getCurrentWacc();
			setWaccData(wacc || []);
		});

		// Listen for transaction storage changes
		const unwatchTxn = transactionStorage.watch(async () => {
			if (!mounted) return;
			const txns = await getCurrentTransactions();
			setTransactionData(txns || []);
		});

		// Listen for portfolio storage changes
		const unwatchPortfolio = portfolioApiStorage.watch(async () => {
			if (!mounted) return;
			const port = await getRawPortfolioApi();
			setPortfolioData(port || null);
		});

		// Listen for insights cache changes
		const unwatchInsights = insightsStorage.watch(async () => {
			if (!mounted) return;
			const cached = await getCachedInsights();
			if (cached) {
				setInsights(cached);
			}
		});

		// Listen for WACC pending error changes
		const unwatchWaccPendingError = waccPendingErrorStorage.watch(async () => {
			if (!mounted) return;
			const pendingError = await getCurrentWaccPendingError();
			setWaccPendingError(pendingError);
		});

		return () => {
			mounted = false;
			unwatchWacc();
			unwatchTxn();
			unwatchPortfolio();
			unwatchInsights();
			unwatchWaccPendingError();
		};
	}, []);

	// Process portfolio stats when data changes
	useEffect(() => {
		async function processData() {
			if (!portfolioData || !waccData || !companiesList || !transactionData) {
				setStats(null);
				return;
			}

			const result = processPortfolioData(
				waccData,
				portfolioData?.portfolio,
				companiesList,
			);

			setStats(result);
		}

		processData();
	}, [waccData, portfolioData, companiesList, transactionData]);

	// Recalculate insights when any dependency changes
	useEffect(() => {
		let mounted = true;

		async function recalculateInsights() {
			if (!portfolioData || !waccData || !transactionData) {
				return;
			}

			// Generate new insights (this also caches them)
			const newInsights = await generateAdvancedInsights();
			if (mounted) {
				setInsights(newInsights);
			}
		}

		recalculateInsights();

		return () => {
			mounted = false;
		};
	}, [waccData, portfolioData, transactionData]);

	// Show WACC alert if there's a pending error (don't show skeleton forever)
	if (!isLoading && waccPendingError) {
		return <WaccAlert error={waccPendingError} />;
	}

	// Show empty portfolio state when data is synced but portfolio is empty
	// Telltale sign: portfolioData exists but portfolio array is empty
	if (!isLoading && portfolioData && portfolioData.portfolio.length === 0) {
		return <EmptyPortfolioWidget />;
	}

	if (isLoading || !stats || !portfolioData || !transactionData || !waccData) {
		return <WidgetsSkeleton />;
	}

	return (
		<PortfolioWidgets
			stats={stats}
			insights={insights}
			lastSynced={portfolioData.syncedAt}
		/>
	);
}
