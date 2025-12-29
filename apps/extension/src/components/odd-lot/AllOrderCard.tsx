// import { Badge } from "@nepse-dashboard/ui/components/badge";
// import { createCrannStateHook } from "crann-fork";
// import {
// 	ChevronDown,
// 	ChevronUp,
// 	CircleDollarSign,
// 	UserRoundCheck,
// } from "lucide-react";
// import type { CSSProperties, FC } from "react";
// import { useCallback, useMemo, useState } from "react";
// import TimeAgo from "react-timeago";

// import { toast } from "sonner";
// import { BargainDialog } from "@/components/odd-lot/bargain-order";
// import { ConfirmOrderDialog } from "@/components/odd-lot/confirm-order";
// import { appState } from "@/lib/service/app-service";
// import { cn } from "@/lib/utils";
// import { useCompaniesState } from "@/state/company-state";
// import type { CompletionsOrders, Oddlot } from "@/types/odd-types";
// import {
// 	OddLotOrderSideConst,
// 	OddLotOrderStatusConst,
// } from "@/types/odd-types";
// import { getFormattedTime } from "@/utils/utils";
// import {
// 	getCompletionStatusColor,
// 	getFormattedOrderTime,
// 	getOrderStatusBadgeClass,
// 	getOrderTypeBadgeClass,
// 	getOrderTypeBorderClass,
// 	getPriceDiff,
// 	getPriceDiffColor,
// } from "./utils";

// interface AllOrderCardProps {
// 	order: Oddlot;
// 	completions?: CompletionsOrders;
// 	style?: CSSProperties;
// }
// const useAppState = createCrannStateHook(appState);

// export const AllOrderCard: FC<AllOrderCardProps> = ({
// 	order,
// 	completions,
// 	style,
// }) => {
// 	const { useStateItem } = useAppState();

// 	const [showCompleteDialog, setShowCompleteDialog] = useState(false);
// 	const [showBargainDialog, setShowBargainDialog] = useState(false);

// 	const [showCompletion, setShowCompletion] = useState(false);

// 	const openTradePage = useHandleOpenTradePage();

// 	const [userProfile] = useStateItem("userProfile");
// 	const [tmsUrl] = useStateItem("tmsUrl");

// 	const companyData = useCompaniesState((c) =>
// 		c.companiesData?.data.find((s) => s.symbol === order.stock_symbol),
// 	);

// 	// Handle buy button
// 	const handleBuy = useCallback(async () => {
// 		if (tmsUrl && order.stock_symbol) {
// 			await openTradePage(order.stock_symbol, "Buy");
// 		}
// 	}, [tmsUrl, order.stock_symbol]);

// 	// Handle sell button
// 	const handleSell = useCallback(async () => {
// 		if (tmsUrl && order.stock_symbol) {
// 			await openTradePage(order.stock_symbol, "Sell");
// 		}
// 	}, [tmsUrl, order.stock_symbol]);

// 	const handleBargainSubmit = () => {
// 		setShowBargainDialog(false);
// 		toast.info("Your bargain request has been submitted.");
// 	};

// 	const orderDate = useMemo(
// 		() => new Date(order.created_at),
// 		[order.created_at],
// 	);

// 	const formattedTime = useMemo(
// 		() => getFormattedOrderTime(order.created_at),
// 		[order.created_at],
// 	);

// 	const priceDiff = useMemo(
// 		() => getPriceDiff(order.price, companyData?.closePrice),
// 		[order.price, companyData?.closePrice],
// 	);

// 	const priceDiffColor = useMemo(
// 		() => getPriceDiffColor(priceDiff),
// 		[priceDiff],
// 	);

// 	const completionStatusColor = useMemo(
// 		() => getCompletionStatusColor(completions),
// 		[completions],
// 	);

// 	const orderBorderClass = useMemo(
// 		() => getOrderTypeBorderClass(order.order_type),
// 		[order.order_type],
// 	);

// 	const orderTypeBadgeClass = useMemo(
// 		() => getOrderTypeBadgeClass(order.order_type),
// 		[order.order_type],
// 	);

// 	const orderStatusBadgeClass = useMemo(
// 		() => getOrderStatusBadgeClass(order.status),
// 		[order.status],
// 	);

// 	return (
// 		<div style={style} className="px-1.5">
// 			<div
// 				className={cn(
// 					"border rounded-lg p-2 mb-2 border-l-4 hover:bg-gray-750 transition-colors relative",
// 					orderBorderClass,
// 				)}
// 			>
// 				<div className="flex justify-between items-start mb-2">
// 					<div className="grow mr-2">
// 						<h3 className="font-medium text-white flex justify-between items-center">
// 							<span className="flex items-center gap-1">
// 								{order.stock_symbol}
// 								<Badge
// 									variant="outline"
// 									className={cn("text-[10px] px-1 py-0", orderTypeBadgeClass)}
// 								>
// 									{order.order_type.toUpperCase()}
// 								</Badge>
// 								<Badge
// 									variant="outline"
// 									className={cn("text-[10px] px-1 py-0", orderStatusBadgeClass)}
// 								>
// 									{order.status.toUpperCase()}
// 								</Badge>
// 							</span>

