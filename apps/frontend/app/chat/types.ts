import type { aiProvidersType } from "@nepse-dashboard/ai/types";
import type { Id } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import z from "@nepse-dashboard/zod";
import type { ToolUIPart } from "ai";

export interface Message {
	source: "extension" | "page";
	type: string;
	payload?: unknown;
}

export interface AuthUser {
	email: string | null;
	randomId: string;
	image: string | null;
}

export interface AIConfig {
	hasKeys: boolean;
	provider: aiProvidersType | null;
	model: string | null;
	apiKey: string | null;
}

export interface ChatSession {
	_id: Id<"chats">;
	updatedAt: number;
	title: string;
}

export type MessageType = {
	key: string;
	from: "user" | "assistant";
	sources?: { href: string; title: string }[];
	versions: {
		id: string;
		content: string;
	}[];
	reasoning?: {
		content: string;
		duration: number;
	};
	tools?: {
		name: string;
		description: string;
		status: ToolUIPart["state"];
		parameters: Record<string, unknown>;
		result: string | undefined;
		error: string | undefined;
	}[];
};

export const messageMetadataSchema = z.object({
	createdAt: z.number().optional(),
	model: z.string().optional(),
	totalTokens: z.number().optional(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;
