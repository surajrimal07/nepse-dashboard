import { browser } from "#imports";
import { Track } from "@/lib/analytics/analytics";
import { Env, EventName } from "@/types/analytics-types";
import { logger } from "@/utils/logger";

export function setupShortcutListeners() {
	browser.commands.onCommand.addListener((command) => {
		if (command === "openpopup") {
			browser.action.openPopup().catch((err) => {
				logger.warn("Failed to open popup:", err);
			});

			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.BACKGROUND_METRICS,
				params: {
					metric: "openPopup",
				},
			});
		}

		if (command === "opensidebar") {
			browser.windows.getCurrent(async (win) => {
				if (win.id != null) {
					browser.sidePanel.open({ windowId: win.id }).catch((err) => {
						logger.warn("Failed to open sidebar:", err);
					});
				}

				void Track({
					context: Env.BACKGROUND,
					eventName: EventName.BACKGROUND_METRICS,
					params: {
						metric: "openSidebar",
					},
				});
			});
		}

		if (command === "openoptions") {
			browser.runtime.openOptionsPage().catch((err) => {
				logger.warn("Failed to open options page:", err);
			});

			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.BACKGROUND_METRICS,
				params: {
					metric: "openOptions",
				},
			});
		}
	});
}
