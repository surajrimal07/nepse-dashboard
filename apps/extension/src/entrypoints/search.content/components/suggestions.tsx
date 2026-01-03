import { CornerDownLeft, HelpCircle } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { useShallow } from "zustand/react/shallow";
import LoadingDots from "@/components/loading-dots";
import { useAppState } from "@/hooks/use-app";
import { cn } from "@/lib/utils";
import { selectContent, selectLocation } from "../selectors";
import { useSearchState } from "../store";

const ChatError = lazy(
	() => import("@/entrypoints/search.content/components/chat-error"),
);

const KeyRequired = lazy(
	() => import("@/entrypoints/search.content/components/key-required"),
);
const LoginRequired = lazy(
	() => import("@/entrypoints/search.content/components/login-required"),
);

function SkeletonList() {
	return (
		<div className="space-y-2">
			{Array.from({ length: 5 }).map((_, i) => (
				<div
					key={i}
					className="h-9 rounded-lg animate-pulse bg-slate-800"
				/>
			))}
		</div>
	);
}

export default function Suggestions({
	onSelectSuggestion,
}: {
	onSelectSuggestion: (suggestion: string) => Promise<void>;
}) {
	const { useStateItem, callAction } = useAppState();
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const [aiSettings] = useStateItem("aiSettings");
	const { content, location } = useSearchState(
		useShallow((state) => ({
			content: selectContent(state),
			location: selectLocation(state),
		})),
	);

	const fetchSuggestions = useCallback(async () => {
		if (!content?.content) return;

		setIsLoading(true);
		setIsError(false);
		setError(null);

		try {
			const result = await callAction("getSuggestedQuestions", {
				url: location.toString(),
				content: content ?? null,
			});

			if (!Array.isArray(result)) {
				throw new TypeError(result.toString());
			}

			setSuggestions(result as string[]);
		} catch (err) {
			setIsError(true);
			setError(err as Error);
		} finally {
			setIsLoading(false);
		}
	}, [content, location, callAction]);

	useEffect(() => {
		fetchSuggestions();
	}, [location, fetchSuggestions]);

	if (!aiSettings.hasKeys) {
		return (
			<Suspense fallback={<LoadingDots className="scale-110" />}>
				<KeyRequired />
			</Suspense>
		);
	}
	const isInvalidResponse =
		error instanceof Error && error.message === "UNAUTHORIZED";

	if (isInvalidResponse) {
		return (
			<Suspense fallback={<LoadingDots className="scale-110" />}>
				<LoginRequired />
			</Suspense>
		);
	}

	if (!isLoading && (isError || !suggestions || !content?.content)) {
		return (
			<Suspense fallback={<LoadingDots className="scale-110" />}>
				<ChatError onRetry={fetchSuggestions} />
			</Suspense>
		);
	}

	return (
		<Fragment>
			<div className="flex items-start gap-2 px-3 py-2 border-b border-slate-800">
				<HelpCircle size={16} className="text-slate-400" />

				<div className="flex-1">
					<h3 className="text-sm font-semibold leading-tight">
						Suggested questions
					</h3>
					<p className="text-xs mt-0.5 text-slate-400">
						Ask AI about this page
					</p>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-3 hide-scrollbar">
				<div className="grid grid-cols-1 gap-2">
					{isLoading ? (
						<SkeletonList />
					) : (
						suggestions?.map((s) => (
							<button
								key={s}
								type="button"
								onClick={async () => {
									await onSelectSuggestion(s);
								}}
								className={cn(
									"group w-full flex items-center justify-between gap-2",
									"px-3 py-2 rounded-lg text-left transition-colors",
									"focus:outline-none focus:ring-2 focus:ring-offset-1",
									"bg-slate-800 hover:bg-slate-700 focus:ring-slate-600 focus:ring-offset-slate-900",
								)}
								aria-label={`Suggestion: ${s}`}
							>
								<span className="leading-snug">{s}</span>
								<CornerDownLeft
									size={14}
									className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400"
								/>
							</button>
						))
					)}
				</div>
			</div>
		</Fragment>
	);
}
