import { Button } from "@nepse-dashboard/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@nepse-dashboard/ui/components/card";
import { Shield } from "lucide-react";
import useScreenView from "@/hooks/usePageView";

interface PortfolioNotEnabledProps {
	isEnabled: boolean;
	onToggle: () => void;
}

export function PortfolioNotEnabled({
	isEnabled,
	onToggle,
}: PortfolioNotEnabledProps) {
	useScreenView("/portfolio-not-enabled");

	return (
		<div className="flex flex-col h-full w-full bg-linear-to-br from-background to-background/90 text-foreground overflow-hidden">
			<Card className="flex-1 shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
				<CardHeader className="pb-2 space-y-1">
					<div className="flex items-center justify-between">
						<CardTitle className="text-base font-bold">
							Portfolio Overview
						</CardTitle>
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					<div className="text-center space-y-4">
						<div className="p-4 rounded-lg bg-muted/30 border border-border/50">
							<h2 className="font-semibold text-foreground mb-2 text-lg">
								Portfolio syncing is not enabled
							</h2>
							<p className="text-sm text-muted-foreground leading-relaxed">
								User has not enabled portfolio syncing. Portfolio feature needs
								this to function accurately. Please consider enabling it.
							</p>
						</div>

						<div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
							<Shield className="h-4 w-4 text-green-500" />
							<span>All data will be stored locally within the device</span>
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
							<div className="space-y-1">
								<h4 className="text-sm font-medium">Enable Portfolio Sync</h4>
								<p className="text-xs text-muted-foreground">
									Sync your portfolio data from MeroShare
								</p>
							</div>
							<Button
								variant={isEnabled ? "default" : "outline"}
								size="sm"
								onClick={onToggle}
								className="min-w-[60px]"
							>
								{isEnabled ? "ON" : "OFF"}
							</Button>
						</div>

						{isEnabled && (
							<div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
								<p className="text-sm text-green-700 dark:text-green-400">
									Portfolio sync will be enabled once you configure your
									MeroShare credentials.
								</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
