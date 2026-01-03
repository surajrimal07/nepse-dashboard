import { TriangleAlert, X } from "lucide-react";
import { useSearchState } from "../store";

export function ErrorMessage() {
	const error = useSearchState((state) => state.error);
	const setError = useSearchState((state) => state.setError);

	if (!error) return null;

	return (
		<div
			className="absolute top-2 left-2 right-2 z-20 px-3 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 bg-red-900/95 border-red-700 text-red-200 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200"
			role="alert"
		>
			<TriangleAlert className="w-4 h-4 shrink-0" />
			<span className="flex-1">{error}</span>
			<button
				type="button"
				onClick={() => setError(null)}
				className="p-0.5 rounded hover:bg-red-800/50 transition-colors"
				aria-label="Dismiss error"
			>
				<X className="w-3.5 h-3.5" />
			</button>
		</div>
	);
}
