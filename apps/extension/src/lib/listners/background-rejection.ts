import { Track } from "@/lib/analytics/analytics";
import { Env, EventName } from "@/types/analytics-types";

export function registerBackgroundListeners() {
	const handler = (event: PromiseRejectionEvent) => {
		Track({
			context: Env.BACKGROUND,
			eventName: EventName.UNHANDLED_REJECTION,
			params: {
				error: String(event.reason),
			},
		});
	};
	globalThis.addEventListener("unhandledrejection", handler);
}
