import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import { Badge } from "@nepse-dashboard/ui/components/badge";
import { Sparkles } from "lucide-react";
import { memo, useMemo } from "react";
import { BiasAnalysis } from "@/entrypoints/news.content/components/bias-analysis";
import { track } from "@/lib/analytics";
import { Env, EventName } from "@/types/analytics-types";
import { useNewsState } from "../store";

interface NewsSummaryProps {
	newsData: Doc<"news">;
	currentLanguage: "en" | "np";
}

const ThemeBadges = memo(({ themes }: { themes: string[] }) => (
	<div className="flex flex-wrap gap-1.5">
		{themes.map((theme, index) => (
			<Badge
				key={index}
				variant="secondary"
				className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 border border-yellow-200"
			>
				{theme}
			</Badge>
		))}
	</div>
));

export default function NewsSummary({
	newsData,
	currentLanguage,
}: NewsSummaryProps) {
	const { callAction } = useAppState();
	const sendWebsiteContent = useNewsState((state) => state.sendParsedContent);
	const summaryId = newsData._id;

	const summaryText = useMemo(
		() =>
			currentLanguage === "np"
				? newsData.summary.nepali
				: newsData.summary.english,
		[currentLanguage, newsData.summary.nepali, newsData.summary.english],
	);

	return (
		<div className="flex flex-col overflow-y-auto flex-1 min-h-[200px]">
			<div className="space-y-3 p-0 flex-1 mb-3">
				<p className="text-sm text-gray-700 leading-relaxed">{summaryText}</p>
			</div>
			<div className="space-y-3 p-0 mt-auto">
				<div className="flex items-center justify-between gap-2">
					<ThemeBadges themes={newsData.themes} />
					<button
						type="button"
						onClick={() => {
							track({
								context: Env.CONTENT,
								eventName: EventName.CHAT_WITH_AI_STARTED,
								params: { summaryId },
							});
							sendWebsiteContent();

							callAction(
								"showNotification",
								"Opening SidePanel to attach website content...",
								"info",
							);
						}}
						className="absolute bottom-20 right-4 p-1.5 rounded-md  hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all border border-gray-200 hover:border-gray-300 shrink-0"
						title="Chat with AI about this news"
					>
						<Sparkles className="h-3.5 w-3.5" />
					</button>
				</div>
				<BiasAnalysis score={newsData.bias.score} />
			</div>
		</div>
	);
}
