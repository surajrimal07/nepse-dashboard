"use client";

import type { Id } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import { ArrowRight, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatSession } from "./types";

const suggestedTopics = [
	"What's the NEPSE market status?",
	"Show me top gainers today",
	"Analyze stock performance",
	"Chat about this page",
];

interface EmptyChatStateProps {
	chats: ChatSession[];
	onChatClick?: (chatId: Id<"chats">) => void;
	onSuggestedTopicClick?: (topic: string) => void;
}

export function EmptyChatState({
	chats,
	onChatClick,
	onSuggestedTopicClick,
}: EmptyChatStateProps) {
	return (
		<div className="h-full w-full flex flex-col items-center justify-center">
			<div className="text-center mb-8">
				<div className="flex justify-center mb-3">
					<div className="p-2 rounded-lg  border border-neutral-700/50">
						<MessageSquare className="w-8 h-8 " />
					</div>
				</div>
				<h2 className="text-2xl font-semibold text-neutral-100 mb-2">
					No Messages Yet
				</h2>
				<p className="text-sm text-neutral-400 max-w-md">
					Start a new conversation or continue with an existing one below
				</p>
			</div>

			{chats.length > 0 && (
				<div className="w-full max-w-md mb-12">
					<h3 className="text-xs font-semibold text-neutral-300 mb-3 px-1">
						Continue where you left off
					</h3>
					<div className="space-y-2">
						{chats.slice(0, 5).map((chat) => (
							<button
								type="button"
								key={chat._id}
								onClick={() => onChatClick?.(chat._id)}
								className={cn(
									"w-full text-left px-4 py-3 rounded-lg",
									"bg-neutral-800/40 border border-neutral-700/50",
									"text-sm text-neutral-300 font-medium",
									"hover:bg-neutral-700/60 hover:border-neutral-700/80",
									"transition-all duration-200",
									"flex items-center justify-between group",
								)}
							>
								<span className="truncate flex-1">
									{chat.title || "Untitled Chat"}
								</span>
								<ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 flex-shrink-0 ml-2" />
							</button>
						))}
					</div>
				</div>
			)}

			<div className="w-full max-w-md">
				<h3 className="text-xs font-semibold text-neutral-300 mb-3 px-1">
					Suggested Topics
				</h3>
				<div className="space-y-2">
					{suggestedTopics.map((topic) => (
						<button
							type="button"
							key={topic}
							onClick={() => onSuggestedTopicClick?.(topic)}
							className={cn(
								"w-full text-left px-4 py-3 rounded-lg",
								"bg-neutral-800/40 border border-neutral-700/50",
								"text-sm text-neutral-300 font-medium",
								"hover:bg-neutral-700/60 hover:border-neutral-700/80",
								"transition-all duration-200",
								"flex items-center justify-between group",
							)}
						>
							<span>{topic}</span>
							<ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 flex-shrink-0 ml-2" />
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
