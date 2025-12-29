import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import type { Id } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import {
	convertToModelMessages,
	generateId,
	generateText,
	stepCountIs,
	type UIMessage,
} from "ai";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import type { AIConfig, AuthUser } from "@/app/chat/types";
import { getModelFactory } from "@/utils/get-factory-model";
import { fullArticleBody, tools } from "@/utils/tools";
import { financialExpertSystemPrompt } from "./prompt";

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
			messages: string;
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

		const modelMessage: UIMessage[] = [
			{
				parts: [
					{
						type: "text",
						text: messages,
					},
				],
				id: generateId(),
				role: "user",
			},
		];

		// save user message first
		fetchMutation(api.chat.createMessage, {
			chatId,
			content: modelMessage[0], // last message, we don't need array only actual object
		});

		const articleSummary = await fetchQuery(api.article.getArticleIfAvailable, {
			chatId,
		});

		const { text, usage } = await generateText({
			model: modelFactory(aiConfig.model, aiConfig.apiKey),
			system: financialExpertSystemPrompt(articleSummary),
			messages: convertToModelMessages(modelMessage),
			tools: {
				...tools,
				getArticleFullBody,
			},
			stopWhen: stepCountIs(2),
		});

		fetchMutation(api.chat.createMessage, {
			chatId,
			content: {
				id: generateId(),
				metadata: {
					createdAt: Date.now(),
					model: aiConfig.model,
					totalTokens: usage.totalTokens,
				},
				parts: [
					{ type: "step-start" },
					{
						state: "done",
						text: text,
						type: "text",
					},
				],
				role: "assistant",
			},
		});

		return Response.json({ messages: text });
	} catch (error) {
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

// {
//   id: "umup0XwIPI6YoVv3",
//   parts: [
//     {
//       text: "mate do you see price lowering in coming days?",
//       type: "text",
//     },
//   ],
//   role: "user",
// }

// Message structure: [
//   {
//     "parts": [
//       {
//         "type": "text",
//         "text": "how are you mate"
//       }
//     ],
//     "id": "GTkTTfB0b8KMKhSZ",
//     "role": "user"
//   }
// ]
