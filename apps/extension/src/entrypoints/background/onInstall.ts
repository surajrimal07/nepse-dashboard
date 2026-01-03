import { browser } from "#imports";
import { URLS } from "@/constants/app-urls";
import { IdentifyUser, Track } from "@/lib/analytics/analytics";
import { Env, EventName } from "@/types/analytics-types";
import { getVersion } from "@/utils/version";

export function onInstall() {
	browser.runtime.onInstalled.addListener(async (details) => {
		if (details.reason === "install") {
			await browser.tabs.create({
				url: `${URLS.welcome_url}`,
			});

			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.INSTALLED,
			});
		}

		if (details.reason === "update") {
			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.UPDATED,
				params: {
					from_version: details.previousVersion,
					to_version: getVersion(),
				},
			});
		}

		IdentifyUser();

		browser.runtime.setUninstallURL(URLS.uninstall_url);
	});
}
