// import { Badge } from "@nepse-dashboard/ui/components/badge";
// import {
// 	CheckCircle,
// 	ChevronDown,
// 	ChevronUp,
// 	Trash2,
// 	Users,
// } from "lucide-react";
// import type { CSSProperties, FC } from "react";

// import { useCallback, useMemo, useState } from "react";

// import TimeAgo from "react-timeago";
// import { toast } from "sonner";
// import {
// 	getFormattedOrderTime,
// 	getOrderStatusBadgeClass,
// 	getOrderTypeBadgeClass,
// 	getOrderTypeBorderClass,
// 	getPriceDiff,
// 	getPriceDiffColor,
// } from "@/components/odd-lot/utils";
// import { cn } from "@/lib/utils";
// import { selectRespondCompletions } from "@/selectors/completion-selector";
// import { selectModifyOddlot } from "@/selectors/odd-selector";
// import { useCompaniesState } from "@/state/company-state";
// import { useCompletionsState } from "@/state/completions-state";
// import { useOddlotState } from "@/state/odd-state";
// import type {
// 	CompletionsOrders,
// 	CompletionsStatus,
// 	Oddlot,
// } from "@/types/odd-types";
// import {
// 	CompletionsStatusConst,
// 	OddLotOrderStatusConst,
// } from "@/types/odd-types";
// import { getFormattedTime } from "@/utils/utils";

// interface MyOrderCardProps {
// 	order: Oddlot;
// 	completions: CompletionsOrders[];
// 	style?: CSSProperties;
// }

// export const MyOrderCard: FC<MyOrderCardProps> = ({
// 	order,
// 	completions,
// 	style,
// }) => {
// 	const [showCompletionRequests, setShowCompletionRequests] = useState(false);
// 	// const [showBargainRequests, setShowBargainRequests] = useState(false);

// 	const respondCompletions = useCompletionsState(selectRespondCompletions);

// 	const modifyOddlot = useOddlotState(selectModifyOddlot);

// 	const companyData = useCompaniesState((state) =>
// 		state.companiesData?.data.find(
// 			(company) => company.symbol === order.stock_symbol,
// 		),
// 	);

// 	const formattedTime = useMemo(
// 		() => getFormattedOrderTime(order.created_at),
// 		[order.created_at],
// 	);

// 	const orderDate = useMemo(
// 		() => new Date(order.created_at),
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

// 	const handleCompletionRequest = useCallback(
// 		async (
// 			orderId: string,
// 			completionId: string,
// 			status: CompletionsStatus,
// 		) => {
// 			try {
// 				await respondCompletions(orderId, completionId, status);
// 			} catch (error) {
// 				toast.error(error instanceof Error ? error.message : String(error));
// 			}
// 		},
// 		[respondCompletions],
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
// 							<span>
// 								{order.stock_symbol}
// 								<Badge className={cn("ml-2", orderTypeBadgeClass)}>
// 									{order.order_type.toUpperCase()}
// 								</Badge>
// 								<Badge className={cn("ml-2", orderStatusBadgeClass)}>
// 									{order.status.toUpperCase()}
// 								</Badge>
// 							</span>
// 							<span className="flex space-x-1">
// 								{order.status !== OddLotOrderStatusConst.COMPLETED &&
// 									order.status !== OddLotOrderStatusConst.DELETED && (
// 										<button
// 											onClick={() =>
// 												modifyOddlot(order.id, {
// 													status: OddLotOrderStatusConst.COMPLETED,
// 												})
// 											}
// 											className={cn(
// 												"p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500",
// 												"text-gray-400 hover:text-green-500 hover:bg-gray-700",
// 											)}
// 											aria-label="Mark as complete"
// 											title="Mark as complete"
// 										>
// 											<CheckCircle size={18} />
// 										</button>
// 									)}
// 								{order.status !== OddLotOrderStatusConst.DELETED && (
// 									<button
// 										onClick={() =>
// 											modifyOddlot(order.id, {
// 												status: OddLotOrderStatusConst.DELETED,
// 											})
// 										}
// 										className={cn(
// 											"p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-700",
// 											"focus:outline-none focus:ring-1 focus:ring-red-500",
// 										)}
// 										aria-label="Delete order"
// 										title="Delete order"
// 									>
// 										<Trash2 size={18} />
// 									</button>
// 								)}
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

// 				{order.status !== OddLotOrderStatusConst.COMPLETED && (
// 					<div className="space-y-2 mt-2">
// 						<div className="border border-gray-700 rounded-md overflow-hidden">
// 							<button
// 								onClick={() =>
// 									setShowCompletionRequests(!showCompletionRequests)
// 								}
// 								className={cn(
// 									"w-full px-2 py-2 flex items-center justify-between text-sm text-gray-300",
// 									"hover:bg-gray-700 transition-colors",
// 								)}
// 							>
// 								<div className="flex items-center">
// 									<Users size={16} className="mr-2" />
// 									<span>Completion Requests</span>
// 									{completions?.length > 0 && (
// 										<Badge className="ml-2 bg-gray-700 text-gray-300 hover:bg-gray-600">
// 											{completions.length}
// 										</Badge>
// 									)}
// 								</div>
// 								{showCompletionRequests ? (
// 									<ChevronUp size={16} />
// 								) : (
// 									<ChevronDown size={16} />
// 								)}
// 							</button>

// 							{showCompletionRequests && (
// 								<div className="border-t border-gray-700 divide-y divide-gray-700">
// 									{completions?.length === 0 ? (
// 										<p className="px-2 py-2 text-sm text-gray-400">
// 											No completion requests
// 										</p>
// 									) : (
// 										completions.map((request: CompletionsOrders) => (
// 											<div
// 												key={request.id}
// 												className="px-2 py-2 hover:bg-gray-750"
// 											>
// 												<div className="flex items-center justify-between mb-2">
// 													<span className="text-xs text-gray-400">
// 														{getFormattedTime(request.updated_at)} |{" "}
// 														<TimeAgo date={new Date(request.updated_at)} />
// 													</span>
// 												</div>
// 												{request.requester_user_id && (
// 													<p className="text-sm text-gray-300 mb-2 italic">
// 														{request.requester_user_id}
// 													</p>
// 												)}
// 												<div className="flex space-x-2">
// 													<button
// 														onClick={() =>
// 															handleCompletionRequest(
// 																order.id,
// 																request.id,
// 																OddLotOrderStatusConst.COMPLETED,
// 															)
// 														}
// 														className={cn(
// 															"flex-1 px-3 py-1 text-xs bg-green-600 hover:bg-green-700",
// 															"text-white rounded-md transition-colors",
// 														)}
// 													>
// 														Accept
// 													</button>
// 													<button
// 														onClick={() =>
// 															handleCompletionRequest(
// 																order.id,
// 																request.id,
// 																CompletionsStatusConst.REJECTED,
// 															)
// 														}
// 														className={cn(
// 															"flex-1 px-3 py-1 text-xs bg-red-600 hover:bg-red-700",
// 															"text-white rounded-md transition-colors",
// 														)}
// 													>
// 														Reject
// 													</button>
// 												</div>
// 											</div>
// 										))
// 									)}
// 								</div>
// 							)}
// 						</div>
// 					</div>
// 				)}
// 			</div>
// 		</div>
// 	);
// };
