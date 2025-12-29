// import { extensionId } from "@/constants/constants";
// import type { CredentialsData, ExtensionResponse } from "./types";

// export const askCredentials = (
// 	onResponse: (data: CredentialsData | null, error?: string) => void,
// ) => {
// 	if (typeof chrome !== "undefined" && chrome.runtime) {
// 		try {
// 			let responseReceived = false;

// 			chrome.runtime.sendMessage(
// 				extensionId,
// 				{
// 					type: "sendCredentials",
// 				},
// 				(response: ExtensionResponse) => {
// 					responseReceived = true;

// 					if (chrome.runtime.lastError) {
// 						onResponse(null, chrome.runtime.lastError.message);
// 						return;
// 					}

// 					if (response?.success && response.data) {
// 						onResponse(response.data, undefined);
// 					} else {
// 						onResponse(
// 							null,
// 							response?.error || "Failed to communicate with extension",
// 						);
// 					}
// 				},
// 			);

// 			setTimeout(() => {
// 				if (!responseReceived) {
// 					onResponse(
// 						null,
// 						"Extension did not respond in time - you may need to install or update the extension",
// 					);
// 				}
// 			}, 5000);
// 		} catch (extensionError) {
// 			onResponse(
// 				null,
// 				"Error communicating with extension: " +
// 					((extensionError as Error).message || "Unknown error"),
// 			);
// 		}
// 	} else {
// 		onResponse(null, "Chrome extension not available");
// 	}
// };

// export const openExtensionPanel = (
// 	onResponse: (success: boolean, error?: string) => void,
// ) => {
// 	if (typeof chrome !== "undefined" && chrome.runtime) {
// 		try {
// 			chrome.runtime.sendMessage(
// 				extensionId,
// 				{
// 					type: "openpanel",
// 				},
// 				(response: ExtensionResponse) => {
// 					if (response?.success) {
// 						onResponse(true);
// 					} else {
// 						onResponse(false, response?.error || "Failed to open extension");
// 					}
// 				},
// 			);
// 		} catch (error) {
// 			onResponse(
// 				false,
// 				"Error opening extension: " +
// 					((error as Error).message || "Unknown error"),
// 			);
// 		}
// 	} else {
// 		onResponse(false, "Chrome extension not available");
// 	}
// };
