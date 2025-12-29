/** biome-ignore-all lint/suspicious/noExplicitAny: <expected> */

import { logger } from "@nepse-dashboard/logger";
import { OpenPanel } from "@openpanel/sdk";
import env, { isDevelopment } from "env";
import type { EventType } from "@/types/error-types";

export const OP = new OpenPanel({
	apiUrl: env.OPENPANEL_URL,
	clientId: isDevelopment ? env.OPENPANEL_ID_DEV : env.OPENPANEL_ID,
	clientSecret: isDevelopment ? env.OPENPANEL_SECRET_DEV : env.OPENPANEL_SECRET,
});

export default function Track(
	eventName: EventType,
	properties?: Record<string, any>,
): void {
	try {
		OP.track(eventName, {
			properties: {
				...properties,
			},
		});
	} catch (err) {
		logger.error(
			`Failed to track event: ${eventName}, ${err instanceof Error ? err.message : err}`,
		);
	}
}
