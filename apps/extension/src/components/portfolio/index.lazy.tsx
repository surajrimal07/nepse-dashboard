import { createLazyRoute } from '@tanstack/react-router'
import { PortfolioComingSoon } from '@/components/portfolio/coming-soon'

export const Route = createLazyRoute('/portfolio')({
  component: Portfolio,
})

export default function Portfolio() {
  // Show coming soon by default
  return <PortfolioComingSoon />

  // const { useStateItem } = useAppState();

  // const [portfolioData, setPortfolioData] =
  // 	useState<PortfolioItem[]>(dummyPortfolioData);
  // const [lastSynced, setLastSynced] = useState<Date>(new Date());

  // const [portfolioSyncEnabled] = useStateItem("syncPortfolio");
  // const setPortfolioSync = useSetSyncPortfolio();

  // const handleSync = () => {
  // 	setLastSynced(new Date());
  // };

  // const handleSetPortfolioSyncEnabled = useCallback(
  // 	async (enabled: boolean) => {
  // 		await setPortfolioSync(enabled);
  // 	},
  // 	[],
  // );

  // const formatLastUpdated = (date: Date) => {
  // 	return date.toLocaleTimeString("en-US", {
  // 		hour: "2-digit",
  // 		minute: "2-digit",
  // 	});
  // };

  // const totalValue = portfolioData.reduce(
  // 	(sum, item) => sum + item.ltp * item.unit,
  // 	0,
  // );

  // const totalDailyGain = portfolioData.reduce(
  // 	(sum, item) => sum + item.dailyGain.value,
  // 	0,
  // );

  // const totalCost = portfolioData.reduce(
  // 	(sum, item) => sum + item.wacc * item.unit,
  // 	0,
  // );

  // const totalOverallGain = totalValue - totalCost;
  // const totalOverallGainPercentage = (totalOverallGain / totalCost) * 100;
  // const totalDailyGainPercentage = (totalDailyGain / totalValue) * 100;

  // if (!portfolioSyncEnabled) {
  // 	return (
  // 		<PortfolioNotEnabled
  // 			isEnabled={portfolioSyncEnabled}
  // 			onToggle={() => handleSetPortfolioSyncEnabled(true)}
  // 		/>
  // 	);
  // }

  // return (
  // 	<div className="flex flex-col h-full w-full bg-linear-to-br from-background to-background/90 text-foreground overflow-hidden">
  // 		<Card className="flex-1 shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
  // 			<CardHeader className="pb-2 space-y-1">
  // 				<div className="flex items-center justify-between">
  // 					<CardTitle className="text-base font-bold">
  // 						Portfolio Overview
  // 					</CardTitle>
  // 					<div className="text-xs text-muted-foreground">
  // 						Last updated: {formatLastUpdated(lastSynced)}
  // 					</div>
  // 				</div>
  // 				<div className="grid grid-cols-3 gap-1">
  // 					<div className="bg-muted/30 rounded-md p-1.5">
  // 						<div className="text-xs text-muted-foreground">Total Value</div>
  // 						<div className="text-sm font-semibold">
  // 							Rs
  // 							{totalValue.toFixed(0)}
  // 						</div>
  // 					</div>
  // 					<div className="bg-muted/30 rounded-md p-1.5">
  // 						<div className="text-xs text-muted-foreground">Daily Change</div>
  // 						<div
  // 							className={`text-sm font-semibold ${
  // 								totalDailyGain > 0
  // 									? "text-green-500"
  // 									: totalDailyGain < 0
  // 										? "text-red-500"
  // 										: ""
  // 							}`}
  // 						>
  // 							Rs {totalDailyGain.toFixed(0)}
  // 							<span className="text-xs ml-1">
  // 								({totalDailyGainPercentage.toFixed(2)}
  // 								%)
  // 							</span>
  // 						</div>
  // 					</div>
  // 					<div className="bg-muted/30 rounded-md p-1.5">
  // 						<div className="text-xs text-muted-foreground">Overall Gain</div>
  // 						<div
  // 							className={`text-sm font-semibold ${
  // 								totalOverallGain > 0
  // 									? "text-green-500"
  // 									: totalOverallGain < 0
  // 										? "text-red-500"
  // 										: ""
  // 							}`}
  // 						>
  // 							Rs {totalOverallGain.toFixed(0)}
  // 							<span className="text-xs ml-1">
  // 								({totalOverallGainPercentage.toFixed(2)}
  // 								%)
  // 							</span>
  // 						</div>
  // 					</div>
  // 				</div>
  // 			</CardHeader>
  // 			<CardContent className="pb-2">
  // 				<PortfolioTable portfolioData={portfolioData} />
  // 			</CardContent>
  // 		</Card>

  // 		<div className="flex justify-center mt-2 mb-1">
  // 			<SyncButton onClick={handleSync} />
  // 		</div>
  // 	</div>
  // );
}
