import { browser } from "#imports";
import { Analytics } from "@/lib/analytics/analytics";
import { onMessage } from "@/lib/messaging/extension-messaging";
import { getAppState } from ".";

export function ExtensionConnection() {
	onMessage("analytics", ({ data }) => {
		return Analytics(data);
	});

	onMessage("companiesList", () => {
		return getAppState().get().companiesList;
	});

	onMessage("openSidePanel", () => {
		browser.windows.getCurrent((win) => {
			if (win?.id != null) {
				browser.sidePanel.open({ windowId: win.id });
			}
		});
	});

	// onMessage("shouldExtract", () => {
	// 	if (shouldExtract) {
	// 		sendMessage("startExtraction");
	// 	}
	// });

	// onMessage("sendExtractionData", async ({ data }) => {
	// 	const randomId = await getUser();

	// 	convex.mutation(api.IndexData.consumeNepseIndexData, {
	// 		randomId: randomId?.randomId,
	// 		...data.extractedData,
	// 	});
	// });

	// browser.runtime.onMessage.addListener(
	// 	(message, _sender, sendResponse) => {
	// 		if (message?.type !== "opensidepanel") {
	// 			// Not handled here → allow next listener to handle it
	// 			return false;
	// 		}

	// 		// MUST remain completely synchronous
	// 		try {
	// 			browser.windows.getCurrent((win) => {
	// 				if (browser.runtime.lastError) {
	// 					sendResponse({
	// 						success: false,
	// 						message: browser.runtime.lastError.message,
	// 					});
	// 					return;
	// 				}

	// 				if (win?.id != null) {
	// 					browser.sidePanel.open({ windowId: win.id }, () => {
	// 						if (browser.runtime.lastError) {
	// 							sendResponse({
	// 								success: false,
	// 								message: browser.runtime.lastError.message,
	// 							});
	// 							return;
	// 						}

	// 						sendResponse({
	// 							success: true,
	// 							message: "Sidepanel opened",
	// 						});
	// 					});
	// 				} else {
	// 					sendResponse({
	// 						success: false,
	// 						message: "Window ID not available",
	// 					});
	// 				}
	// 			});
	// 		} catch (err) {
	// 			sendResponse({ success: false, message: String(err) });
	// 		}

	// 		// We are async via callback, so return true
	// 		return true;
	// 	},
	// );
}
