// import { Button } from "@nepse-dashboard/ui/components/button";
// import { Input } from "@nepse-dashboard/ui/components/input";
// import { Label } from "@nepse-dashboard/ui/components/label";
// import { AlertTriangle, X } from "lucide-react";
// import type { ChangeEvent, FC } from "react";
// import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
// import type { Company } from "@/types/company-types";
// import type { Oddlot } from "@/types/odd-types";

// interface BargainProps {
// 	order: Oddlot;
// 	onClose: () => void;
// 	onSubmit: () => void;
// 	companyData: Company;
// 	askPriceDiff: string;
// }

// interface CompanyInfoProps {
// 	companyData: Company;
// 	order: Oddlot;
// 	bargainPrice: number;
// 	percentDiff: string;
// }

// const CompanyInfo = memo(
// 	({ companyData, order, bargainPrice, percentDiff }: CompanyInfoProps) => {
// 		const isPriceHigher = bargainPrice > companyData.closePrice;
// 		const isPriceLower = bargainPrice < companyData.closePrice;

// 		return (
// 			<div className="bg-gray-700 p-3 rounded-lg mb-4">
// 				<h4 className="font-medium text-white text-sm mb-1">
// 					{companyData.securityName} ({order.stock_symbol})
// 				</h4>

// 				<div className="grid grid-cols-2 gap-2">
// 					<div>
// 						<p className="text-xs text-gray-400">Last Traded Price</p>
// 						<p className="text-sm text-white">
// 							Rs.
// 							{companyData.closePrice}
// 						</p>
// 					</div>
// 					<div>
// 						<p className="text-xs text-gray-400">Day Change</p>
// 						<p
// 							className={`text-sm flex items-center ${
// 								companyData.change > 0
// 									? "text-green-400"
// 									: companyData.change < 0
// 										? "text-red-400"
// 										: "text-gray-300"
// 							}`}
// 						>
// 							{companyData.change} ({companyData.percentageChange}
// 							%)
// 						</p>
// 					</div>
// 					<div>
// 						<p className="text-xs text-gray-400">Current Ask Price</p>
// 						<p className="text-sm text-white">
// 							Rs.
// 							{order.price}
// 						</p>
// 					</div>
// 					<div>
// 						<p className="text-xs text-gray-400">Your Bid</p>
// 						<p
// 							className={`text-sm ${
// 								isPriceHigher
// 									? "text-green-400"
// 									: isPriceLower
// 										? "text-red-400"
// 										: "text-white"
// 							}`}
// 						>
// 							{isPriceHigher && "+"}
// 							{percentDiff}% from LTP
// 						</p>
// 					</div>
// 				</div>
// 			</div>
// 		);
// 	},
// );

// CompanyInfo.displayName = "CompanyInfo";

// const BargainDialogComponent: FC<BargainProps> = ({
// 	order,
// 	onClose,
// 	onSubmit,
// 	companyData,
// 	askPriceDiff,
// }) => {
// 	const [bargainPrice, setBargainPrice] = useState(order.price);
// 	const [priceError, setPriceError] = useState<string | null>(null);
// 	const [isSubmitting, setIsSubmitting] = useState(false);
// 	const inputRef = useRef<HTMLInputElement>(null);

// 	const { maxPrice, minPrice } = useMemo(() => {
// 		if (!companyData) {
// 			return { maxPrice: Infinity, minPrice: 0 };
// 		}
// 		return {
// 			maxPrice: companyData.closePrice * 1.1,
// 			minPrice: companyData.closePrice * 0.9,
// 		};
// 	}, [companyData]);

// 	const percentDiff = useMemo(() => {
// 		if (!companyData) return "0.00";
// 		return (
// 			((bargainPrice - companyData.closePrice) / companyData.closePrice) *
// 			100
// 		).toFixed(2);
// 	}, [bargainPrice, companyData]);

// 	// Validate price
// 	useEffect(() => {
// 		if (!companyData) return;

// 		if (bargainPrice <= 0) {
// 			setPriceError("Price must be greater than zero");
// 		} else if (bargainPrice > maxPrice) {
// 			setPriceError(`Price cannot exceed Rs. ${maxPrice.toFixed(2)}`);
// 		} else if (bargainPrice < minPrice) {
// 			setPriceError(`Price cannot be less than Rs. ${minPrice.toFixed(2)}`);
// 		} else {
// 			setPriceError(null);
// 		}
// 	}, [bargainPrice, maxPrice, minPrice, companyData]);

