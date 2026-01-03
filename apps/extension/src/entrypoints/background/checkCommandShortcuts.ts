import { browser } from "#imports";
import { Track } from "@/lib/analytics/analytics";
import { Env, EventName } from "@/types/analytics-types";

export function checkCommandShortcuts() {
	browser.commands.getAll((commands) => {
		const missingShortcuts = [];

		for (const { name, shortcut } of commands) {
			if (shortcut === "") {
				missingShortcuts.push(name);
			}
		}

		if (missingShortcuts.length > 0) {
			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.BACKGROUND_INFO,
				params: {
					info: "Missing command shortcuts",
					missingCommands: missingShortcuts,
				},
			});

			// Update the extension UI to inform the user that one or more
			// commands are currently unassigned.
		}
	});
}
