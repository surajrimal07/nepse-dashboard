// import type { CompletionsOrders } from "@/types/odd-types";
// import {
// 	OddLotOrderSideConst,
// 	OddLotOrderStatusConst,
// } from "@/types/odd-types";

// export function getFormattedOrderTime(dateInput: string | Date): string {
// 	const date = new Date(dateInput);
// 	return date.toLocaleTimeString([], {
// 		hour: "numeric",
// 		minute: "2-digit",
// 		hour12: true,
// 	});
// }

// export function getPriceDiff(orderPrice: number, closePrice?: number): string {
// 	if (!closePrice || closePrice === 0) return "0.0";
// 	const diff = ((orderPrice - closePrice) / closePrice) * 100;
// 	return diff.toFixed(1);
// }

// export function getPriceDiffColor(priceDiff: string): string {
// 	const diff = Number.parseFloat(priceDiff);
// 	if (diff > 0) return "text-green-400";
// 	if (diff < 0) return "text-red-400";
// 	return "text-gray-400";
// }

// export function getCompletionStatusColor(
// 	completions?: CompletionsOrders,
// ): string {
// 	if (!completions) return "text-gray-400";

// 	switch (completions.status) {
// 		case "pending":
// 			return "text-yellow-400";
// 		case "completed":
// 			return "text-green-400";
// 		case "rejected":
// 			return "text-red-400";
// 		default:
// 			return "text-gray-400";
// 	}
// }

// export function getOrderTypeBadgeClass(type: string): string {
// 	return type === OddLotOrderSideConst.BUY
// 		? "bg-green-900 text-green-300 border-green-700"
// 		: "bg-red-900 text-red-300 border-red-700";
// }

// export function getOrderTypeBorderClass(type: string): string {
// 	return type === OddLotOrderSideConst.BUY
// 		? "border-green-500"
// 		: "border-red-500";
// }

// export function getOrderStatusBadgeClass(status: string): string {
// 	switch (status) {
// 		case OddLotOrderStatusConst.OPEN:
// 			return "bg-blue-900 text-blue-300 border-blue-700";
// 		case OddLotOrderStatusConst.COMPLETED:
// 			return "bg-teal-900 text-teal-300 border-teal-700";
// 		default:
// 			return "bg-gray-700 text-gray-300 border-gray-600";
// 	}
// }
