import { TMS_LOGIN_URL } from "@/constants/content-url";
import { logger } from "@/utils/logger";

/**
 * Storage key for pending credentials
 */
const STORAGE_KEY = "tms_pending_credentials";

/**
 * Selectors for login form fields
 */
const SELECTORS = {
	USERNAME: 'input[placeholder="Client Code/ User Name"]',
	PASSWORD: 'input[placeholder="Password"]',
} as const;

/**
 * Pending credential data structure
 */
interface PendingCredential {
	brokerNumber: string;
	username: string;
	password: string;
	capturedAt: number;
}

/**
 * CredentialCapture Module
 *
 * Simple, isolated module for capturing login credentials.
 * - Always listens to username/password input fields
 * - Stores to localStorage (survives page navigation)
 * - Exposes method to process on dashboard load
 *
 * Flow:
 * 1. Login page loads → startCapturing()
 * 2. User types (or automation fills) → saved to localStorage
 * 3. Dashboard loads → processPendingCredentials()
 * 4. Backend decides: create/update/ignore
 * 5. Clear localStorage
 */
export class CredentialCapture {
	private static abortController: AbortController | null = null;

	/**
	 * Extract broker number from TMS URL
	 */
	private static extractBrokerNumber(url: string): string | null {
		const match = url.match(TMS_LOGIN_URL);
		return match ? match[1] : null;
	}

	/**
	 * Save pending credentials to localStorage
	 */
	private static savePending(data: PendingCredential): void {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		} catch (e) {
			logger.log("CredentialCapture: Failed to save to localStorage", e);
		}
	}

	/**
	 * Get pending credentials from localStorage
	 */
	private static getPending(): PendingCredential | null {
		try {
			const data = localStorage.getItem(STORAGE_KEY);
			return data ? JSON.parse(data) : null;
		} catch {
			return null;
		}
	}

	/**
	 * Clear pending credentials from localStorage
	 */
	static clear(): void {
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			// Ignore errors
		}
	}

	/**
	 * Start capturing credentials on login page.
	 * Call this when login page loads.
	 */
	static startCapturing(): void {
		// Cleanup any previous listeners
		if (this.abortController) {
			this.abortController.abort();
		}
		this.abortController = new AbortController();
		const signal = this.abortController.signal;

		const brokerNumber = this.extractBrokerNumber(window.location.href);
		if (!brokerNumber) {
			logger.log("CredentialCapture: No broker number found in URL");
			return;
		}

		const usernameField = document.querySelector<HTMLInputElement>(
			SELECTORS.USERNAME,
		);
		const passwordField = document.querySelector<HTMLInputElement>(
			SELECTORS.PASSWORD,
		);

		if (!usernameField || !passwordField) {
			logger.log("CredentialCapture: Login fields not found");
			return;
		}

		logger.log("CredentialCapture: Started listening for credentials");

		// Capture function - called on any input change
		const captureCredentials = () => {
			const username = usernameField.value.trim();
			const password = passwordField.value;

			// Only save if both fields have values
			if (username && password) {
				this.savePending({
					brokerNumber,
					username,
					password,
					capturedAt: Date.now(),
				});
			}
		};

		// Listen to input events on both fields
		const events = ["input", "change", "blur"] as const;
		for (const event of events) {
			usernameField.addEventListener(event, captureCredentials, { signal });
			passwordField.addEventListener(event, captureCredentials, { signal });
		}

		// Also capture initial values if already filled
		captureCredentials();
	}

	/**
	 * Stop capturing credentials.
	 * Call this when leaving login page.
	 */
	static stopCapturing(): void {
		if (this.abortController) {
			this.abortController.abort();
			this.abortController = null;
		}
		logger.log("CredentialCapture: Stopped listening");
	}

	/**
	 * Process pending credentials on dashboard load.
	 * Call this when dashboard page is detected.
	 *
	 * @param appConnection - The app state connection for calling actions
	 * @returns true if credentials were processed, false otherwise
	 */
	static async processPendingCredentials(appConnection: {
		get: () => { autoSaveNewAccount?: boolean };
		callAction: (action: string, ...args: unknown[]) => Promise<void>;
	}): Promise<boolean> {
		const pending = this.getPending();

		if (!pending) {
			logger.log("CredentialCapture: No pending credentials");
			return false;
		}

		// Check if credentials are fresh (within last 5 minutes)
		const age = Date.now() - pending.capturedAt;
		const MAX_AGE = 5 * 60 * 1000; // 5 minutes
		if (age > MAX_AGE) {
			logger.log("CredentialCapture: Pending credentials too old, discarding");
			this.clear();
			return false;
		}

		// Check if auto-save is enabled
		const { autoSaveNewAccount } = appConnection.get();
		if (!autoSaveNewAccount) {
			logger.log("CredentialCapture: Auto-save disabled, discarding");
			this.clear();
			return false;
		}

		try {
			logger.log("CredentialCapture: Processing pending credentials...");

			// Send to backend - backend handles create/update/ignore logic
			await appConnection.callAction(
				"saveAccountIfNeeded",
				"tms", // AccountType.TMS as string
				Number(pending.brokerNumber),
				pending.username,
				pending.password,
			);

			logger.log("CredentialCapture: Credentials sent to backend");
			this.clear();
			return true;
		} catch (error) {
			logger.log("CredentialCapture: Failed to save credentials", error);
			this.clear();
			return false;
		}
	}
}
