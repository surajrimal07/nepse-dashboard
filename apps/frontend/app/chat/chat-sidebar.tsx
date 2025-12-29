/** biome-ignore-all lint/a11y/noStaticElementInteractions: <ok> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <ok> */
"use client";

import type { Id } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import { Button } from "@nepse-dashboard/ui/components/button";
import { Label } from "@nepse-dashboard/ui/components/label";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeleteChatButton } from "./delete";
import type { ChatSession } from "./types";

interface ChatSidebarProps {
	isOpen: boolean;
	onClose: () => void;
	chats: ChatSession[];
	currentChatId: Id<"chats">;
	totalTokensUsed: number;
	onChatClick: (chatId: Id<"chats">) => void;
	onNewChat: () => void;
	onDeleteChat: (chatId: Id<"chats">) => void;
}

export function ChatSidebar({
	isOpen,
	onClose,
	chats,
	currentChatId,
	totalTokensUsed,
	onChatClick,
	onNewChat,
	onDeleteChat,
}: ChatSidebarProps) {
	return (
		<div
			className={cn(
				"fixed inset-0 z-40 transition-opacity duration-200",
				isOpen
					? "opacity-100 pointer-events-auto"
					: "opacity-0 pointer-events-none",
			)}
			onClick={onClose}
		>
			<div
				className={cn(
					"absolute left-0 top-0 h-full w-64 z-50 flex flex-col",
					"bg-neutral-900/95 backdrop-blur-md shadow-2xl",
					"border-r border-neutral-700/50",
					"transition-transform duration-300 ease-out",
					isOpen ? "translate-x-0" : "-translate-x-full",
				)}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between px-4 py-4 border-b border-neutral-800/50">
					<h2 className="text-sm font-semibold text-neutral-100">
						Chat History
					</h2>

					<Button
						type="button"
						onClick={onNewChat}
						className="h-8 w-8 rounded-lg p-0"
						variant="ghost"
						size="icon"
					>
						<Plus className="h-4 w-4" />
					</Button>
				</div>

				<div className="flex-1 overflow-y-auto px-1 py-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
					<div className="space-y-1">
						{chats?.length === 0 && (
							<div className="text-xs py-3 px-3 text-neutral-500 bg-neutral-800/30 border border-neutral-800/50 rounded-lg text-center">
								No chats yet
							</div>
						)}

						{chats.map((chat) => (
							<div
								key={chat._id}
								className={cn(
									"group flex items-center justify-between rounded-lg px-1.5 py-1.5",
									"text-sm transition-all cursor-pointer",
									chat._id === currentChatId
										? "bg-neutral-700/80 border-neutral-700/50 text-white"
										: "text-neutral-300 hover:bg-neutral-700/60 hover:border-neutral-700/50",
								)}
								onClick={() => onChatClick(chat._id)}
							>
								<span className="truncate text-sm font-medium flex-1">
									{chat.title || "Untitled"}
								</span>

								<DeleteChatButton chatId={chat._id} onConfirm={onDeleteChat} />
							</div>
						))}
					</div>
				</div>

				<div className="px-1 py-3 border-t border-neutral-800/50">
					<Label className="bg-neutral-700/80 border border-neutral-700/50 text-white px-3 py-2 rounded-lg block text-center text-xs">
						Token Used : {totalTokensUsed}
					</Label>
				</div>
			</div>
		</div>
	);
}
