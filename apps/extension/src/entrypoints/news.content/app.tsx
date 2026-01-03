import { AI_CODES } from "@nepse-dashboard/ai/types";
import { lazy, memo, Suspense } from "react";
import { DraggableCard } from "@/components/content-ui/draggable-card";
import { useDragCardState } from "@/components/content-ui/store";
import LoadingDots from "@/components/loading-dots";
import { useAppState } from "@/hooks/use-app";
import useScreenView from "@/hooks/usePageView";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Env, EventName } from "@/types/analytics-types";
import { NewsHeader } from "./components/header";
import { LoadingUI } from "./components/loading-ui";
import { useNewsState } from "./store";

const ApiKeyRequired = lazy(
	() => import("@/entrypoints/news.content/components/api-key-requires"),
);

const NewsBottomBar = lazy(
	() => import("@/entrypoints/news.content/components/news-bottom-bar"),
);

const NewsSummary = lazy(
	() => import("@/entrypoints/news.content/components/news-summary"),
);

const ErrorDisplay = lazy(
	() => import("@/entrypoints/news.content/components/error-display"),
);

const LoginRequired = lazy(
	() => import("@/entrypoints/news.content/components/login-required"),
);

interface NewsContentProps {
	language: "en" | "np";
	onClose: () => void;
}

const NewsContent = memo(({ language, onClose }: NewsContentProps) => {
	const isLoading = useNewsState((state) => state.isLoading);
	const summary = useNewsState((state) => state.summary);
	const error = useNewsState((state) => state.error);
	const handleRetry = useNewsState((state) => state.handleRetry);

	const onRetry = () => {
		handleRetry(window.location.href);
	};

	if (isLoading) return <LoadingUI />;
	if (error === AI_CODES.AUTH_ERROR) return <LoginRequired />;

	if (error === AI_CODES.MISSING_PARAMS) return <ApiKeyRequired />;

	if (error) {
		void track({
			context: Env.CONTENT,
			eventName: EventName.NEWS_ERROR,
			params: { error, location: "news-content-app" },
		});
		return <ErrorDisplay error={error} onRetry={onRetry} onClose={onClose} />;
	}

	if (summary) {
		return (
			<>
				<NewsSummary newsData={summary} currentLanguage={language} />
				<NewsBottomBar newsData={summary} currentLanguage={language} />
			</>
		);
	}

	// No summary, no error
	track({
		context: Env.CONTENT,
		eventName: EventName.NEWS_ERROR,
		params: { error: "no_summary", location: "news-content-app" },
	});
	return (
		<ErrorDisplay
			error={AI_CODES.UNABLE_TO_EXTRACT}
			onRetry={onRetry}
			onClose={onClose}
		/>
	);
});

NewsContent.displayName = "NewsContent";

export default function App({ onClose }: { onClose: () => void }) {
	useScreenView("/news-content", "News Content");

	const { useStateItem } = useAppState();

	const [aiConfig] = useStateItem("aiSettings");

	const isCollapsed = useDragCardState((state) => state.isCollapsed);
	const language = useDragCardState((state) => state.language);
	const toggleCollapsed = useDragCardState((state) => state.toggleCollapsed);
	const toggleLanguage = useDragCardState((state) => state.toggleLanguage);

	return (
		<DraggableCard variant="default" showDragHandle={false}>
			<div>
				<NewsHeader
					isCollapsed={isCollapsed}
					toggleCollapsed={toggleCollapsed}
					language={language}
					toggleLanguage={toggleLanguage}
					onClose={onClose}
				/>

				<div
					className={cn(
						"overflow-hidden transition-all duration-600 ease-in-out",
						isCollapsed ? "max-h-0 opacity-0" : "max-h-[450px] opacity-100",
					)}
				>
					<div className="p-1 bg-white flex flex-col max-h-[430px]">
						<Suspense fallback={<LoadingDots className="scale-110" />}>
							{aiConfig == null || aiConfig?.hasKeys === false ? (
								<ApiKeyRequired />
							) : (
								<NewsContent language={language} onClose={onClose} />
							)}
						</Suspense>
					</div>
				</div>
			</div>
		</DraggableCard>
	);
}
