import { Button } from "@nepse-dashboard/ui/components/button";
import type { FC } from "react";

interface ChooseStockProps {
	onAddStock: () => void;
}

const NoStockSelected: FC<ChooseStockProps> = ({ onAddStock }) => {
	return (
		<div className="flex flex-col items-center justify-center h-full w-full">
			<p className="text-muted-foreground text-sm mb-4">
				No stock symbol was added.
			</p>
			<p className="text-muted-foreground text-xs mb-4">
				Please choose a symbol by clicking the Add Stock button below.
			</p>
			<Button onClick={onAddStock}>Add Stock</Button>
		</div>
	);
};

export default NoStockSelected;
