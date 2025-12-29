import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import type { Id } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import { generateText } from "ai";
import { fetchMutation } from "convex/nextjs";
import type { AIConfig, AuthUser } from "@/app/chat/types";
import { getModelFactory } from "@/utils/get-factory-model";

export async function PATCH(req: Request) {
	try {
		const {
			authUser,
			aiConfig,
			chatId,
			humanMessage,
		}: {
			authUser: AuthUser;
			aiConfig: AIConfig;
			chatId: Id<"chats">;
			humanMessage: string;
		} = await req.json();

		// Validate required fields
		if (
			!aiConfig?.provider ||
			!aiConfig.model ||
			!aiConfig?.apiKey ||
			!chatId ||
			!authUser?.email ||
			!humanMessage?.trim()
		) {
			return new Response(
				JSON.stringify({
					error: "Invalid request parameters",
					details:
						"Missing provider, model, apiKey, chatId, humanMessage, or authUser email",
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const modelFactory = getModelFactory(aiConfig.provider);

		const { text } = await generateText({
			model: modelFactory(aiConfig.model, aiConfig.apiKey),
			prompt: [
				"Generate a short chat title (max 40 characters).",
				"OUTPUT RULES:",
				"- Output ONLY the title.",
				"- Do NOT include quotes.",
				"- Do NOT include parentheses.",
				"- Do NOT add character counts.",
				"- Do NOT prefix with 'Title:' or anything else.",
				"User message:",
				humanMessage.trim(),
			].join("\n"),
		});

		const title = text?.split("\n")[0]?.trim();
		if (!title) {
			return new Response(
				JSON.stringify({
					error: "Failed to generate title",
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		await fetchMutation(api.chat.addUserToChat, {
			userId: authUser.email,
			chatId,
		});

		await fetchMutation(api.chat.renameChat, {
			_id: chatId,
			title,
		});

		return new Response(null, { status: 200 });
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
