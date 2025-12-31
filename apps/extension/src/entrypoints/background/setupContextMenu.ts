import { browser } from "#imports";
import { Track } from "@/lib/analytics/analytics";
import { sendMessage } from "@/lib/messaging/extension-messaging";
import { Env, EventName } from "@/types/analytics-types";

export function setupContextMenu() {
	browser.contextMenus.create({
		id: "parent",
		title: "Nepse Dashboard",
		type: "normal",
		contexts: ["all"],
	});

	browser.contextMenus.create({
		id: "toggleSidebar",
		parentId: "parent",
		type: "normal",
		title: "Open Panel",
		contexts: ["all"],
	});

	browser.contextMenus.create({
		id: "togglechatwithai",
		parentId: "parent",
		type: "normal",
		title: "Chat with AI",
		contexts: ["all"],
	});

	// Setup click listener
	browser.contextMenus?.onClicked.addListener((info, tab) => {
		if (tab?.id && info.menuItemId === "toggleSidebar") {
			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.BACKGROUND_METRICS,
				params: {
					metric: "toggleSidebar",
				},
			});

			browser.sidePanel.open({ tabId: tab.id }).catch((error) => {
				void Track({
					context: Env.BACKGROUND,
					eventName: EventName.BACKGROUND_EXCEPTION,
					params: {
						error: String(error),
						name: "Context Menu Toggle Sidebar Click",
					},
				});
			});
		}

		if (tab?.id && info.menuItemId === "togglechatwithai") {
			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.BACKGROUND_METRICS,
				params: {
					metric: "togglechatwithai",
				},
			});

			browser.sidePanel
				.open({ tabId: tab.id })
				.then(async () => {
					await new Promise((resolve) => setTimeout(resolve, 1500));
					await sendMessage("goToRoute", { route: "/ai-chat" });
				})
				.catch((error) => {
					void Track({
						context: Env.BACKGROUND,
						eventName: EventName.BACKGROUND_EXCEPTION,
						params: {
							error: String(error),
							name: "Context Menu Chat with AI Click",
						},
					});
				});
		}
	});
}
