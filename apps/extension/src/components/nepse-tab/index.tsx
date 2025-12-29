import type { FC } from "react";
import { lazy, memo } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import BottomInfo from "@/components/nepse-tab/bottom-info";
import { UniversalErrorBoundry } from "@/components/universal-error-boundary";
import { selectToggleDashboard } from "@/selectors/dashboard-selector";
import { useDashboardState } from "@/state/dashboard-state";
import Loading from "../loading";

const IndexDataComponent = lazy(() => import("@/components/nepse-tab/data-ui"));

const ChartComponent = lazy(() => import("@/components/nepse-tab/chart-ui"));

const TopInfo = lazy(() => import("@/components/nepse-tab/top-info"));

const NepseIndex: FC = memo(() => {
	const toggleDashboard = useDashboardState(selectToggleDashboard);

	const toggle = (direction: "next" | "prev") => {
		const result = toggleDashboard(direction);
		toast.success(result.message);
	};

	useHotkeys("ArrowLeft", () => toggle("prev"));
	useHotkeys("ArrowRight", () => toggle("next"));

	return (
		<>
			<UniversalErrorBoundry componentName="Top Info" minimal>
				<Suspense fallback={<Loading />}>
					<TopInfo />
				</Suspense>
			</UniversalErrorBoundry>

			<UniversalErrorBoundry componentName="Chart" minimal>
				<div className="w-full relative h-[225px] rounded-lg">
					<Suspense fallback={<Loading />}>
						<ChartComponent />
					</Suspense>
				</div>
			</UniversalErrorBoundry>
			<UniversalErrorBoundry componentName="Index Data" minimal>
				<Suspense fallback={<Loading />}>
					<div className="w-full rounded-lg p-1">
						<IndexDataComponent />
						<BottomInfo isSidpenal={false} />
					</div>
				</Suspense>
			</UniversalErrorBoundry>
		</>
	);
});

NepseIndex.displayName = "NepseIndex";

export default NepseIndex;
