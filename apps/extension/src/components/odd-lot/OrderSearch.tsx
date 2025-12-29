// import { Input } from "@nepse-dashboard/ui/components/input";
// import { X } from "lucide-react";
// import type { FC } from "react";
// import { memo } from "react";

// interface OrderSearchProps {
// 	searchTerm: string;
// 	onSearchChange: (term: string) => void;
// }

// const search: FC<OrderSearchProps> = ({ searchTerm, onSearchChange }) => {
// 	return (
// 		<div className="p-1 sticky top-0 z-10 mb-1">
// 			<Input
// 				type="text"
// 				placeholder="Search by stock symbol..."
// 				value={searchTerm}
// 				onChange={(e) => onSearchChange(e.target.value.toUpperCase())}
// 				className="border-white pr-10"
// 			/>
// 			{searchTerm && (
// 				<button
// 					type="button"
// 					onClick={() => onSearchChange("")}
// 					className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
// 					aria-label="Clear search"
// 				>
// 					<X className="h-4 w-4" />
// 				</button>
// 			)}
// 		</div>
// 	);
// };

// export const OrderSearch = memo(search);
// search.displayName = "OrdersList";
