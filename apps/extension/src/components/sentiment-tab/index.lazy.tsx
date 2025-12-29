import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import { createLazyRoute } from "@tanstack/react-router";
import { lazy, useMemo } from "react";
import GaugeComponent from "react-gauge-component";
import BackButton from "@/components/back-button/back-button";
import { strengthToPercentage } from "@/components/sentiment-tab/utils";
import { getSentiment } from "@/hooks/convex/useSentiment";
import Loading from "../loading";

const LoadingFailed = lazy(() => import("@/components/loading-failed"));

export const Route = createLazyRoute("/sentiment")({
	component: SentimentChart,
});

export default function SentimentChart() {
	const { data, isPending, error } = getSentiment();

	const percentage = useMemo(() => {
		if (!data) return 0;
		return strengthToPercentage(data.strength);
	}, [data]);

	if ((!isPending && !data) || error) {
		return (
			<div className="w-full h-full flex items-center justify-center">
				<Suspense fallback={<Loading />}>
					<LoadingFailed />
				</Suspense>
			</div>
		);
	}

	return (
		<div className="w-full p-2">
			{isPending ? (
				<div className="flex justify-center mb-4">
					<Skeleton className="w-64 h-64 rounded-full" />
				</div>
			) : (
				<GaugeComponent
					value={percentage}
					type="radial"
					labels={{
						valueLabel: {
							matchColorWithArc: true,
						},
						tickLabels: {
							type: "outer",
							ticks: [
								{ value: 20 },
								{ value: 40 },
								{ value: 60 },
								{ value: 80 },
								{ value: 100 },
							],
						},
					}}
					arc={{
						colorArray: ["#ef4444", "#00ff00"],
						subArcs: [{ limit: 10 }, { limit: 30 }, {}, {}, {}],
						padding: 0.02,
						width: 0.3,
					}}
					pointer={{
						elastic: true,
						animationDelay: 0,
					}}
				/>
			)}

			<div className="text-xl font-bold text-center mt-3">
				{isPending ? (
					<div className="flex justify-center">
						<Skeleton className="h-7 w-32" />
					</div>
				) : (
					data?.prediction
				)}
			</div>

			<div className="mt-2 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
				{isPending ? (
					<div className="space-y-2">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-4 w-5/6" />
						<Skeleton className="h-4 w-4/5" />
					</div>
				) : (
					<p className="text-sm text-justify text-yellow-700 dark:text-yellow-200/70">
						⚠️ <strong>Disclaimer:</strong> This prediction is based on index
						weight and company weight calculations. It should not be considered
						as financial advice or a guaranteed market indicator. Use this
						information only as a supplementary data point for your own
						research. The author bears no responsibility for any financial
						decisions or losses incurred.
					</p>
				)}
			</div>
			<BackButton showBack={true} />
		</div>
	);
}
