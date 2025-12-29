import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import type { Id } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import z from "@nepse-dashboard/zod";
import { type InferUITools, tool, type UIDataTypes, type UIMessage } from "ai";
import { fetchQuery } from "convex/nextjs";
import type { MessageMetadata } from "@/app/chat/types";

export const fullArticleBody = ({ chatId }: { chatId: Id<"chats"> }) =>
	tool({
		description:
			"Fetch the full body content of a news article from a given URL",
		inputSchema: z.object({}),
		outputSchema: z.string(),
		execute: async () => {
			const res = await fetchQuery(api.article.getBody, {
				chatId,
			});
			return res ?? "No content available for this article.";
		},
	});

export const tools = {
	NepalTime: tool({
		description: "Get current date/time in Nepal",
		inputSchema: z.object({}),
		outputSchema: z.string(),
		execute: async () => {
			return new Date().toLocaleString("en-US", {
				timeZone: "Asia/Kathmandu",
			});
		},
	}),

	IsNepseOpen: tool({
		description: "Check if the Nepal Stock Exchange (NEPSE) is currently open",
		inputSchema: z.object({}),
		outputSchema: z.object({
			state: z.enum(["Open", "Close", "Pre Open", "Pre Close"]),
			isOpen: z.boolean(),
			asOf: z.string(),
		}),
		execute: async () => {
			const data = await fetchQuery(api.marketStatus.get);
			return {
				state: data?.isOpen ? "Open" : "Close",
				isOpen: data?.isOpen ?? false,
				asOf: data?.asOf ?? "N/A",
			};
		},
	}),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<MessageMetadata, UIDataTypes, ChatTools>;
