import { Track } from "@/lib/analytics/analytics";
import { Env, EventName } from "@/types/analytics-types";
import { geoLocationSchema, type LocationData } from "@/types/location-types";

export async function getLocation(): Promise<LocationData | null> {
	try {
		const cachedLocation =
			await storage.getItem<LocationData>("local:location");

		if (cachedLocation) {
			return cachedLocation;
		}

		const apiurl = import.meta.env.VITE_LOCATION_API_URL;

		const response = await fetch(apiurl);

		if (!response.ok) {
			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.LOCATION_ERROR,
				params: {
					error: `Response not ok: ${response.statusText}`,
					name: "getLocation",
				},
			});

			return null;
		}

		const data = await response.json();

		const validatedData = geoLocationSchema.safeParse(data);

		if (!validatedData.success) {
			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.LOCATION_ERROR,
				params: {
					error: `Validation failed: ${validatedData.error}`,
					name: "getLocation",
				},
			});

			return null;
		}

		await storage.setItem("local:location", validatedData.data);

		return validatedData.data as LocationData;
	} catch (error) {
		void Track({
			context: Env.BACKGROUND,
			eventName: EventName.LOCATION_ERROR,
			params: {
				error: error instanceof Error ? error.message : String(error),
				name: "getLocation",
			},
		});

		return null;
	}
}
