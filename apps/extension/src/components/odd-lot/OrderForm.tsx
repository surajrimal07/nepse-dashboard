// import { Alert, AlertDescription } from "@nepse-dashboard/ui/components/alert";
// import { Button } from "@nepse-dashboard/ui/components/button";
// import { Checkbox } from "@nepse-dashboard/ui/components/checkbox";
// import { Input } from "@nepse-dashboard/ui/components/input";
// import { Label } from "@nepse-dashboard/ui/components/label";
// import { AlertTriangle, Loader2, X } from "lucide-react";
// import type { ChangeEvent, FC, FormEvent } from "react";
// import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { toast } from "sonner";
// import { useShallow } from "zustand/react/shallow";
// import { selectCompaniesData } from "@/selectors/company-selector";
// import {
// 	selectAddNewOrder,
// 	selectIsAddNewOrderLoading,
// } from "@/selectors/odd-selector";
// import { useCompaniesState } from "@/state/company-state";
// import { useOddlotState } from "@/state/odd-state";
// import type { Company } from "@/types/company-types";

// interface OrderFormProps {
// 	onClose: () => void;
// 	onsubmit: () => void;
// }

// const Order: FC<OrderFormProps> = ({ onClose, onsubmit }) => {
// 	const companiesData = useCompaniesState(selectCompaniesData);

// 	const { addNewOrder, isAddNewOrderLoading } = useOddlotState(
// 		useShallow((s) => ({
// 			addNewOrder: selectAddNewOrder(s),
// 			isAddNewOrderLoading: selectIsAddNewOrderLoading(s),
// 		})),
// 	);

// 	const [stockSearchTerm, setStockSearchTerm] = useState("");
// 	const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
// 	const [quantity, setQuantity] = useState("");
// 	const [price, setPrice] = useState("");
// 	const [orderType, setOrderType] = useState<"buy" | "sell">("buy");

// 	const [stockError, setStockError] = useState<string | null>(null);
// 	const [quantityError, setQuantityError] = useState<string | null>(null);
// 	const [priceError, setPriceError] = useState<string | null>(null);
// 	const [showSuggestions, setShowSuggestions] = useState(false);
// 	const [hasAddedInTMS, setHasAddedInTMS] = useState(false);

// 	const stockInputRef = useRef<HTMLInputElement>(null);

// 	const filteredCompanies = useMemo(() => {
// 		if (!stockSearchTerm) return [];
// 		return (
// 			companiesData?.data
// 				.filter(
// 					(company) =>
// 						company.symbol
// 							.toLowerCase()
// 							.includes(stockSearchTerm.toLowerCase()) ||
// 						company.securityName
// 							.toLowerCase()
// 							.includes(stockSearchTerm.toLowerCase()),
// 				)
// 				.slice(0, 5) || []
// 		);
// 	}, [stockSearchTerm, companiesData]);

// 	const handleStockSearchChange = useCallback(
// 		(e: ChangeEvent<HTMLInputElement>) => {
// 			const term = e.target.value.toUpperCase();
// 			setStockSearchTerm(term);
// 			setSelectedCompany(null);
// 			setStockError(null);
// 			setShowSuggestions(true);
// 		},
// 		[],
// 	);

// 	const handleCompanySelect = useCallback((company: Company) => {
// 		setSelectedCompany(company);
// 		setStockSearchTerm(company.symbol);
// 		setStockError(null);
// 		setShowSuggestions(false);
// 		setPrice(company.closePrice.toString());
// 	}, []);

// 	const handleQuantityChange = useCallback(
// 		(e: ChangeEvent<HTMLInputElement>) => {
// 			const val = e.target.value;
// 			if (/^\d*$/.test(val)) {
// 				setQuantity(val);
// 				setQuantityError(null);
// 			}
// 		},
// 		[],
// 	);

