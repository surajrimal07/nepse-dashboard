// export async function trackFromContentScript(
// 	event: string,
// 	data: unknown,
// ): Promise<void> {
// 	return new Promise((resolve) => {
// 		try {
// 			browser.runtime.sendMessage({ type: "track", event, data }, () => {
// 				resolve();
// 			});
// 		} catch {
// 			resolve();
// 		}
// 	});
// }
