import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { generateObject } from "ai";
import { fetchMutation } from "convex/nextjs";
import { z } from "zod";
import { op } from "@/lib/op";
import { getModelFactory } from "@/utils/get-factory-model";
import { articleSummaryAndQuestionsPrompt } from "./system";

export const maxDuration = 30;

export async function POST(req: Request) {
	try {
		const { authUser, aiConfig, url, content, title } = await req.json();

		if (
			!aiConfig?.provider ||
			!aiConfig.model ||
			!aiConfig.apiKey ||
			!url ||
			!content
		) {
			return new Response(
				JSON.stringify({ error: "Invalid request parameters" }),
				{ status: 400 },
			);
		}

		const modelFactory = getModelFactory(aiConfig.provider);

		const result = await generateObject({
			model: modelFactory(aiConfig.model, aiConfig.apiKey),
			schema: z.object({
				questions: z.array(z.string().max(200)).length(4),
				summary: z.string().max(5000).min(10),
			}),
			system: articleSummaryAndQuestionsPrompt,

			messages: [
				{
					role: "user",
					content: `
						ARTICLE TITLE:
						${title}

						ARTICLE URL:
						${url}

						ARTICLE CONTENT:
						${content}
							`.trim(),
				},
			],
		});

		const suggestions = result.object.questions;
		const summary = result.object.summary;

		await fetchMutation(api.webSuggestions.addSuggestion, {
			userId: authUser.email,
			url,
			suggestions,
			summary: {
				summary,
				content,
				title,
				generated_provider: aiConfig.provider,
				generated_model: aiConfig.model,
			},
		});

		return new Response(JSON.stringify({ suggestions }), {
			status: 200,
		});
	} catch (error) {
		op.track("suggestions_request_error", {
			source: "api/suggestions/route POST",
			event_type: "error",
			error: error instanceof Error ? error.message : "Unknown error",
		});

		return new Response(
			JSON.stringify({
				error: "Failed to process suggestions",
				details: error instanceof Error ? error.message : "Unknown error",
			}),
			{ status: 500 },
		);
	}
}