// 	const handlePriceChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
// 		const val = e.target.value;
// 		if (/^\d*(?:\.\d*)?$/.test(val)) {
// 			setPrice(val);
// 			setPriceError(null);
// 		}
// 	}, []);

// 	useEffect(() => {
// 		if (selectedCompany && price) {
// 			const numericPrice = Number.parseFloat(price);
// 			if (Number.isNaN(numericPrice) || numericPrice <= 0) {
// 				setPriceError("Price must be a positive number.");
// 			} else {
// 				const ltp = selectedCompany.closePrice;
// 				const lowerBound = ltp * 0.9;
// 				const upperBound = ltp * 1.1;
// 				if (numericPrice < lowerBound || numericPrice > upperBound) {
// 					setPriceError(
// 						`Price must be between Rs ${lowerBound.toFixed(2)} and Rs ${upperBound.toFixed(2)}.`,
// 					);
// 				} else {
// 					setPriceError(null);
// 				}
// 			}
// 		} else if (price && !selectedCompany) {
// 			setPriceError("Please select a stock first.");
// 		}
// 	}, [price, selectedCompany]);

// 	useEffect(() => {
// 		if (quantity) {
// 			const numericQuantity = Number.parseInt(quantity, 10);
// 			if (
// 				Number.isNaN(numericQuantity) ||
// 				numericQuantity < 1 ||
// 				numericQuantity > 9
// 			) {
// 				setQuantityError("Quantity must be between 1 and 9.");
// 			} else {
// 				setQuantityError(null);
// 			}
// 		} else {
// 			setQuantityError(null);
// 		}
// 	}, [quantity]);

// 	const priceDifferencePercent = useMemo(() => {
// 		if (selectedCompany && price) {
// 			const numericPrice = Number.parseFloat(price);
// 			if (!Number.isNaN(numericPrice) && selectedCompany.closePrice > 0) {
// 				return (
// 					((numericPrice - selectedCompany.closePrice) /
// 						selectedCompany.closePrice) *
// 					100
// 				).toFixed(2);
// 			}
// 		}
// 		return null;
// 	}, [selectedCompany, price]);

// 	const handleSubmit = useCallback(
// 		async (e: FormEvent) => {
// 			e.preventDefault();
// 			if (!selectedCompany) {
// 				setStockError("Please select a valid stock.");
// 				return;
// 			}

// 			const numericQuantity = Number.parseInt(quantity, 10);
// 			if (
// 				Number.isNaN(numericQuantity) ||
// 				numericQuantity < 1 ||
// 				numericQuantity > 9
// 			) {
// 				setQuantityError("Quantity must be between 1 and 9.");
// 				return;
// 			}

// 			const numericPrice = Number.parseFloat(price);
// 			if (Number.isNaN(numericPrice) || numericPrice <= 0) {
// 				setPriceError("Price must be a positive number.");
// 				return;
// 			}

// 			const ltp = selectedCompany.closePrice;
// 			const lowerBound = ltp * 0.9;
// 			const upperBound = ltp * 1.1;
// 			if (numericPrice < lowerBound || numericPrice > upperBound) {
// 				setPriceError(
// 					`Price must be between Rs ${lowerBound.toFixed(2)} and Rs ${upperBound.toFixed(2)}.`,
// 				);
// 				return;
// 			}

// 			if (stockError || quantityError || priceError) {
// 				return;
// 			}

// 			try {
// 				await addNewOrder({
// 					stock_symbol: selectedCompany.symbol,
// 					quantity: numericQuantity,
// 					price: numericPrice,
// 					order_type: orderType,
// 					status: "open",
// 				});
// 				onsubmit();
// 			} catch (error) {
// 				if (error instanceof Error) {
// 					toast.error(error.message);
// 				} else {
// 					toast.error("An unknown error occurred while adding the order.");
// 				}
// 			}
// 		},
// 		[
// 			selectedCompany,
// 			quantity,
// 			price,
// 			onsubmit,
// 			stockError,
// 			addNewOrder,
// 			orderType,
// 			quantityError,
// 			priceError,
// 		],
// 	);

