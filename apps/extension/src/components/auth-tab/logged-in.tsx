import { Avatar } from "@nepse-dashboard/ui/components/avatar";
import { Button } from "@nepse-dashboard/ui/components/button";
import { Card, CardContent } from "@nepse-dashboard/ui/components/card";
import { Separator } from "@nepse-dashboard/ui/components/separator";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import type { FC } from "react";
import { useEffect } from "react";
import useScreenView from "@/hooks/usePageView";
import type { User } from "@/types/user-types";

interface LoggedInViewProps {
	user: User;
	onLogout: () => void;
	fromAuthFlow: boolean;
}

const LoggedInView: FC<LoggedInViewProps> = ({
	user,
	onLogout,
	fromAuthFlow,
}) => {
	useScreenView("/loggedin");

	const routeContext = useRouteContext({ strict: false });
	const router = useRouter();

	useEffect(() => {
		if (!fromAuthFlow) return;

		const timer = setTimeout(() => {
			router.navigate({ to: "/" });
		}, 1000);

		return () => clearTimeout(timer);
	}, [fromAuthFlow, routeContext.environment, router]);

	return (
		<div className="w-full h-full flex flex-col bg-linear-to-br from-background to-muted/20 overflow-y-auto">
			<div className="flex-1 flex flex-col justify-center px-4 py-6">
				<Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
					<CardContent className="p-4 space-y-4">
						<div className="flex flex-col items-center text-center space-y-3">
							<Avatar className="h-16 w-16 ring-2 ring-primary/20">
								{user.image ? (
									<img
										src={user.image}
										alt={user.email || "User"}
										className="rounded-full"
									/>
								) : (
									<div className="bg-primary/10 rounded-full h-full w-full flex items-center justify-center text-xl font-semibold text-primary">
										{(user.email?.charAt(0) || "U").toUpperCase()}
									</div>
								)}
							</Avatar>

							<div className="space-y-1">
								<h3 className="font-semibold text-base text-foreground">
									Signed In as
								</h3>
								<p className="text-sm text-muted-foreground break-all px-2">
									{user.email}
								</p>
							</div>
						</div>

						<Separator className="my-2" />

						<Button
							variant="destructive"
							size="sm"
							className="w-full h-10 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
							onClick={onLogout}
						>
							<LogOut className="mr-2 h-4 w-4" />
							Sign Out
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default LoggedInView;
