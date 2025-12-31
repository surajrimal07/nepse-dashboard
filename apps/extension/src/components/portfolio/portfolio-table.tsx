import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nepse-dashboard/ui/components/table";
import { Table } from "lucide-react";
import { useMemo, useState } from "react";
import { SortHeader } from "@/components/portfolio/sort-header";
import type {
	PortfolioItem,
	SortField,
	SortState,
} from "@/types/portfolio-type";

interface PortfolioTableProps {
	portfolioData: PortfolioItem[];
}

export function PortfolioTable({ portfolioData }: PortfolioTableProps) {
	const [sortState, setSortState] = useState<SortState>({
		field: "stock",
		direction: "asc",
	});

	const handleSort = (field: SortField) => {
		setSortState((prev) => ({
			field,
			direction:
				prev.field === field && prev.direction === "asc" ? "desc" : "asc",
		}));
	};

	const sortedData = useMemo(() => {
		return [...portfolioData].sort((a, b) => {
			const { field, direction } = sortState;
			const multiplier = direction === "asc" ? 1 : -1;

			if (field === "stock") {
				return multiplier * a.ticker.localeCompare(b.ticker);
			} else if (field === "unit") {
				return multiplier * (a.unit - b.unit);
			} else if (field === "wacc") {
				return multiplier * (a.wacc - b.wacc);
			} else if (field === "ltp") {
				return multiplier * (a.ltp - b.ltp);
			} else if (field === "dailyGain") {
				return multiplier * (a.dailyGain.percentage - b.dailyGain.percentage);
			} else if (field === "overallGain") {
				return (
					multiplier * (a.overallGain.percentage - b.overallGain.percentage)
				);
			}
			return 0;
		});
	}, [portfolioData, sortState]);

	const formatPercentage = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "percent",
			minimumFractionDigits: 1,
			maximumFractionDigits: 1,
		}).format(value / 100);
	};

	return (
		<div className="w-full overflow-auto rounded-md border border-border bg-card/50 backdrop-blur-sm">
			<Table>
				<TableHeader className="bg-muted/30">
					<TableRow>
						<TableHead className="w-[50px]">
							<SortHeader
								label="Stock"
								field="stock"
								sortState={sortState}
								onSort={handleSort}
								tooltip="Sort by stock ticker"
							/>
						</TableHead>
						<TableHead className="text-right">
							<SortHeader
								label="Units"
								field="unit"
								sortState={sortState}
								onSort={handleSort}
								className="justify-end"
								tooltip="Sort by number of units"
							/>
						</TableHead>
						<TableHead className="text-right">
							<SortHeader
								label="WACC"
								field="wacc"
								sortState={sortState}
								onSort={handleSort}
								className="justify-end"
								tooltip="Sort by weighted average cost price"
							/>
						</TableHead>
						<TableHead className="text-right">
							<SortHeader
								label="LTP"
								field="ltp"
								sortState={sortState}
								onSort={handleSort}
								className="justify-end"
								tooltip="Sort by last traded price"
							/>
						</TableHead>
						<TableHead className="text-right">
							<SortHeader
								label="Daily"
								field="dailyGain"
								sortState={sortState}
								onSort={handleSort}
								className="justify-end"
								tooltip="Sort by daily gain percentage"
							/>
						</TableHead>
						<TableHead className="text-right">
							<SortHeader
								label="Overall"
								field="overallGain"
								sortState={sortState}
								onSort={handleSort}
								className="justify-end"
								tooltip="Sort by overall gain percentage"
							/>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sortedData.map((item) => (
						<TableRow key={item.id} className="hover:bg-muted/20">
							<TableCell className="font-medium py-1">{item.ticker}</TableCell>
							<TableCell className="text-right py-1">{item.unit}</TableCell>
							<TableCell className="text-right py-1">{item.wacc}</TableCell>
							<TableCell className="text-right py-1">{item.ltp}</TableCell>
							<TableCell className="text-right py-1">
								<div
									className={`text-right ${
										item.dailyGain.percentage > 0
											? "text-green-500"
											: item.dailyGain.percentage < 0
												? "text-red-500"
												: ""
									}`}
								>
									<span>{formatPercentage(item.dailyGain.percentage)}</span>
								</div>
							</TableCell>
							<TableCell className="text-right py-1">
								<div
									className={`text-right ${
										item.overallGain.percentage > 0
											? "text-green-500"
											: item.overallGain.percentage < 0
												? "text-red-500"
												: ""
									}`}
								>
									<span>{formatPercentage(item.overallGain.percentage)}</span>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
