import { Button } from "@nepse-dashboard/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
} from "@nepse-dashboard/ui/components/card";
import { BarChart3, Globe, LogIn, Shield, TrendingUp } from "lucide-react";
import type { FC } from "react";

interface NotLoggedInViewProps {
	onLogin: () => void;
}

const NotLoggedInView: FC<NotLoggedInViewProps> = ({ onLogin }) => {
	return (
		<div className="w-full h-full flex items-center justify-center bg-linear-to-br from-background to-muted/20">
			<Card className="w-full max-w-md border-0 shadow-none bg-transparent">
				<CardHeader className="text-center pb-4 pt-0">
					<div className="mx-auto mb-3 w-14 h-14 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
						<TrendingUp className="w-7 h-7 text-primary" />
					</div>
					<h1 className="text-xl font-bold text-foreground mb-2">
						Welcome to NEPSE Dashboard
					</h1>
					<p className="text-sm text-muted-foreground">
						Your comprehensive stock market companion
					</p>
				</CardHeader>

				<CardContent className="space-y-4 px-4 pb-6">
					<Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
						<CardContent className="p-4 space-y-3">
							<div className="text-center space-y-2">
								<h2 className="text-base font-semibold text-foreground">
									Sign in to get started
								</h2>
								<p className="text-xs text-muted-foreground leading-relaxed">
									Authentication is required to access real-time market data,
									portfolio tracking, and personalized insights.
								</p>
							</div>

							<div className="space-y-2 pt-2">
								<div className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
									<div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
										<BarChart3 className="w-3.5 h-3.5 text-primary" />
									</div>
									<span className="text-xs text-foreground font-medium">
										Real-time market data & analytics
									</span>
								</div>

								<div className="flex items-center gap-3 p-2.5 rounded-lg bg-green-500/5 border border-green-500/10">
									<div className="w-7 h-7 rounded-md bg-green-500/10 flex items-center justify-center shrink-0">
										<Shield className="w-3.5 h-3.5 text-green-600" />
									</div>
									<span className="text-xs text-foreground font-medium">
										Secure portfolio management
									</span>
								</div>

								<div className="flex items-center gap-3 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
									<div className="w-7 h-7 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
										<Globe className="w-3.5 h-3.5 text-blue-600" />
									</div>
									<span className="text-xs text-foreground font-medium">
										Sync across all your devices
									</span>
								</div>
							</div>

							<div className="pt-3 space-y-2">
								<Button
									onClick={onLogin}
									className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-200"
								>
									<LogIn className="mr-2 h-4 w-4" />
									Sign in to Continue
								</Button>
								<p className="text-[10px] text-center text-muted-foreground">
									By signing in, you agree to our Terms of Service and Privacy
									Policy
								</p>
							</div>
						</CardContent>
					</Card>
				</CardContent>
			</Card>
		</div>
	);
};
export default NotLoggedInView;
