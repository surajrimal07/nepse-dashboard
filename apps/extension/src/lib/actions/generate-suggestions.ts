import { URLS } from "@/constants/app-urls";
import { getAppState } from "@/entrypoints/background";
import { getUser } from "@/lib/storage/user-storage";
import { Env, EventName } from "@/types/analytics-types";
import type { ParsedDocument } from "@/types/news-types";
import { Track } from "../analytics/analytics";

export const defaultSuggestions = [
	"What does the page say?",
	"Is this information on the page correct?",
	"Can you solve the question in the page?",
	"What are the key points from the content?",
];

export async function generateSuggestions(
	url: string,
	content: ParsedDocument | null,
): Promise<string[] | undefined | null> {
	if (!url || !content) {
		return Promise.resolve(defaultSuggestions);
	}

	const authUser = await getUser();
	const aiConfig = getAppState().get().aiSettings;
	const aiMode = getAppState().get().aiMode;

	if (!aiMode) {
		return Promise.resolve(defaultSuggestions);
	}

	try {
		const result = await fetch(`${URLS.inference_url}/api/suggestions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				url,
				authUser,
				aiConfig,
				content: content.content,
				title: content.title,
			}),
		});

		if (!result.ok) {
			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.SUGGESTION_GENERATION_FAILED,
				params: {
					url,
					status: result.status,
				},
			});

			return Promise.resolve(defaultSuggestions);
		}

		void Track({
			context: Env.BACKGROUND,
			eventName: EventName.SUGGESTION_GENERATION_SUCCESS,
			params: {
				url,
				status: result.status,
			},
		});

		return (await result.json()).suggestions;
	} catch (e) {
		void Track({
			context: Env.BACKGROUND,
			eventName: EventName.SUGGESTION_GENERATION_FAILED,
			params: {
				url,
				error: e instanceof Error ? e.message : String(e),
			},
		});

		return Promise.resolve(defaultSuggestions);
	}
}
