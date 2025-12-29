// import { Button } from "@nepse-dashboard/ui/components/button";
// import { Input } from "@nepse-dashboard/ui/components/input";
// import { X } from "lucide-react";
// import type { FC } from "react";
// import { memo, useCallback, useEffect, useState } from "react";
// import { toast } from "sonner";
// import { useShallow } from "zustand/react/shallow";
// import {
// 	selectisRequestCompletionsLoading,
// 	selectRequestCompletions,
// } from "@/selectors/completion-selector";
// import { useCompletionsState } from "@/state/completions-state";
// import type { Oddlot } from "@/types/odd-types";

// interface ConfirmOrderDialogProps {
// 	order: Oddlot;
// 	onClose: () => void;
// 	onSubmit: () => void;
// }

// const ConfirmOrderDialogComponent: FC<ConfirmOrderDialogProps> = ({
// 	order,
// 	onClose,
// 	onSubmit,
// }) => {
// 	const [message, setMessage] = useState("");

// 	const { requestCompletions, isRequestCompletionsLoading } =
// 		useCompletionsState(
// 			useShallow((s) => ({
// 				requestCompletions: selectRequestCompletions(s),
// 				isRequestCompletionsLoading: selectisRequestCompletionsLoading(s),
// 			})),
// 		);

// 	const handleConfirm = useCallback(async () => {
// 		try {
// 			await requestCompletions(order.id, message);
// 			onSubmit();
// 		} catch (error) {
// 			toast.error(error instanceof Error ? error.message : String(error));
// 		}
// 	}, [message, order.id, requestCompletions, onSubmit]);

// 	useEffect(() => {
// 		const handleEsc = (e: KeyboardEvent) => {
// 			if (e.key === "Escape" && !isRequestCompletionsLoading) {
// 				onClose();
// 			}
// 			if (e.key === "Enter" && !isRequestCompletionsLoading) {
// 				handleConfirm();
// 			}
// 		};

// 		window.addEventListener("keydown", handleEsc);
// 		return () => {
// 			window.removeEventListener("keydown", handleEsc);
// 		};
// 	}, [onClose, handleConfirm, isRequestCompletionsLoading]);

// 	return (
// 		<div
// 			className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
// 			role="dialog"
// 			aria-modal="true"
// 			aria-labelledby="dialog-title"
// 		>
// 			<div className="bg-gray-800 p-4 rounded-lg shadow-lg max-w-md w-full mx-4">
// 				<div className="flex justify-between items-center mb-4">
// 					<h3 id="dialog-title" className="text-lg font-medium text-white">
// 						Confirm Order Completion
// 					</h3>
// 					<button
// 						onClick={onClose}
// 						className="text-gray-400 hover:text-white"
// 						aria-label="Close"
// 						disabled={isRequestCompletionsLoading}
// 					>
// 						<X size={20} />
// 					</button>
// 				</div>

// 				<p className="text-gray-300 mb-2">
// 					Are you confirming that you have completed this {order.order_type}{" "}
// 					order for {order.quantity} {order.stock_symbol} at Rs. {order.price}?
// 				</p>

// 				<p className="text-gray-300 mb-4">
// 					*Please note that {order.order_type === "buy" ? "buyer" : "seller"}{" "}
// 					also need to confirm the order. Please only confirm if you have indeed
// 					completed the order. Do not spam this action.
// 				</p>
// 				<div className="mb-4">
// 					<label
// 						htmlFor="message"
// 						className="block text-sm font-medium text-gray-300 mb-1"
// 					>
// 						Optional Message
// 					</label>
// 					<Input
// 						id="message"
// 						type="text"
// 						value={message}
// 						onChange={(e) => setMessage(e.target.value)}
// 						placeholder={`Add a message to ${order.order_type === "buy" ? "buyer" : "seller"}`}
// 						disabled={isRequestCompletionsLoading}
// 						className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
// 					/>
// 				</div>

// 				<div className="flex justify-end space-x-2">
// 					<Button
// 						type="button"
// 						variant="destructive"
// 						onClick={onClose}
// 						disabled={isRequestCompletionsLoading}
// 					>
// 						Cancel
// 					</Button>
// 					<Button
// 						type="button"
// 						variant="default"
// 						onClick={handleConfirm}
// 						disabled={isRequestCompletionsLoading}
// 						className={isRequestCompletionsLoading ? "opacity-70" : ""}
// 					>
// 						{isRequestCompletionsLoading
// 							? "Processing..."
// 							: "Confirm Completion"}
// 					</Button>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export const ConfirmOrderDialog = memo(ConfirmOrderDialogComponent);
