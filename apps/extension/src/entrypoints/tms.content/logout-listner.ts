import { onMessage } from "@/lib/messaging/extension-messaging";
import { logger } from "@/utils/logger";

let unregisterLogoutListener: (() => void) | null = null;

/**
 * Performs the logout by interacting with the DOM elements.
 * 1. Opens the user dropdown
 * 2. Clicks the "Log Out" button
 */
async function performDomLogout() {
	try {
		logger.log("TMS: Attempting DOM-based logout...");

		// Find and click the logout button directly
		// Strategy: Click the 'a' tag containing the .nf-logout icon
		const logoutIcon = document.querySelector(".nf-logout");
		const logoutButton = logoutIcon?.closest("a.dropdown-item") as HTMLElement;

		if (logoutButton) {
			logoutButton.click();
			logger.log("TMS: Clicked logout button.");
		} else {
			// Fallback strategy: Find by text "Log Out"
			const items = Array.from(document.querySelectorAll("a.dropdown-item"));
			const logoutItem = items.find((item) =>
				item.textContent?.trim().toLowerCase().includes("log Out"),
			) as HTMLElement;

			if (logoutItem) {
				logoutItem.click();
				logger.log("TMS: Clicked logout button (found by text).");
			} else {
				logger.error("TMS: Logout button not found.");
			}
		}
	} catch (error) {
		logger.error("TMS: DOM Logout error", error);
	}
}

/**
 * Sets up a persistent listener for the logout command.
 * Should be called when the dashboard is detected.
 *
 * Message can include `nextAccount` for account switching.
 */
export function setupLogoutListener() {

	console.log("TMS: Setting up persistent logout listener");

	// Ensure we only register once
	if (unregisterLogoutListener) {
		return;
	}

	logger.log("TMS: Setting up persistent logout listener");

		unregisterLogoutListener = onMessage("handleTMSAccountLogout", async () => {
			logger.log("TMS: Received logout command. Initiating logout sequence...");

			await performDomLogout();
		});
}

/**
 * Removes the logout listener (e.g. when unloading or leaving dashboard context)
 */
export function removeLogoutListener() {
	if (unregisterLogoutListener) {
		unregisterLogoutListener();
		unregisterLogoutListener = null;
		logger.log("TMS: Logout listener removed");
	}
}
