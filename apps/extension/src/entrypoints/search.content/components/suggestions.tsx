import { CornerDownLeft, HelpCircle } from "lucide-react";
import { lazy } from "react";
import { Fragment } from "react/jsx-runtime";
import { useShallow } from "zustand/react/shallow";
import LoadingDots from "@/components/loading-dots";
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

function SkeletonList({ isDark }: { isDark: boolean }) {
	return (
		<div className="space-y-2">
			{Array.from({ length: 5 }).map((_, i) => (
				<div
					key={i}
					className={cn(
						"h-9 rounded-lg animate-pulse",
						isDark ? "bg-slate-800" : "bg-slate-100",
					)}
				/>
			))}
		</div>
	);
}

export default function Suggestions({
	isDark,
	onSelectSuggestion,
}: {
	isDark: boolean;
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
				throw new Error(result.toString());
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
				<KeyRequired isDark={isDark} />
			</Suspense>
		);
	}
	const isInvalidResponse =
		error instanceof Error && error.message === "UNAUTHORIZED";

	if (isInvalidResponse) {
		return (
			<Suspense fallback={<LoadingDots className="scale-110" />}>
				<LoginRequired isDark={isDark} />
			</Suspense>
		);
	}

	if (!isLoading && (isError || !suggestions || !content?.content)) {
		return (
			<Suspense fallback={<LoadingDots className="scale-110" />}>
				<ChatError isDark={isDark} onRetry={fetchSuggestions} />
			</Suspense>
		);
	}

	return (
		<Fragment>
			<div
				className={cn(
					"flex items-start gap-2 px-3 py-2 border-b",
					isDark ? "border-slate-800" : "border-slate-200",
				)}
			>
				<HelpCircle
					size={16}
					className={isDark ? "text-slate-400" : "text-slate-500"}
				/>

				<div className="flex-1">
					<h3 className="text-sm font-semibold leading-tight">
						Suggested questions
					</h3>
					<p
						className={cn(
							"text-xs mt-0.5",
							isDark ? "text-slate-400" : "text-slate-500",
						)}
					>
						Ask AI about this page
					</p>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-3 hide-scrollbar">
				<div className="grid grid-cols-1 gap-2">
					{isLoading ? (
						<SkeletonList isDark={isDark} />
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
									isDark
										? "bg-slate-800 hover:bg-slate-700 focus:ring-slate-600 focus:ring-offset-slate-900"
										: "bg-slate-50 hover:bg-slate-100 focus:ring-slate-300 focus:ring-offset-white",
								)}
								aria-label={`Suggestion: ${s}`}
							>
								<span className="leading-snug">{s}</span>
								<CornerDownLeft
									size={14}
									className={cn(
										"shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
										isDark ? "text-slate-400" : "text-slate-500",
									)}
								/>
							</button>
						))
					)}
				</div>
			</div>
		</Fragment>
	);
}
