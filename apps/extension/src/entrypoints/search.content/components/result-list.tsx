import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import { memo, useCallback } from "react";
import type { ListChildComponentProps } from "react-window";
import { FixedSizeList } from "react-window";
import { useShallow } from "zustand/react/shallow";
import type { modeType } from "@/types/search-type";
import { selectIsDark, selectMode } from "../selectors";
import { useSearchState } from "../store";

import {
	formatValue,
	formatWithSign,
	getButtonClass,
	getChangeClass,
	getContainerClass,
	getModeClass,
	getModeText,
	getNameClass,
	getPriceClass,
	getSymbolClass,
} from "../utils";
import CompanyDetails from "./company-details";
import NotFound from "./not-found";

const itemHeight = 75;
const maxVisibleItems = 10;

interface ResultsListProps {
	handleVisitChart: (symbol: string) => void;
	results: Doc<"company">[];
}

interface ResultItemProps {
	company: Doc<"company">;
	isDark: boolean;
	mode: modeType;
	onVisitChart: (symbol: string) => void;
	style?: React.CSSProperties;
}

const ResultItem = memo(
	({ company, isDark, mode, onVisitChart, style }: ResultItemProps) => {
		const pos = (company.change ?? 0) >= 0;

		const handleClick = useCallback(() => {
			onVisitChart(company.symbol);
		}, [company.symbol, onVisitChart]);

		const price = formatValue(company.closePrice);
		const change = formatWithSign(company.change);
		const percent = formatWithSign(company.percentageChange);
		const rowStyle = style
			? {
					...style,
					height: (style.height as number) - 8,
					top: (style.top as number) + 8,
					boxSizing: "border-box" as const,
				}
			: undefined;

		return (
			<button
				type="button"
				className={getButtonClass(isDark)}
				onClick={handleClick}
				style={rowStyle}
			>
				<div className="flex items-center justify-between gap-3">
					<div className="min-w-0 flex-1">
						<div className={getSymbolClass(isDark)}>{company.symbol}</div>
						<div className={getNameClass(isDark)}>{company.securityName}</div>
					</div>

					<div className="text-right shrink-0">
						<div className={getPriceClass(isDark)}>Rs {price}</div>
						<div className="mt-1 flex items-center justify-end gap-2.5 text-[11px] font-medium">
							<span className={getChangeClass(pos)}>{change}</span>
							<span className={getChangeClass(pos)}>{percent}%</span>
						</div>
					</div>
				</div>

				<div className={getModeClass(isDark)}>{getModeText(mode)}</div>
			</button>
		);
	},
);

ResultItem.displayName = "ResultItem";

export default function ResultsList({
	handleVisitChart,
	results,
}: ResultsListProps) {
	const { isDark, mode } = useSearchState(
		useShallow((state) => ({
			isDark: selectIsDark(state),
			mode: selectMode(state),
		})),
	);

	const containerClassName = getContainerClass(isDark);

	const visibleItems = Math.min(results.length, maxVisibleItems);
	const listHeight = visibleItems * itemHeight;

	const renderRow = useCallback(
		({ index, style }: ListChildComponentProps) => {
			const company = results[index];

			return (
				<ResultItem
					key={company._id}
					company={company}
					isDark={isDark}
					mode={mode}
					onVisitChart={handleVisitChart}
					style={style}
				/>
			);
		},
		[results, isDark, mode, handleVisitChart],
	);

	return (
		<div className={containerClassName}>
			{results.length === 0 ? (
				<NotFound isDark={isDark} />
			) : results.length === 1 ? (
				<CompanyDetails company={results[0]} isDark={isDark} />
			) : (
				<FixedSizeList
					height={listHeight}
					width="100%"
					itemCount={results.length}
					itemSize={itemHeight}
					className="scrollbar-hide"
				>
					{renderRow}
				</FixedSizeList>
			)}
		</div>
	);
}