// 	const handlePriceChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
// 		const value = e.target.value;

// 		if (value === "") {
// 			setBargainPrice(0);
// 			return;
// 		}

// 		const numValue = Number.parseFloat(value);
// 		if (!Number.isNaN(numValue)) {
// 			setBargainPrice(numValue);
// 		}
// 	}, []);

// 	const isPriceUnchanged = useMemo(() => {
// 		return bargainPrice === order.price;
// 	}, [bargainPrice, order.price]);

// 	// Handle form submission
// 	const handleSubmit = useCallback(() => {
// 		if (!priceError && !isPriceUnchanged && !isSubmitting) {
// 			setIsSubmitting(true);

// 			try {
// 				// API call would go here
// 				// For demo, using setTimeout
// 				setTimeout(() => {
// 					onSubmit();
// 					// If API call fails: setIsSubmitting(false);
// 				}, 500);
// 			} catch (error) {
// 				setIsSubmitting(false);
// 				console.error("Error submitting bargain request:", error);
// 			}
// 		}
// 	}, [priceError, isPriceUnchanged, isSubmitting, onSubmit]);

// 	useEffect(() => {
// 		const handleEsc = (e: KeyboardEvent) => {
// 			if (e.key === "Escape") {
// 				onClose();
// 			}
// 			if (
// 				e.key === "Enter" &&
// 				!priceError &&
// 				!isPriceUnchanged &&
// 				!isSubmitting
// 			) {
// 				handleSubmit();
// 			}
// 		};

// 		window.addEventListener("keydown", handleEsc);

// 		if (inputRef.current) {
// 			inputRef.current.focus();
// 		}

// 		return () => {
// 			window.removeEventListener("keydown", handleEsc);
// 		};
// 	}, [onClose, handleSubmit, priceError, isPriceUnchanged, isSubmitting]);

// 	return (
// 		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
// 			<div className="bg-gray-800 p-4 rounded-lg shadow-lg max-w-md w-full mx-4">
// 				<div className="flex justify-between items-center mb-4">
// 					<h3 className="text-lg font-medium text-white">Bargain Price</h3>
// 					<button onClick={onClose} className="text-gray-400 hover:text-white">
// 						<X size={20} />
// 					</button>
// 				</div>

// 				{companyData && (
// 					<CompanyInfo
// 						companyData={companyData}
// 						order={order}
// 						bargainPrice={bargainPrice}
// 						percentDiff={percentDiff}
// 					/>
// 				)}

// 				<p className="text-gray-300 mb-2">
// 					How much would you like to bargain for this {order.order_type} order
// 					of {order.quantity} {order.stock_symbol}?
// 				</p>

// 				<p className="text-gray-300 mb-4">
// 					*Current ask price is {askPriceDiff}% discounted from the last traded
// 					price.
// 				</p>

// 				<div className="mb-4">
// 					<Label htmlFor="bargainPrice" className="text-gray-300">
// 						New Price (Rs.)
// 					</Label>
// 					<Input
// 						ref={inputRef}
// 						id="bargainPrice"
// 						type="number"
// 						min="0"
// 						step="0.01"
// 						value={bargainPrice === 0 ? "" : bargainPrice}
// 						onChange={handlePriceChange}
// 						className={`border-white hide-number-spinners ${
// 							priceError
// 								? "border-red-500 focus-visible:ring-red-500"
// 								: "focus-visible:ring-white"
// 						}`}
// 						disabled={isSubmitting}
// 					/>
// 					{priceError && (
// 						<div className="mt-2 text-red-400 flex items-start">
// 							<AlertTriangle size={16} className="mr-1 mt-0.5 shrink-0" />
// 							<span className="text-xs">{priceError}</span>
// 						</div>
// 					)}
// 				</div>

// 				<div className="flex justify-end space-x-2">
// 					<Button
// 						type="button"
// 						variant="destructive"
// 						onClick={onClose}
// 						disabled={isSubmitting}
// 					>
// 						Cancel
// 					</Button>

// 					<Button
// 						onClick={handleSubmit}
// 						disabled={!!priceError || isPriceUnchanged || isSubmitting}
// 						variant="default"
// 						className={
// 							priceError || isPriceUnchanged || isSubmitting ? "opacity-50" : ""
// 						}
// 					>
// 						{isSubmitting ? "Sending..." : "Send Request"}
// 					</Button>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export const BargainDialog = memo(BargainDialogComponent);
// BargainDialog.displayName = "BargainDialog";
