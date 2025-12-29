import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { URLS } from "@/constants/app-urls";
import { getAppState, getConvexClient } from "@/entrypoints/background";
import { getUser } from "@/lib/storage/user-storage";
import { Env, EventName } from "@/types/analytics-types";
import type { searchAIResponse } from "@/types/search-type";
import { Track } from "../analytics/analytics";

export async function generateChat(
	url: string,
	messages: string,
	chatid?: string,
): Promise<searchAIResponse> {
	if (!url || !messages) {
		return { message: "Invalid input" };
	}

	const authUser = await getUser();
	const aiConfig = getAppState().get().aiSettings;

	if (!authUser || !aiConfig?.provider || !aiConfig.model || !aiConfig.apiKey) {
		return { message: "Unauthorized" };
	}

	const convex = getConvexClient();

	let chatId = chatid;

	if (!chatid) {
		// meaning new chat
		chatId = await convex.mutation(api.chat.createChat, {
			linkedArticleUrl: url,
		});

		//add user to chat and generate title
		const response = await fetch(`${URLS.inference_url}/api/title`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				authUser,
				aiConfig,
				chatId,
				humanMessage: messages,
			}),
		});

		if (!response.ok || !chatId) {
			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.CHAT_TITLE_GENERATION_FAILED,
				params: {
					chatId,
					status: response.status,
				},
			});

			return { message: "Failed to create chat, is your API key valid?" };
		}
	}

	try {
		const result = await fetch(`${URLS.inference_url}/api/search`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				authUser,
				aiConfig,
				chatId,
				messages,
			}),
		});

		if (!result.ok) {
			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.CHAT_QUERY_FAILED,
				params: {
					chatId,
					status: result.status,
				},
			});

			return { message: "Failed to generate chat response" };
		}

		const data = await result.json();

		return { message: data.messages || "No response", chatId };
	} catch (e) {
		void Track({
			context: Env.BACKGROUND,
			eventName: EventName.CHAT_QUERY_EXCEPTION,
			params: {
				chatId,
				error: e instanceof Error ? e.message : String(e),
			},
		});

		return { message: "An error occurred" };
	}
}
