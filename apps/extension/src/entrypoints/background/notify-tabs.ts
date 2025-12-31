// export const registeredTabs = new Set<number>();

// export function notifyTabs(type: string, msg: unknown) {
// 	for (const tabId of registeredTabs) {
// 		browser.tabs.sendMessage(tabId, { type, msg }, () => {
// 			if (browser.runtime.lastError) {
// 				// remove tab from registered tabs if error occurs (e.g., tab closed)
// 				registeredTabs.delete(tabId);
// 				logger.info(
// 					`Failed to notify tab ${tabId}, removing from registered tabs: ${browser.runtime.lastError.message}`,
// 				);
// 			}
// 		});
// 	}
// }
