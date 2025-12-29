import type { FC } from "react";

interface ChooseStockProps {
	title: string;
}

const WidgetNotFound: FC<ChooseStockProps> = ({ title }) => {
	return (
		<div className="flex flex-col items-center justify-center h-full w-full">
			<p className="text-muted-foreground text-sm mb-4">
				Widget type not found:
				{title}
			</p>
			<p className="text-muted-foreground text-xs mb-4">
				An error occured, Requested widget was not found. Please delete and add
				the widget again or contact the developer for assistance.
			</p>
		</div>
	);
};

export default WidgetNotFound;
