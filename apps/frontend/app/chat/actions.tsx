"use server";
import type { Id } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import type { AIConfig, AuthUser } from "./types";

export async function addTitle(
	authUser: AuthUser,
	aiConfig: AIConfig,
	chatId: Id<"chats">,
	humanMessage: string,
): Promise<boolean> {
	try {
		await fetch(`/api/title`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				authUser,
				aiConfig,
				chatId,
				humanMessage,
			}),
		});

		return true;
	} catch {
		return false;
	}
}
