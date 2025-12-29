import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import type { Id } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import {
	convertToModelMessages,
	createIdGenerator,
	stepCountIs,
	streamText,
} from "ai";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import type { AIConfig, AuthUser } from "@/app/chat/types";
import { op } from "@/lib/op";
import { getModelFactory } from "@/utils/get-factory-model";
import { type ChatMessage, fullArticleBody, tools } from "@/utils/tools";
import { financialExpertSystemPrompt } from "./prompt";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
	try {
		const {
			authUser,
			aiConfig,
			messages,
			chatId,
		}: {
			authUser: AuthUser;
			aiConfig: AIConfig;
			messages: ChatMessage[];
			chatId: Id<"chats">;
		} = await req.json();

		// Validate required fields
		if (
			!aiConfig?.provider ||
			!aiConfig.model ||
			!aiConfig?.apiKey ||
			!chatId ||
			!authUser?.email
		) {
			return new Response(
				JSON.stringify({
					error: "Invalid request parameters",
					details: "Missing params",
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const modelFactory = getModelFactory(aiConfig.provider);

		const getArticleFullBody = fullArticleBody({ chatId });

		// save user message first
		fetchMutation(api.chat.createMessage, {
			chatId,
			content: messages[messages.length - 1],
		});

		const articleSummary = await fetchQuery(api.article.getArticleIfAvailable, {
			chatId,
		});

		const result = streamText({
			model: modelFactory(aiConfig.model, aiConfig.apiKey),
			system: financialExpertSystemPrompt(articleSummary),
			messages: convertToModelMessages(messages),
			tools: {
				...tools,
				getArticleFullBody,
			},
			stopWhen: stepCountIs(2),
		});

		return result.toUIMessageStreamResponse({
			originalMessages: messages ?? ([] as ChatMessage[]),
			sendSources: true,
			sendReasoning: true,
			generateMessageId: createIdGenerator(),
			messageMetadata: ({ part }) => {
				if (part.type === "start") {
					return {
						createdAt: Date.now(),
						model: aiConfig.model,
					};
				}

				if (part.type === "finish") {
					return {
						totalTokens: part.totalUsage.totalTokens,
					};
				}
			},
			onFinish: (finalMessage) => {
				const message = finalMessage.responseMessage;

				if (!message) {
					throw new Error("No messages provided");
				}

				fetchMutation(api.chat.createMessage, {
					chatId,
					content: message,
				});
			},
		});
	} catch (error) {
		op.track("chat_request_error", {
			source: "api/chat/route POST",
			event_type: "error",
			error: error instanceof Error ? error.message : "Unknown error",
		});

		return new Response(
			JSON.stringify({
				error: "Failed to process chat request",
				details: error instanceof Error ? error.message : "Unknown error",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}

export async function DELETE(req: Request) {
	const { chatId }: { chatId: Id<"chats"> } = await req.json();

	try {
		await fetchMutation(api.chat.deleteChat, { _id: chatId });
		return new Response(null, { status: 200 });
	} catch (error) {
		op.track("chat_delete_error", {
			source: "api/chat/route DELETE",
			event_type: "error",
			error: error instanceof Error ? error.message : "Unknown error",
		});

		return new Response(null, { status: 500 });
	}
}