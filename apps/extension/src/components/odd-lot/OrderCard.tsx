// import { CheckCircle, DollarSign, Trash2, UserCheck } from "lucide-react";
// import type { FC } from "react";
// import { useMemo, useState } from "react";
// import TimeAgo from "react-timeago";
// import { toast } from "sonner";
// import { BargainDialog } from "@/components/odd-lot/bargain-order";
// import { ConfirmOrderDialog } from "@/components/odd-lot/confirm-order";
// import { selectModifyOddlot } from "@/selectors/odd-selector";
// import { useCompaniesState } from "@/state/company-state";
// import { useOddlotState } from "@/state/odd-state";
// import type { Oddlot } from "@/types/odd-types";
// import { CompletionsStatusConst } from "@/types/odd-types";

// interface OrderCardProps {
// 	order: Oddlot;
// 	showActions?: boolean;
// }

// export const OrderCard: FC<OrderCardProps> = ({
// 	order,
// 	showActions = false,
// }) => {
// 	const updateStatus = useOddlotState(selectModifyOddlot);
// 	const [showCompleteDialog, setShowCompleteDialog] = useState(false);
// 	const [showBargainDialog, setShowBargainDialog] = useState(false);

// 	const companyData = useCompaniesState((s) =>
// 		s.companiesData?.data.find((c) => c.symbol === order.stock_symbol),
// 	);

// 	const orderDate = useMemo(
// 		() => new Date(Number(order.created_at)),
// 		[order.created_at],
// 	);

// 	const formattedTime = useMemo(() => {
// 		return orderDate.toLocaleTimeString([], {
// 			hour: "numeric",
// 			minute: "2-digit",
// 			hour12: true,
// 		});
// 	}, [orderDate]);

// 	const handleBargainSubmit = () => {
// 		setShowBargainDialog(false);
// 		toast.success("Your bargain request has been submitted.");
// 	};

// 	const handleConfirmOrder = () => {
// 		toast.success("Your completion request has been submitted.");
// 		setShowCompleteDialog(false);
// 	};

// 	const priceDiff = useMemo(() => {
// 		return companyData
// 			? (
// 					((order.price - companyData.closePrice) / companyData.closePrice) *
// 					100
// 				).toFixed(1)
// 			: "0.0";
// 	}, [order.price, companyData]);

// 	return (
// 		<div
// 			className={`bg-gray-800 rounded-lg p-2 mb-2 border-l-4 ${
// 				order.order_type === "buy" ? "border-green-500" : "border-red-500"
// 			} hover:bg-gray-750 transition-colors relative`}
// 		>
// 			<div className="flex justify-between items-start mb-2">
// 				<div className="grow mr-2">
// 					<h3 className="font-medium text-white flex justify-between items-center">
// 						<span>
// 							{order.stock_symbol}
// 							<span
// 								className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
// 									order.order_type === "buy"
// 										? "bg-green-900 text-green-300"
// 										: "bg-red-900 text-red-300"
// 								}`}
// 							>
// 								{order.order_type.toUpperCase()}
// 							</span>
// 							<span
// 								className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
// 									order.status === "open"
// 										? "bg-blue-900 text-blue-300"
// 										: order.status === "completed"
// 											? "bg-teal-900 text-teal-300"
// 											: order.status === "deleted"
// 												? "bg-red-900 text-red-300"
// 												: "bg-gray-700 text-gray-300"
// 								}`}
// 							>
// 								{order.status.toUpperCase()}
// 							</span>
// 						</span>

// 						<span className="flex space-x-1">
// 							{order.status !== "completed" && (
// 								<>
// 									<button
// 										onClick={() => setShowCompleteDialog(true)}
// 										className="p-1 rounded-full text-gray-400 hover:text-green-500 hover:bg-gray-700 transition-colors"
// 										title="I completed this order"
// 									>
// 										<UserCheck size={16} />
// 									</button>
// 									<button
// 										onClick={() => setShowBargainDialog(true)}
// 										className="p-1 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-700 transition-colors"
// 										title="Bargain price"
// 									>
// 										<DollarSign size={16} />
// 									</button>
// 								</>
// 							)}
// 						</span>
// 					</h3>
// 					<p className="text-xs text-gray-400 mt-1">
// 						{formattedTime} |
// 						<TimeAgo date={orderDate} />
// 						{companyData?.closePrice && (
// 							<>
// 								{" "}
// 								• LTP: {companyData.closePrice} | Diff:{" "}
// 								<span
// 									className={
// 										order.price > companyData.closePrice
// 											? "text-green-400"
// 											: order.price < companyData.closePrice
// 												? "text-red-400"
// 												: "text-gray-400"
// 									}
// 								>
// 									{priceDiff}%
// 								</span>
// 							</>
// 						)}
// 					</p>
// 				</div>

// 				{showActions && (
// 					<div className="flex space-x-2 ml-2">
// 						<button
// 							onClick={() =>
// 								updateStatus(order.id, {
// 									status: CompletionsStatusConst.COMPLETED,
// 								})
// 							}
// 							disabled={order.status === "completed"}
// 							className={`p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500 ${
// 								order.status === "completed"
// 									? "text-green-500 cursor-default"
// 									: "text-gray-400 hover:text-green-500 hover:bg-gray-700"
// 							}`}
// 							aria-label="Mark as complete"
// 						>
// 							<CheckCircle size={18} />
// 						</button>

// 						<button
// 							onClick={() =>
// 								updateStatus(order.id, {
// 									status: CompletionsStatusConst.DELETED,
// 								})
// 							}
// 							className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-red-500"
// 							aria-label="Delete order"
// 						>
// 							<Trash2 size={18} />
// 						</button>
// 					</div>
// 				)}
// 			</div>

// 			<div className="flex justify-between">
// 				<div>
// 					<p className="text-sm text-gray-300">
// 						<span className="font-medium">Quantity:</span> {order.quantity}
// 					</p>
// 				</div>
// 				<div>
// 					<p className="text-sm text-gray-300">
// 						<span className="font-medium">Amount:</span>{" "}
// 						{order.quantity * order.price}
// 					</p>
// 				</div>
// 				<div>
// 					<p className="text-sm text-gray-300">
// 						<span className="font-medium">Per Unit:</span> {order.price}
// 					</p>
// 				</div>
// 			</div>

// 			{showCompleteDialog && (
// 				<ConfirmOrderDialog
// 					order={order}
// 					onSubmit={handleConfirmOrder}
// 					onClose={() => setShowCompleteDialog(false)}
// 				/>
// 			)}

// 			{showBargainDialog && (
// 				<BargainDialog
// 					order={order}
// 					companyData={companyData!}
// 					onSubmit={handleBargainSubmit}
// 					onClose={() => setShowBargainDialog(false)}
// 					askPriceDiff={priceDiff}
// 				/>
// 			)}
// 		</div>
// 	);
// };
