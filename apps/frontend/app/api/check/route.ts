import type { aiProvidersType } from "@nepse-dashboard/ai/types";
import {
	convertToModelMessages,
	generateId,
	generateText,
	stepCountIs,
	type UIMessage,
} from "ai";
import { getModelFactory } from "@/utils/get-factory-model";

export async function POST(req: Request) {
	try {
		const {
			model,
			provider,
			key,
		}: {
			model: string;
			provider: aiProvidersType;
			key: string;
		} = await req.json();

		if (!model || !provider || !key) {
			return Response.json(
				{
					success: false,
					message: "Missing parameters",
				},
				{ status: 400 },
			);
		}

		const modelFactory = getModelFactory(provider);

		const messages: UIMessage[] = [
			{
				id: generateId(),
				role: "user",
				parts: [
					{
						type: "text",
						text: "Hello, this is a test message to validate my API key. Reply with success.",
					},
				],
			},
		];

		const { text } = await generateText({
			model: modelFactory(model, key),
			messages: convertToModelMessages(messages),
			stopWhen: stepCountIs(2),
		});

		return Response.json({
			success: true,
			message: text,
		});
	} catch (error) {
		console.error("Error processing check request:", error);

		return Response.json(
			{
				success: false,
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