// 							<span className="flex space-x-1">
// 								{order.status === OddLotOrderStatusConst.OPEN &&
// 									order.user_id !== userProfile?.supabaseId && (
// 										<>
// 											<button
// 												onClick={() => setShowCompleteDialog(true)}
// 												className="p-1 rounded-full text-gray-400 hover:text-green-500 hover:bg-gray-700 transition-colors"
// 												title="I want to complete this order"
// 											>
// 												<UserRoundCheck size={18} />
// 											</button>
// 											<button
// 												onClick={() => setShowBargainDialog(true)}
// 												className="p-1 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-700 transition-colors"
// 												title="Bargain price"
// 											>
// 												<CircleDollarSign size={18} />
// 											</button>
// 											{tmsUrl &&
// 												order.order_type === OddLotOrderSideConst.BUY && (
// 													<button
// 														onClick={handleSell}
// 														className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-700 transition-colors"
// 														title={`Sell ${order.stock_symbol} via TMS`}
// 													>
// 														<span>SELL</span>
// 													</button>
// 												)}
// 											{tmsUrl &&
// 												order.order_type === OddLotOrderSideConst.SELL && (
// 													<button
// 														onClick={handleBuy}
// 														className="p-1 rounded-full text-gray-400 hover:text-green-500 hover:bg-gray-700 transition-colors"
// 														title={`Buy ${order.stock_symbol} via TMS`}
// 													>
// 														<span>BUY</span>
// 													</button>
// 												)}
// 										</>
// 									)}
// 							</span>
// 						</h3>
// 						<p className="text-xs text-gray-400 mt-1">
// 							{formattedTime} |
// 							<TimeAgo date={orderDate} />
// 							{companyData?.closePrice && (
// 								<>
// 									{" "}
// 									• LTP: {Number(companyData.closePrice)} | Diff:{" "}
// 									<span className={cn(priceDiffColor)}>{priceDiff}%</span>
// 								</>
// 							)}
// 						</p>
// 					</div>
// 				</div>

// 				<div className="flex justify-between">
// 					<div>
// 						<p className="text-sm text-gray-300">
// 							<span className="font-medium">Quantity:</span> {order.quantity}
// 						</p>
// 					</div>
// 					<div>
// 						<p className="text-sm text-gray-300">
// 							<span className="font-medium">Amount:</span>{" "}
// 							{(order.quantity * order.price).toFixed(1)}
// 						</p>
// 					</div>
// 					<div>
// 						<p className="text-sm text-gray-300">
// 							<span className="font-medium">Per Unit:</span> {order.price}
// 						</p>
// 					</div>
// 				</div>

// 				{completions && (
// 					<div className="space-y-2 mt-2">
// 						<div className="border border-gray-700 rounded-md overflow-hidden">
// 							<button
// 								onClick={() => setShowCompletion(!showCompletion)}
// 								className="w-full px-2 py-2 flex items-center justify-between text-sm text-gray-300 hover:bg-gray-700 transition-colors"
// 							>
// 								<div className="flex items-center">
// 									<span>Your Request</span>
// 								</div>
// 								{showCompletion ? (
// 									<ChevronUp size={16} />
// 								) : (
// 									<ChevronDown size={16} />
// 								)}
// 							</button>

// 							{showCompletion && (
// 								<div className="border-t border-gray-700 divide-y divide-gray-700">
// 									<div className="px-2 py-2 hover:bg-gray-750 space-y-1">
// 										<div className="flex items-center justify-between">
// 											<span className="text-xs text-gray-400">
// 												{getFormattedTime(completions.updated_at)} |{" "}
// 												<TimeAgo date={new Date(completions.updated_at)} />
// 											</span>
// 										</div>

// 										<p className="text-sm text-gray-300">
// 											Message:
// 											{completions.message || "N/A"}
// 										</p>
// 										<p className="text-sm text-gray-300">
// 											Status:{" "}
// 											<span
// 												className={cn("font-semibold", completionStatusColor)}
// 											>
// 												{completions.status}
// 											</span>
// 										</p>
// 										<div className="flex space-x-2 pt-1">
// 											<button
// 												onClick={() => {
// 													// TODO: Implement delete functionality for this specific request
// 													console.log(
// 														"Delete requested for completion ID:",
// 														completions.id,
// 														"on order ID:",
// 														order.id,
// 													);
// 													// Example: handleDeleteCompletionRequest(order.id, completions.id);
// 												}}
// 												className="flex-1 px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
// 											>
// 												Delete Request
// 											</button>
// 										</div>
// 									</div>
// 								</div>
// 							)}
// 						</div>
// 					</div>
// 				)}

// 				{showCompleteDialog && companyData && (
// 					<ConfirmOrderDialog
// 						order={order}
// 						onSubmit={() => setShowCompleteDialog(false)}
// 						onClose={() => setShowCompleteDialog(false)}
// 					/>
// 				)}

// 				{showBargainDialog && companyData && (
// 					<BargainDialog
// 						order={order}
// 						companyData={companyData}
// 						onSubmit={handleBargainSubmit}
// 						onClose={() => setShowBargainDialog(false)}
// 						askPriceDiff={priceDiff}
// 					/>
// 				)}
// 			</div>
// 		</div>
// 	);
// };