// 	const isFormInvalid =
// 		!!stockError ||
// 		!!quantityError ||
// 		!!priceError ||
// 		!selectedCompany ||
// 		!quantity ||
// 		!price ||
// 		!hasAddedInTMS ||
// 		isAddNewOrderLoading;

// 	return (
// 		<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
// 			<div className="bg-gray-800 rounded-lg shadow-xl w-[90%] max-w-md overflow-hidden transform transition-all animate-slideUp">
// 				<div className="flex items-center justify-between px-4 py-3 bg-gray-900">
// 					<h3 className="text-lg font-medium text-white">New Odd Lot Order</h3>
// 					<Button
// 						variant="ghost"
// 						size="icon"
// 						onClick={onClose}
// 						className="text-gray-400 hover:text-white"
// 					>
// 						<X size={20} />
// 					</Button>
// 				</div>

// 				<form onSubmit={handleSubmit} className="p-4 space-y-4">
// 					<div>
// 						<Label htmlFor="stockName" className="text-gray-300 mb-1 block">
// 							Stock Name
// 						</Label>
// 						<div className="relative">
// 							<Input
// 								ref={stockInputRef}
// 								type="text"
// 								id="stockName"
// 								name="stockName"
// 								value={stockSearchTerm}
// 								onChange={handleStockSearchChange}
// 								onFocus={() => setShowSuggestions(true)}
// 								onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
// 								placeholder="e.g. NTC"
// 								className={`bg-gray-700 border ${stockError ? "border-red-500" : "border-white"} text-white placeholder-gray-400 focus:ring-blue-500`}
// 								autoComplete="off"
// 							/>
// 							{showSuggestions && filteredCompanies.length > 0 && (
// 								<ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-40 overflow-y-auto">
// 									{filteredCompanies.map((company) => (
// 										<li key={company.symbol}>
// 											<button
// 												type="button"
// 												className="w-full text-left px-3 py-2 text-white hover:bg-gray-600 cursor-pointer"
// 												onMouseDown={() => handleCompanySelect(company)}
// 											>
// 												{company.symbol} -{company.securityName}
// 											</button>
// 										</li>
// 									))}
// 								</ul>
// 							)}
// 						</div>
// 						{stockError && (
// 							<p className="text-red-500 text-xs mt-1 flex items-center">
// 								<AlertTriangle size={14} className="mr-1" />
// 								{stockError}
// 							</p>
// 						)}
// 						{selectedCompany && (
// 							<div className="mt-2 text-xs text-gray-400">
// 								<p>
// 									LTP: Rs {selectedCompany.closePrice.toFixed(2)} | Change:
// 									<span
// 										className={
// 											selectedCompany.change > 0
// 												? "text-green-400"
// 												: selectedCompany.change < 0
// 													? "text-red-400"
// 													: "text-gray-400"
// 										}
// 									>
// 										{" "}
// 										{selectedCompany.change.toFixed(2)} (
// 										{selectedCompany.percentageChange.toFixed(2)}
// 										%)
// 									</span>
// 								</p>
// 							</div>
// 						)}
// 					</div>

// 					<div>
// 						<Label htmlFor="quantity" className="text-gray-300 mb-1 block">
// 							Quantity
// 						</Label>
// 						<Input
// 							type="number"
// 							id="quantity"
// 							name="quantity"
// 							value={quantity}
// 							onChange={handleQuantityChange}
// 							placeholder="e.g. 10"
// 							step={1}
// 							className={`bg-gray-700 border hide-number-spinners ${quantityError ? "border-red-500" : "border-white"} text-white placeholder-gray-400 focus:ring-blue-500`}
// 						/>
// 						{quantityError && (
// 							<p className="text-red-500 text-xs mt-1 flex items-center">
// 								<AlertTriangle size={14} className="mr-1" />
// 								{quantityError}
// 							</p>
// 						)}
// 					</div>

