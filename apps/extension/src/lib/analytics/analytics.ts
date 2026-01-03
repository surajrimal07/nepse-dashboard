import { OP } from "@/lib/analytics/op";
import { getUser } from "@/lib/storage/user-storage";
import type { AnalyticsMessage, Env } from "@/types/analytics-types";
import type { EventCountType } from "@/types/increment-type";
import { logger } from "@/utils/logger";
import { getExtensionOrigin } from "@/utils/origin";

const origin = getExtensionOrigin();

const originalConsoleError = console.error;

// biome-ignore lint/suspicious/noExplicitAny: <expected>
console.error = (...args: any[]) => {
	if (typeof args[0] === "string" && args[0].includes("Max retries reached")) {
		return;
	}
	originalConsoleError(...args);
};

export async function IdentifyUser() {
	try {
		const user = await getUser();
		await OP.identify({
			profileId: user.randomId,
			email: user.email || "Anonymous",
			avatar: user.image || undefined,
		});
	} catch (e) {
		logger.warn("Analytics error", e);
	}
}

export async function TrackPage(data: {
	context: Env;
	path: string;
	title?: string;
}) {
	try {
		await OP.track("screen_view", {
			//dang they seem to use screen_view for page tracking not page_view
			environment: data.context,
			path: data.path,
			title: data.title,
			origin,
		});
	} catch (e) {
		logger.warn("Analytics error", e);
	}
}

export async function Track(data: {
	context: Env;
	eventName: string;
	params?: Record<string, unknown>;
}) {
	try {
		await OP.track(data.eventName, {
			environment: data.context,
			...data.params,
		});
	} catch (e) {
		logger.warn("Analytics error", e);
	}
}

export async function Increment(data: {
	property: EventCountType;
	value: number;
}) {
	try {
		const user = await getUser();
		void OP.increment({
			profileId: user.randomId,
			property: data.property,
			value: data.value,
		});
	} catch (e) {
		logger.warn("Analytics error", e);
	}
}

export function Analytics(data: AnalyticsMessage) {
	switch (data.type) {
		case "track": {
			void Track({
				context: data.context,
				eventName: data.eventName,
				params: data.params,
			});
			break;
		}
		case "page": {
			void TrackPage({
				context: data.context,
				path: data.path,
				title: data.title,
			});
			break;
		}

		case "identify": {
			void IdentifyUser();
			break;
		}

		default: {
			const _never: never = data;
			logger.warn("Unknown analytics message", _never);
			break;
		}
	}
}
