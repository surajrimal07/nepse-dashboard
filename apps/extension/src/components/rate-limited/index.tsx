// import { Badge } from "@nepse-dashboard/ui/components/badge";
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardFooter,
// 	CardHeader,
// 	CardTitle,
// } from "@nepse-dashboard/ui/components/card";
// import { AlertTriangle } from "lucide-react";
// import { memo, useEffect, useMemo, useState } from "react";
// import useScreenView from "@/hooks/usePageView";
// import { selectConnectionStatus } from "@/selectors/connection-selector";
// import { selectRateLimit } from "@/selectors/ratelimit-selector";
// import { useConnectionStatusState } from "@/state/connection-state";
// import { useRateLimitState } from "@/state/rate-limit-state";

// // Constants to avoid recreating static values
// const WINDOW_TEXT = {
// 	LIMIT: "Limit:",
// 	TIME_WINDOW: "Time Window:",
// 	REMAINING: "Remaining:",
// 	RESET_IN: "Reset in:",
// };

// const TEXTS = {
// 	CARD_TITLE: "Too many requests",
// };

// const InfoMessage = memo(() => (
// 	<Card className="border-none shadow-none bg-muted/30 backdrop-blur-sm">
// 		<CardContent className="space-y-3 pt-1 text-sm text-muted-foreground text-center">
// 			<div className="space-y-1">
// 				<p className="text-base font-medium text-foreground">
// 					Rate limit reached
// 				</p>
// 				<p>
// 					This project has limited capacity. Heavy or unusual usage may trigger
// 					temporary limits.
// 				</p>
// 			</div>

// 			<div className="rounded-lg p-4 border border-blue-500/30 bg-blue-500/10 text-left">
// 				<div className="flex items-center gap-2 mb-1">
// 					<AlertTriangle className="h-4 w-4 text-blue-400" />
// 					<p className="text-blue-400 font-medium text-sm">
// 						Premium users get more requests
// 					</p>
// 				</div>
// 				<p className="text-sm text-muted-foreground">
// 					Please log in or upgrade to increase your rate limits and support the
// 					project.
// 				</p>
// 			</div>

// 			<p className="text-xs mt-2">
// 				If this seems like a mistake, feel free to contact the developer.
// 			</p>
// 		</CardContent>
// 	</Card>
// ));

// InfoMessage.displayName = "InfoMessage";

// function RateLimitNotification() {
// 	useScreenView("/rate-limit-dialog");

// 	const rateLimit = useRateLimitState(selectRateLimit);

// 	const { remaining, limit, ttl, windowInSeconds } = rateLimit;

// 	const [remainingSeconds, setRemainingSeconds] = useState(ttl);
// 	const connectionStatus = useConnectionStatusState(selectConnectionStatus);

// 	// Derived state to check connection status
// 	const isConnected =
// 		connectionStatus.subscriptionStatus === "subscriptionSuccess";

// 	useEffect(() => {
// 		// Set initial remaining seconds
// 		setRemainingSeconds(ttl);

// 		// Separate timer for UI countdown - using Date objects for accurate timing
// 		const startTime = Date.now();
// 		const endTime = startTime + ttl * 1000;

// 		const interval = setInterval(() => {
// 			const now = Date.now();
// 			const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
// 			setRemainingSeconds(remaining);

// 			// If remaining time reaches zero, we can just keep showing zero
// 			if (remaining <= 0) {
// 				setRemainingSeconds(0);
// 			}
// 		}, 1000);

// 		return () => {
// 			clearInterval(interval);
// 		};
// 	}, [ttl]);

// 	// Status label text based on connection status and timer
// 	const statusLabel = useMemo(() => {
// 		if (!isConnected) {
// 			return "Waiting for connection";
// 		} else if (remainingSeconds > 0) {
// 			return `Auto resolving in ${remainingSeconds}s`;
// 		} else {
// 			return "Timeout complete";
// 		}
// 	}, [isConnected, remainingSeconds]);

// 	const labelVariant = useMemo(() => {
// 		if (!isConnected) {
// 			return "outline";
// 		} else if (remainingSeconds > 0) {
// 			return "secondary";
// 		} else {
// 			return "default";
// 		}
// 	}, [isConnected, remainingSeconds]);

// 	const cardDescription = useMemo(
// 		() => (
// 			<>
// 				<CardDescription className="text-muted-foreground">
// 					Your requests have been temporarily limited
// 				</CardDescription>
// 			</>
// 		),
// 		[],
// 	);

// 	return (
// 		<Card className="w-[330px] mx-auto">
// 			<CardHeader className="space-y-1">
// 				<div className="flex items-center space-x-1">
// 					<div className="relative">
// 						<AlertTriangle className="h-6 w-6 text-destructive" />
// 						<span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive" />
// 					</div>
// 					<CardTitle className="text-lg font-semibold">
// 						{TEXTS.CARD_TITLE}
// 					</CardTitle>
// 				</div>
// 				{cardDescription}
// 			</CardHeader>

// 			<CardContent className="space-y-4">
// 				<Card className="border-none shadow-none bg-muted/30 backdrop-blur-sm">
// 					<CardContent className="p-3">
// 						<div className="grid grid-cols-2 gap-2 text-sm">
// 							<span className="text-muted-foreground">{WINDOW_TEXT.LIMIT}</span>
// 							<span className="font-medium text-right">{limit} requests</span>

// 							<span className="text-muted-foreground">
// 								{WINDOW_TEXT.TIME_WINDOW}
// 							</span>
// 							<span className="font-medium text-right">
// 								{windowInSeconds} seconds
// 							</span>

// 							<span className="text-muted-foreground">
// 								{WINDOW_TEXT.REMAINING}
// 							</span>
// 							<span className="font-medium text-right">
// 								{remaining} requests
// 							</span>

// 							<span className="text-muted-foreground">
// 								{WINDOW_TEXT.RESET_IN}
// 							</span>
// 							<span className="font-medium text-right">{ttl} seconds</span>
// 						</div>
// 					</CardContent>
// 				</Card>
// 				<InfoMessage />
// 			</CardContent>

// 			<CardFooter className="px-3 py-2 flex justify-center">
// 				<Badge
// 					variant={labelVariant as "default" | "secondary" | "outline"}
// 					className="px-3 py-1 text-xs"
// 				>
// 					{statusLabel}
// 				</Badge>
// 			</CardFooter>
// 		</Card>
// 	);
// }

// export default memo(RateLimitNotification);
