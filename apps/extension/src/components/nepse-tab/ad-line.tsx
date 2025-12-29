import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@nepse-dashboard/ui/components/tooltip";
import type { FC } from "react";
import { memo, useMemo } from "react";
import { calculateAdvanceDeclineWidths } from "@/components/nepse-tab/utils";
import type { AdvanceDecline } from "@/types/indexes-type";

interface AdLineProps {
	data?: AdvanceDecline;
	isIndexDataLoading: boolean;
}

const AdLine: FC<AdLineProps> = memo(({ data, isIndexDataLoading }) => {
	const { advanceWidth, neutralWidth, declineWidth } = useMemo(
		() => calculateAdvanceDeclineWidths(data),
		[data],
	);

	const renderBar = useMemo(() => {
		return (
			<div className="h-0.5 w-full rounded-full flex">
				<div
					style={{ width: `${advanceWidth}%` }}
					className="h-full bg-[#00ff00]"
				/>
				<div
					style={{ width: `${neutralWidth}%` }}
					className="h-full bg-orange-500"
				/>
				<div
					style={{ width: `${declineWidth}%` }}
					className="h-full bg-[#ef4444] "
				/>
			</div>
		);
	}, [advanceWidth, neutralWidth, declineWidth]);

	if (isIndexDataLoading || !data) {
		return (
			<div className="h-0.5 w-full rounded-full">
				<div className="h-full w-full animate-pulse bg-gray-300" />
			</div>
		);
	}
	if (!data && !isIndexDataLoading) {
		return (
			<div className="w-full p-0 rounded-lg">
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="cursor-help">
							<div className="h-0.5 w-full rounded-full">
								<div className="h-full w-full bg-gray-300" />
							</div>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<div className="text-xs text-red-500">
							An error occurred while getting the data
						</div>
					</TooltipContent>
				</Tooltip>
			</div>
		);
	}

	return (
		<div className="w-full p-0 rounded-lg">
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="cursor-help">{renderBar}</div>
				</TooltipTrigger>
				<TooltipContent>
					<div className="text-xs">
						<p>Advance: {data.advance}</p>
						<p>Neutral: {data.neutral}</p>
						<p>Decline: {data.decline}</p>
					</div>
				</TooltipContent>
			</Tooltip>
		</div>
	);
});

AdLine.displayName = "AdLine";
export default AdLine;
