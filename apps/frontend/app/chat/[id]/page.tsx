"use server";
import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import type { Id } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import type { ChatMessage } from "@/utils/tools";
import ChatPage from "./chat";
import FailedToLoad from "./loading-failed";

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ id: Id<"chats"> }>;
	searchParams: Promise<{ q?: string }>;
}) {
	const { id } = await params;
	const { q } = await searchParams;

	let history: ChatMessage[] = [];
	let failed = false;

	try {
		history = await fetchQuery(api.chat.loadChat, { _id: id });
	} catch {
		failed = true;
	}

	if (failed) {
		return <FailedToLoad />;
	}

	return <ChatPage chatId={id} initialMessages={history ?? []} query={q} />;
}