// 					<div>
// 						<Label htmlFor="price" className="text-gray-300 mb-1 block">
// 							Price
// 						</Label>
// 						<Input
// 							type="number"
// 							id="price"
// 							name="price"
// 							value={price}
// 							onChange={handlePriceChange}
// 							placeholder="e.g. 150.25"
// 							className={`bg-gray-700 border hide-number-spinners  ${priceError ? "border-red-500" : "border-white"} text-white placeholder-gray-400 focus:ring-blue-500`}
// 							disabled={!selectedCompany}
// 							step="0.1"
// 						/>
// 						{priceError && (
// 							<p className="text-red-500 text-xs mt-1 flex items-center">
// 								<AlertTriangle size={14} className="mr-1" />
// 								{priceError}
// 							</p>
// 						)}
// 						{selectedCompany &&
// 							price &&
// 							!priceError &&
// 							priceDifferencePercent !== null && (
// 								<p className="mt-1 text-xs text-gray-400">
// 									Difference from LTP:
// 									<span
// 										className={
// 											Number.parseFloat(priceDifferencePercent) > 0
// 												? "text-green-400"
// 												: Number.parseFloat(priceDifferencePercent) < 0
// 													? "text-red-400"
// 													: "text-gray-400"
// 										}
// 									>
// 										{" "}
// 										{priceDifferencePercent}%
// 									</span>
// 								</p>
// 							)}
// 					</div>

// 					<div>
// 						<Label htmlFor="orderType" className="text-gray-300 mb-1 block">
// 							Order Type
// 						</Label>
// 						<select
// 							id="orderType"
// 							name="orderType"
// 							value={orderType}
// 							onChange={(e) => setOrderType(e.target.value as "buy" | "sell")}
// 							className="w-full px-3 py-2 bg-gray-700 border border-white text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 						>
// 							<option value="buy">Buy</option>
// 							<option value="sell">Sell</option>
// 						</select>
// 					</div>

// 					<div className="space-y-3 pt-2">
// 						<Alert
// 							variant="default"
// 							className="bg-gray-750 border-yellow-500/50"
// 						>
// 							<AlertDescription className="text-yellow-300 text-xs text-justify">
// 								Please note: This action adds your odd lot order to the Nepse
// 								Dashboard Extension system only. You must manually place an
// 								identical order in your TMS account.
// 							</AlertDescription>
// 						</Alert>
// 						<div className="flex items-center space-x-2">
// 							<Checkbox
// 								id="tms-acknowledged"
// 								checked={hasAddedInTMS}
// 								onCheckedChange={(checked) =>
// 									setHasAddedInTMS(checked as boolean)
// 								}
// 								className="border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
// 							/>
// 							<Label
// 								htmlFor="tms-acknowledged"
// 								className="text-xs font-medium leading-none text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
// 							>
// 								I acknowledge that I have already placed this exact order in
// 								TMS.
// 							</Label>
// 						</div>
// 					</div>

// 					<div className="flex justify-end space-x-3 pt-2">
// 						<Button
// 							type="button"
// 							variant="destructive"
// 							onClick={onClose}
// 							disabled={isAddNewOrderLoading}
// 						>
// 							Cancel
// 						</Button>
// 						<Button
// 							type="submit"
// 							className="bg-blue-600 hover:bg-blue-700 text-white"
// 							disabled={isFormInvalid}
// 						>
// 							{isAddNewOrderLoading ? (
// 								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
// 							) : null}
// 							{isAddNewOrderLoading ? "Sending..." : "Send"}
// 						</Button>
// 					</div>
// 				</form>
// 			</div>
// 		</div>
// 	);
// };

// export const OrderForm = memo(Order);

// OrderForm.displayName = "Order";
