import { ExternalLink, Plus } from "lucide-react";
import { lazy, Suspense, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import LoadingDots from "@/components/loading-dots";
import { useAppState } from "@/hooks/use-app";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Env, EventName } from "@/types/analytics-types";
import {
	selectChatId,
	selectClear,
	selectIsDark,
	selectIsGenerating,
	selectMessages,
} from "../selectors";
import { useSearchState } from "../store";

const Suggestions = lazy(
	() => import("@/entrypoints/search.content/components/suggestions"),
);

export default function Chat({
	onSubmit,
}: {
	onSubmit: (value: string) => Promise<void>;
}) {
	const { callAction } = useAppState();

	const sendChatWithAI = useSearchState((state) => state.chatWithAI);

	const { isDark, messages, isGenerating, clear, chatId } = useSearchState(
		useShallow((state) => ({
			isDark: selectIsDark(state),
			messages: selectMessages(state),
			isGenerating: selectIsGenerating(state),
			clear: selectClear(state),
			chatId: selectChatId(state),
		})),
	);

	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isGenerating]);

	if (messages.length === 0) {
		return (
			<div
				className={cn(
					"h-full flex flex-col rounded-xl border text-sm relative",
					isDark
						? "bg-slate-900 border-slate-800 text-slate-100"
						: "bg-white border-slate-200 text-slate-900",
				)}
				aria-live="polite"
			>
				<Suspense fallback={<LoadingDots className="scale-110" />}>
					<Suggestions
						isDark={isDark}
						onSelectSuggestion={async (text) => {
							await onSubmit(text); // Await the async function to ensure proper execution
						}}
					/>
				</Suspense>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"h-full flex flex-col rounded-xl border text-sm relative",
				isDark
					? "bg-slate-900 border-slate-800 text-slate-100"
					: "bg-white border-slate-200 text-slate-900",
			)}
			aria-live="polite"
		>
			<div
				className={cn(
					"flex-1 px-4 py-3 overflow-y-auto space-y-4",
					"custom-scrollbar",
					isDark ? "custom-scrollbar-dark" : "custom-scrollbar-light",
				)}
			>
				{messages.map((msg, index) => (
					<div
						key={index}
						className={cn(
							"flex gap-3",
							msg.from === "user" ? "justify-end" : "justify-start",
						)}
					>
						{msg.from === "assistant" && (
							<div
								className={cn(
									"w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1",
									isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white",
								)}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									className="w-4 h-4"
								>
									<title>AI Assistant</title>
									<path d="M10 1a6 6 0 00-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 00.572.729 6.016 6.016 0 002.856 0A.75.75 0 0012 15.1v-.644c0-1.013.762-1.957 1.815-2.825A6 6 0 0010 1zM8.863 17.414a.75.75 0 00-.226 1.483 9.066 9.066 0 002.726 0 .75.75 0 00-.226-1.483 7.553 7.553 0 01-2.274 0z" />
								</svg>
							</div>
						)}
						<div
							className={cn(
								"max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed",
								msg.from === "user"
									? isDark
										? "bg-blue-600 text-white rounded-tr-sm"
										: "bg-blue-500 text-white rounded-tr-sm"
									: isDark
										? "bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-sm"
										: "bg-slate-50 text-slate-900 border border-slate-200 rounded-tl-sm",
							)}
						>
							<p className="whitespace-pre-wrap wrap-break-word">{msg.text}</p>
						</div>
						{msg.from === "user" && (
							<div
								className={cn(
									"w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1",
									isDark
										? "bg-slate-700 text-slate-300"
										: "bg-slate-200 text-slate-600",
								)}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									className="w-4 h-4"
								>
									<title>User</title>
									<path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
								</svg>
							</div>
						)}
					</div>
				))}
				{isGenerating && (
					<div className="flex gap-2 justify-start">
						<div
							className={cn(
								"w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1",
								isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white",
							)}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								className="w-4 h-4"
							>
								<title>AI Assistant</title>
								<path d="M10 1a6 6 0 00-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 00.572.729 6.016 6.016 0 002.856 0A.75.75 0 0012 15.1v-.644c0-1.013.762-1.957 1.815-2.825A6 6 0 0010 1zM8.863 17.414a.75.75 0 00-.226 1.483 9.066 9.066 0 002.726 0 .75.75 0 00-.226-1.483 7.553 7.553 0 01-2.274 0z" />
							</svg>
						</div>
						<div className="max-w-[90%] space-y-2">
							<div
								className={cn(
									"h-4 w-48 rounded animate-pulse",
									isDark ? "bg-slate-800" : "bg-slate-200",
								)}
							/>
							<div
								className={cn(
									"h-4 w-64 rounded animate-pulse",
									isDark ? "bg-slate-800" : "bg-slate-200",
								)}
							/>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			<button
				type="button"
				onClick={() => {
					sendChatWithAI();

					callAction(
						"showNotification",
						"Continuing chat in SidePanel...",
						"info",
					);

					track({
						context: Env.CONTENT,
						eventName: EventName.CHAT_WITH_AI_STARTED,
						params: { chatId },
					});
				}}
				className={cn(
					"absolute z-10 bottom-12 right-4 w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-colors",
					isDark
						? "bg-slate-700 hover:bg-slate-600 text-white"
						: "bg-slate-100 hover:bg-slate-200 text-slate-900",
				)}
				aria-label="Continue in sidepanel"
			>
				<ExternalLink className="w-4 h-4" />
			</button>

			<button
				type="button"
				onClick={() => {
					clear();
				}}
				className={cn(
					"absolute z-10 bottom-4 right-4 w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-colors",
					isDark
						? "bg-slate-700 hover:bg-slate-600 text-white"
						: "bg-slate-100 hover:bg-slate-200 text-slate-900",
				)}
				aria-label="Add"
			>
				<Plus className="w-4 h-4" />
			</button>
		</div>
	);
}
