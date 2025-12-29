// import { Progress } from "@nepse-dashboard/ui/components/progress";
// import { memo } from "react";
// import { selectRateLimit } from "@/selectors/ratelimit-selector";
// import { useRateLimitState } from "@/state/rate-limit-state";

// export const GeneralRateLimit = memo(() => {
// 	const rateLimit = useRateLimitState(selectRateLimit);

// 	const { remaining, limit, ttl } = rateLimit;
// 	const hasData = remaining !== null;
// 	const progressValue = hasData ? (remaining / limit) * 100 : 0;

// 	return (
// 		<div className="space-y-1">
// 			<div className="flex justify-between text-xs">
// 				<span>General Rate Limit</span>
// 				<span>{hasData ? `${remaining} remaining` : "N/A"}</span>
// 			</div>
// 			{hasData && (
// 				<Progress value={progressValue} max={100} className="h-1.5" />
// 			)}
// 			{ttl !== null && ttl > 0 && (
// 				<p className="text-[10px] text-muted-foreground">
// 					Resets in
// 					{ttl} seconds
// 				</p>
// 			)}
// 		</div>
// 	);
// });
// GeneralRateLimit.displayName = "GeneralRateLimit";
