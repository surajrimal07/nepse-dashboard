import { browser } from "#imports";

export function ExternalCommunication() {
	browser.runtime.onMessageExternal.addListener(
		(message, _sender, sendResponse) => {
			if (message?.type === "ping") {
				sendResponse({ success: true, type: "pong" });
				return true;
			}

			if (message?.type === "openpanel") {
				browser.windows.getCurrent((win) => {
					if (win?.id != null) {
						browser.sidePanel.open({ windowId: win.id }, () => {
							if (browser.runtime.lastError) {
								sendResponse({
									success: false,
									message: browser.runtime.lastError.message,
								});
								return;
							}

							sendResponse({
								success: true,
								message: "Sidepanel opened",
							});
						});
					} else {
						sendResponse({
							success: false,
							message: "Window ID not available",
						});
					}
				});
				return true;
			}
			sendResponse({ success: false, error: "Unknown external message" });
			return true;
		},
	);
}
