// export interface BackgroundResponse<T = unknown> {
// 	success: boolean;
// 	message: string;
// 	data?: T;
// }

// export async function sendMessageToBackground<T = unknown>(
// 	message: { type: string; data?: unknown },
// 	errorEventName?: string,
// 	timeoutMs = 2000,
// ): Promise<BackgroundResponse<T>> {
// 	return new Promise((resolve, reject) => {
// 		let timeoutId: number | null = null;

// 		const finish = (fn: () => void) => {
// 			if (timeoutId) clearTimeout(timeoutId);
// 			fn();
// 		};

// 		try {
// 			timeoutId = window.setTimeout(() => {
// 				finish(() => {
// 					try {
// 						if (errorEventName)
// 							trackFromContentScript(errorEventName, { error: "Timeout" });
// 					} catch {}
// 					reject(new Error("Background response timeout"));
// 				});
// 			}, timeoutMs);

// 			browser.runtime.sendMessage(
// 				message,
// 				async (response: BackgroundResponse<T> | undefined) => {
// 					if (browser.runtime.lastError) {
// 						const msg = browser.runtime.lastError.message;
// 						finish(() => {
// 							try {
// 								if (errorEventName)
// 									trackFromContentScript(errorEventName, { error: msg });
// 							} catch {}
// 							reject(new Error(msg));
// 						});
// 						return;
// 					}

// 					if (!response) {
// 						finish(() => {
// 							try {
// 								if (errorEventName)
// 									trackFromContentScript(errorEventName, {
// 										error: "No response received",
// 									});
// 							} catch {}
// 							reject(new Error("No response received"));
// 						});
// 						return;
// 					}

// 					if (response.success) {
// 						finish(() => resolve(response));
// 						return;
// 					}
// 					finish(() => {
// 						try {
// 							if (errorEventName)
// 								trackFromContentScript(errorEventName, {
// 									error: response.message,
// 								});
// 						} catch {}
// 						reject(new Error(response.message));
// 					});
// 				},
// 			);
// 		} catch (err) {
// 			if (timeoutId) clearTimeout(timeoutId);
// 			reject(err);
// 		}
// 	});
// }
