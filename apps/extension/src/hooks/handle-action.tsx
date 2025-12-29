/** biome-ignore-all lint/suspicious/noExplicitAny: <will fix later> */
import { toast } from "sonner";
import { Track } from "@/lib/analytics/analytics";
import { Env, EventName } from "@/types/analytics-types";

export function handleActionResult(result: any) {
	if (!result) return;
	if (result.success) {
		toast.success(result.message);
	} else {
		toast.error(result.message ?? "Unknown error");
	}
	if (!result.success) {
		Track({
			context: Env.UNIVERSAL,
			eventName: EventName.APP_SERVICE_ERROR,
			params: { error: result.message },
		});
	}
}
