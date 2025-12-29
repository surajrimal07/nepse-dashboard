import {
	Card,
	CardContent,
	CardHeader,
} from "@nepse-dashboard/ui/components/card";
import { Clock } from "lucide-react";
import BackButton from "../back-button/back-button";

export function PortfolioComingSoon() {
	return (
		<div className="flex flex-col h-full w-full  text-foreground overflow-hidden p-4">
			<Card className="flex-1 shadow-lg">
				<CardHeader className="pb-4"></CardHeader>
				<CardContent className="flex flex-col items-center justify-center space-y-6 py-8">
					<div className="relative">
						<div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
						<Clock className="w-16 h-16 text-primary relative " />
					</div>
					<div className="text-center space-y-2">
						<h3 className="text-xl font-semibold">Coming Soon</h3>
						<p className="text-sm text-muted-foreground max-w-md">
							We're working hard to bring you an amazing portfolio tracking
							experience. Stay tuned for updates!
						</p>
					</div>
					<div className="bg-muted/30 rounded-lg p-4 max-w-md">
						<p className="text-xs text-muted-foreground text-center">
							The portfolio feature will allow you to track your holdings, view
							real-time gains/losses, and sync your data seamlessly.
						</p>
					</div>
				</CardContent>
			</Card>
			<BackButton showBack={true} />
		</div>
	);
}
