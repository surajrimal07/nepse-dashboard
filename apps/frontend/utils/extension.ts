"use client";
import { extensionId } from "@/constants/constants";

export interface ExtensionResponse {
	success: boolean;
	error?: string;
}

export const checkExtensionInstalled = async (): Promise<boolean> => {
	if (typeof window === "undefined") {
		console.log("Window is undefined");
		// running on Vercel SSR
		return false;
	}

	if (!("chrome" in window) || !chrome.runtime) {
		console.log("Chrome runtime not available");
		return false;
	}

	return new Promise((resolve) => {
		try {
			chrome.runtime.sendMessage(extensionId, { type: "ping" }, (response) => {
				if (chrome.runtime.lastError) {
					console.log(
						"Error communicating with extension:",
						chrome.runtime.lastError,
					);
					resolve(false);
					return;
				}

				if (response?.type === "pong") {
					resolve(true);
				} else {
					resolve(false);
				}
			});

			// Timeout after 1 second
			setTimeout(() => resolve(false), 1000);
		} catch {
			resolve(false);
		}
	});
};

export const openExtensionPanel = (
	onResponse: (success: boolean, error?: string) => void,
) => {
	if (typeof chrome !== "undefined" && chrome.runtime) {
		try {
			chrome.runtime.sendMessage(
				extensionId,
				{
					type: "openpanel",
				},
				(response: ExtensionResponse) => {
					if (chrome.runtime.lastError) {
						onResponse(false, "Extension not installed or not responding");
						return;
					}

					if (response?.success) {
						onResponse(true);
					} else {
						onResponse(false, response?.error || "Failed to open extension");
					}
				},
			);
		} catch (error) {
			onResponse(
				false,
				"Error opening extension: " +
					((error as Error).message || "Unknown error"),
			);
		}
	} else {
		onResponse(false, "Chrome extension not available");
	}
};
