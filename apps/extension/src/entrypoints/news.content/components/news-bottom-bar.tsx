import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import { Button } from "@nepse-dashboard/ui/components/button";
import { AlertCircle, Eye, ThumbsDown, ThumbsUp } from "lucide-react";
import { useCallback } from "react";
import { track } from "@/lib/analytics";
import { Env, EventName } from "@/types/analytics-types";
import { useNewsState } from "../store";
import { formatCount } from "../utils/format-count";
import { NotAvailableEnglish, NotAvailableNepali } from "../utils/notavailable";
import { ApiKeySettings } from "./api-key-settings";
import { RequestNews } from "./request-news";
import { TextToSpeech } from "./text-to-speech";

interface NewsBottomBarProps {
	newsData: Doc<"news">;
	currentLanguage: "en" | "np";
}

export default function NewsBottomBar({
	newsData,
	currentLanguage,
}: NewsBottomBarProps) {
	const feedback = useNewsState((state) => state.feedback);
	const setFeedback = useNewsState((state) => state.setFeedback);
	const isSubmitting = useNewsState((state) => state.isSubmittingFeedback);
	const { callAction } = useAppState();

	const handleNotifyNotAvailable = useCallback(() => {
		callAction(
			"showNotification",
			currentLanguage === "np" ? NotAvailableNepali : NotAvailableEnglish,
			"error",
		);

		void track({
			context: Env.NEWS,
			eventName: EventName.TTS_NOT_AVAILABLE,
		});
	}, [callAction, currentLanguage]);

	const handleInfo = useCallback(() => {
		callAction(
			"showNotification",
			"AI generated summaries may contain inaccuracies. Please verify information from original sources.",
			"info",
		);
		void track({
			context: Env.CONTENT,
			eventName: EventName.NEWS_INFO_CLICKED,
			params: { location: "news-bottom-bar", summaryId: newsData._id },
		});
	}, [callAction, currentLanguage, newsData._id]);

	const handleFeedback = useCallback(
		(value: -1 | 1) => {
			track({
				context: Env.CONTENT,
				eventName: EventName.NEWS_FEEDBACK_SUBMITTED,
				params: {
					location: "news-bottom-bar",
					summaryId: newsData._id,
					feedback: value,
				},
			});

			setFeedback(value);
		},
		[setFeedback],
	);

	return (
		<div className="flex items-center justify-between pt-1">
			<div className="flex items-center gap-1.5">
				<span className="text-xs flex items-center gap-1">
					<Eye className="w-3 h-3" />
					{formatCount(newsData.readCount)}
				</span>
				<Button
					size="sm"
					variant="ghost"
					className="h-7 w-7 p-0"
					title="LLMs can make mistakes during summary generation"
					onClick={handleInfo}
				>
					<AlertCircle className="h-3.5 w-3.5 " />
				</Button>
				<TextToSpeech
					text={
						currentLanguage === "np"
							? newsData.summary.nepali
							: newsData.summary.english
					}
					language={currentLanguage}
					notifyNotAvailable={handleNotifyNotAvailable}
				/>
				<ApiKeySettings />
				<RequestNews />
			</div>

			<div className="flex items-center gap-1.5 ml-auto">
				<Button
					size="sm"
					variant={feedback === 1 ? "default" : "outline"}
					onClick={() => handleFeedback(1)}
					disabled={isSubmitting}
					className={`h-7 px-2 gap-1 ${feedback === 1 ? "bg-green-500 text-white hover:bg-green-600" : ""}`}
				>
					<ThumbsUp className="h-3.5 w-3.5" />
					<span className="text-xs">
						{formatCount(newsData?.positiveCount)}
					</span>
				</Button>
				<Button
					size="sm"
					variant={feedback === -1 ? "default" : "outline"}
					onClick={() => handleFeedback(-1)}
					disabled={isSubmitting}
					className={`h-7 px-2 gap-1 ${feedback === -1 ? "bg-red-500 text-white hover:bg-red-600" : ""}`}
				>
					<ThumbsDown className="h-3.5 w-3.5" />
					<span className="text-xs">
						{formatCount(newsData?.negativeCount)}
					</span>
				</Button>
			</div>
		</div>
	);
}
