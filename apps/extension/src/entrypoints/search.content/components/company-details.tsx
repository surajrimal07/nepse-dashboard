import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import { TrendingDown, TrendingUp } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

interface CompanyDetailsProps {
	isDark: boolean;
	company: Doc<"company">;
}

const formatNumber = (num: number | undefined) => {
	if (num === undefined) return "N/A";
	return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
};

const formatCurrency = (num: number | undefined) => {
	if (num === undefined) return "N/A";
	return `Rs ${formatNumber(num)}`;
};

const formatPercentage = (num: number | undefined) => {
	if (num === undefined) return "N/A";
	return `${num > 0 ? "+" : ""}${num.toFixed(2)}%`;
};

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ isDark, company }) => {
	const isPositive = company.change >= 0;
	const changeColor = isPositive ? "text-green-500" : "text-red-500";

	return (
		<div className="w-full h-full p-1">
			<div className="w-full max-w-4xl mx-auto">
				<div className="mb-3">
					<div className="flex items-start justify-between">
						<div>
							<h1
								className={cn(
									"text-lg font-bold",
									isDark ? "text-zinc-200" : "text-slate-800",
								)}
							>
								{company.symbol}
							</h1>
							<p
								className={cn(
									"text-xs mt-0.5",
									isDark ? "text-zinc-400" : "text-slate-600",
								)}
							>
								{company.securityName}
							</p>
						</div>
						<div className="text-right">
							<div
								className={cn(
									"text-xl font-bold",
									isDark ? "text-zinc-200" : "text-slate-800",
								)}
							>
								{formatCurrency(company.closePrice)}
							</div>
							<div className={cn("flex items-center gap-1 justify-end mt-1")}>
								{isPositive ? (
									<TrendingUp className={cn(changeColor, "w-4 h-4")} />
								) : (
									<TrendingDown className={cn(changeColor, "w-4 h-4")} />
								)}
								<span className={cn("text-sm font-semibold", changeColor)}>
									{formatCurrency(company.change)} (
									{formatPercentage(company.percentageChange)})
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
					<div
						className={cn(
							"p-2 rounded-lg",
							isDark ? "bg-slate-800" : "bg-slate-100",
						)}
					>
						<div
							className={cn(
								"text-xs mb-0.5",
								isDark ? "text-zinc-400" : "text-slate-600",
							)}
						>
							Open
						</div>
						<div
							className={cn(
								"text-sm font-semibold",
								isDark ? "text-zinc-200" : "text-slate-800",
							)}
						>
							{formatCurrency(company.openPrice)}
						</div>
					</div>

					<div
						className={cn(
							"p-2 rounded-lg",
							isDark ? "bg-slate-800" : "bg-slate-100",
						)}
					>
						<div
							className={cn(
								"text-xs mb-0.5",
								isDark ? "text-zinc-400" : "text-slate-600",
							)}
						>
							High
						</div>
						<div className={cn("text-sm font-semibold text-green-500")}>
							{formatCurrency(company.highPrice)}
						</div>
					</div>

					<div
						className={cn(
							"p-2 rounded-lg",
							isDark ? "bg-slate-800" : "bg-slate-100",
						)}
					>
						<div
							className={cn(
								"text-xs mb-0.5",
								isDark ? "text-zinc-400" : "text-slate-600",
							)}
						>
							Low
						</div>
						<div className={cn("text-sm font-semibold text-red-500")}>
							{formatCurrency(company.lowPrice)}
						</div>
					</div>

					<div
						className={cn(
							"p-2 rounded-lg",
							isDark ? "bg-slate-800" : "bg-slate-100",
						)}
					>
						<div
							className={cn(
								"text-xs mb-0.5",
								isDark ? "text-zinc-400" : "text-slate-600",
							)}
						>
							Prev. Close
						</div>
						<div
							className={cn(
								"text-sm font-semibold",
								isDark ? "text-zinc-200" : "text-slate-800",
							)}
						>
							{formatCurrency(company.previousClose)}
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
					<div
						className={cn(
							"p-2 rounded-lg",
							isDark ? "bg-slate-800" : "bg-slate-100",
						)}
					>
						<div
							className={cn(
								"text-xs mb-1 font-medium",
								isDark ? "text-zinc-400" : "text-slate-600",
							)}
						>
							Trading Volume
						</div>
						<div className="space-y-1">
							<div className="flex justify-between items-center">
								<span
									className={cn(
										"text-sm",
										isDark ? "text-zinc-300" : "text-slate-700",
									)}
								>
									Shares Traded
								</span>
								<span
									className={cn(
										"text-sm font-semibold",
										isDark ? "text-zinc-200" : "text-slate-800",
									)}
								>
									{formatNumber(company.totalTradedShared)}
								</span>
							</div>
							{company.totalTrades !== undefined && (
								<div className="flex justify-between items-center">
									<span
										className={cn(
											"text-sm",
											isDark ? "text-zinc-300" : "text-slate-700",
										)}
									>
										Total Trades
									</span>
									<span
										className={cn(
											"text-sm font-semibold",
											isDark ? "text-zinc-200" : "text-slate-800",
										)}
									>
										{formatNumber(company.totalTrades)}
									</span>
								</div>
							)}
							<div className="flex justify-between items-center">
								<span
									className={cn(
										"text-sm",
										isDark ? "text-zinc-300" : "text-slate-700",
									)}
								>
									Turnover
								</span>
								<span
									className={cn(
										"text-sm font-semibold",
										isDark ? "text-zinc-200" : "text-slate-800",
									)}
								>
									{formatCurrency(company.turnover)}
								</span>
							</div>
						</div>
					</div>

					<div
						className={cn(
							"p-2 rounded-lg",
							isDark ? "bg-slate-800" : "bg-slate-100",
						)}
					>
						<div
							className={cn(
								"text-xs mb-1 font-medium",
								isDark ? "text-zinc-400" : "text-slate-600",
							)}
						>
							52-Week Range
						</div>
						<div className="space-y-1">
							{company.fiftyTwoWeekHigh !== undefined && (
								<div className="flex justify-between items-center">
									<span
										className={cn(
											"text-sm",
											isDark ? "text-zinc-300" : "text-slate-700",
										)}
									>
										52W High
									</span>
									<span className="text-sm font-semibold text-green-500">
										{formatCurrency(company.fiftyTwoWeekHigh)}
									</span>
								</div>
							)}
							{company.fiftyTwoWeekLow !== undefined && (
								<div className="flex justify-between items-center">
									<span
										className={cn(
											"text-sm",
											isDark ? "text-zinc-300" : "text-slate-700",
										)}
									>
										52W Low
									</span>
									<span className="text-sm font-semibold text-red-500">
										{formatCurrency(company.fiftyTwoWeekLow)}
									</span>
								</div>
							)}

							{/* 52-Week Range Bar Visualization */}
							{company.fiftyTwoWeekHigh !== undefined &&
								company.fiftyTwoWeekLow !== undefined &&
								company.closePrice !== undefined && (
									<div className="w-full flex flex-col items-center my-1">
										<div
											className={cn(
												"relative w-full h-2 rounded bg-gray-200 dark:bg-zinc-500",
												isDark ? "bg-zinc-700" : "bg-gray-200",
											)}
											style={{ minWidth: 0 }}
										>
											<div
												className="absolute h-full bg-background rounded-full"
												style={{
													width: `${calculatePricePosition(company.closePrice, company.fiftyTwoWeekLow, company.fiftyTwoWeekHigh)}%`,
												}}
											/>
										</div>
										<div className="flex justify-between w-full text-xs mt-1">
											<span
												className={cn(
													isDark ? "text-zinc-300" : "text-slate-700",
												)}
											>
												Low
											</span>
											<span
												className={cn(
													isDark ? "text-zinc-300" : "text-slate-700",
												)}
											>
												High
											</span>
										</div>
									</div>
								)}

							{company.percentage_change_monthly !== undefined && (
								<div className="flex justify-between items-center">
									<span
										className={cn(
											"text-sm",
											isDark ? "text-zinc-300" : "text-slate-700",
										)}
									>
										Monthly Change
									</span>
									<span
										className={cn(
											"text-sm font-semibold",
											company.percentage_change_monthly >= 0
												? "text-green-500"
												: "text-red-500",
										)}
									>
										{formatPercentage(company.percentage_change_monthly)}
									</span>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Additional Info */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
					<div
						className={cn(
							"p-2 rounded-lg",
							isDark ? "bg-slate-800" : "bg-slate-100",
						)}
					>
						<div
							className={cn(
								"text-xs mb-0.5",
								isDark ? "text-zinc-400" : "text-slate-600",
							)}
						>
							Sector
						</div>
						<div
							className={cn(
								"text-sm font-semibold",
								isDark ? "text-zinc-200" : "text-slate-800",
							)}
						>
							{company.sectorName}
						</div>
					</div>

					{company.marketCapitalization && (
						<div
							className={cn(
								"p-2 rounded-lg",
								isDark ? "bg-slate-800" : "bg-slate-100",
							)}
						>
							<div
								className={cn(
									"text-xs mb-0.5",
									isDark ? "text-zinc-400" : "text-slate-600",
								)}
							>
								Market Cap
							</div>
							<div
								className={cn(
									"text-sm font-semibold",
									isDark ? "text-zinc-200" : "text-slate-800",
								)}
							>
								{company.marketCapitalization}
							</div>
						</div>
					)}

					{company.lastTradedPrice !== undefined && (
						<div
							className={cn(
								"p-2 rounded-lg",
								isDark ? "bg-slate-800" : "bg-slate-100",
							)}
						>
							<div
								className={cn(
									"text-xs mb-0.5",
									isDark ? "text-zinc-400" : "text-slate-600",
								)}
							>
								Last Traded Price
							</div>
							<div
								className={cn(
									"text-sm font-semibold",
									isDark ? "text-zinc-200" : "text-slate-800",
								)}
							>
								{formatCurrency(company.lastTradedPrice)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CompanyDetails;
