import { sendMessage } from "@/lib/messaging/extension-messaging";
import type { Env, EventName } from "@/types/analytics-types";

export function track(data: {
	context: Env;
	eventName: EventName;
	params?: Record<string, unknown>;
}) {
	sendMessage("analytics", { type: "track", ...data });
}

export function page(data: { context: Env; path: string; title?: string }) {
	sendMessage("analytics", { type: "page", ...data });
}

export function identify() {
	sendMessage("analytics", { type: "identify" });
}
