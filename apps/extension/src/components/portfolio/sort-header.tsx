import { Button } from "@nepse-dashboard/ui/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@nepse-dashboard/ui/components/tooltip";
import type { SortField, SortState } from "@/types/portfolio-type";

interface SortHeaderProps {
	label: string;
	field: SortField;
	sortState: SortState;
	onSort: (field: SortField) => void;
	className?: string;
	tooltip?: string;
}

export function SortHeader({
	label,
	field,
	sortState,
	onSort,
	className = "",
	tooltip,
}: SortHeaderProps) {
	const isActive = sortState.field === field;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className={`h-6 px-1 text-xs font-medium flex items-center ${className} ${
						isActive ? "text-primary" : "text-muted-foreground"
					} hover:text-primary`}
					onClick={() => onSort(field)}
				>
					<span>{label}</span>
				</Button>
			</TooltipTrigger>
			{tooltip && (
				<TooltipContent side="top">
					<p>{tooltip}</p>
				</TooltipContent>
			)}
		</Tooltip>
	);
}
