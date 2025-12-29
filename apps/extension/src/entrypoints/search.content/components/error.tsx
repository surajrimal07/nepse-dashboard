import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchState } from "../store";

export function ErrorMessage() {
	const error = useSearchState((state) => state.error);
	const isDark = useSearchState((state) => state.isDark);
	if (!error) return null;
	return (
		<div
			className={cn(
				"mb-1 px-2 py-1 rounded-lg text-sm font-medium border flex items-center gap-2",
				isDark
					? "bg-red-900/80 border-red-700 text-red-200"
					: "bg-red-100 border-red-400 text-red-700",
			)}
			role="alert"
		>
			<TriangleAlert className="w-4 h-4 shrink-0" />
			{error}
		</div>
	);
}
