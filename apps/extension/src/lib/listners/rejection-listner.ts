import { track } from "@/lib/analytics/index";
import { type Env, EventName } from "@/types/analytics-types";

export function registerGlobalErrorListeners(env: Env) {
	const handler = async (event: PromiseRejectionEvent) => {
		let trackName: EventName;

		switch (env) {
			case "popup":
				trackName = EventName.POPUP_EXCEPTION;
				break;
			case "sidepanel":
				trackName = EventName.SIDEPANEL_EXCEPTION;
				break;
			case "options":
				trackName = EventName.OPTIONS_EXCEPTION;
				break;
			default:
				logger.warn("Unhandled environment for rejection listener");
				return;
		}

		track({
			context: env,
			eventName: trackName,
			params: {
				error: String(event.reason),
				environment: env,
			},
		});
	};

	window.addEventListener("unhandledrejection", handler);
}
