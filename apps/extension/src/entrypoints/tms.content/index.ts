import { connect } from "crann-fork";
import { type ContentScriptContext, defineContentScript } from "#imports";
import { TMS_LOGIN_URL, tms_watch_url } from "@/constants/content-url";
import { onMessage } from "@/lib/messaging/window-messaging";
import { appState } from "@/lib/service/app-service";
import type { Account } from "@/types/account-types";
import { AccountType } from "@/types/account-types";
import type { SolveResult } from "@/types/content-types";
import { ResultTypes, TMS_DASHBOARD_PATTERN } from "@/types/content-types";
import { logger } from "@/utils/logger";
import { solve_captcha } from "./capcha";
import { CredentialCapture } from "./credential-capture";

/**
 * Constants & Selectors
 */
const SELECTORS = {
	CAPTCHA_RELOAD: '[aria-label="Reload captcha"]',
	CAPTCHA_IMAGE: ".form-control.captcha-image-dimension.col-10",
	USERNAME: 'input[placeholder="Client Code/ User Name"]',
	PASSWORD: 'input[placeholder="Password"]',
	LOGIN_BTN: 'input[value="Login"]',
	// Toast selectors
	TOAST_CONTAINER: "#toasty",
	TOAST_ERROR: ".toasty-type-error",
	TOAST_TITLE: ".toast-title",
} as const;

// Patterns for detecting credential errors (stop immediately, don't retry)
const CREDENTIAL_ERROR_PATTERNS = [
	"correct username and password",
	"invalid credentials",
	"incorrect password",
] as const;

// Added key events to capture typing more reliably
const INPUT_EVENTS = ["input", "change", "keyup", "keydown"] as const;
const RELOAD_LIMIT = 7;
// Reverted back to 5 as per original request, though user temporarily set to 1 for testing.
// Keeping strictly to logic, I should respect the last known stable config or user intent.
// The user previously asked for 5. I will keep it 5 unless told otherwise.
const MAX_LOGIN_ATTEMPTS = 5;

/**
 * Automation states:
 * - IDLE: Not initialized yet
 * - INITIALIZING: init() called, about to start
 * - RUNNING: Modules active, auto-login enabled
 * - PAUSED: Credential error detected, captcha solving continues but no auto-submit
 * - STOPPED: Dashboard reached, completely stopped
 */
type AutomationState = "idle" | "initializing" | "running" | "paused" | "stopped";

/**
 * TMSAutomation Class
 * Handles reactive state management for TMS login automation.
 */
class TMSAutomation {
	// --- State ---
	private state: AutomationState = "idle";
	private abortController: AbortController | null = null;

	// Observers
	private mainMutationObserver: MutationObserver | null = null; // Watch body for captcha detection
	private srcMutationObserver: MutationObserver | null = null; // Watch captcha element for src updates
	private toastObserver: MutationObserver | null = null; // Watch for error toasts

	// Active Elements
	private currentCaptchaEl: HTMLImageElement | null = null;

	private currentAccount: Account | null = null;
	private cachedBrokerNumber: string | null = null;
	private accounts: Account[] = [];

	private autoLoginAttempts = 0;
	private reloadCounter = 0;
	private lastProcessedToastId = ""; // Prevent duplicate toast handling

	// Connection
	private appConnection = connect(appState);

	constructor() {
		// Initial pull to populate local state
		this.accounts = this.appConnection.get().accounts ?? [];
	}

	/**
	 * Entry Point
	 */
	public async init() {
		if (this.state !== "idle") return;
		// Mark as initializing (prevents double init) - start() will set to 'running'
		this.state = "initializing";

		// 1. Listen for global messages (always active)
		this.setupGlobalMessageListeners();

		// 2. Subscribe to store changes to drive logic
		this.appConnection.subscribe(
			async (state) => {
				this.accounts = state.accounts ?? [];
				await this.syncState();
			},
			["accounts", "autofills"],
		);

		// 3. Initial Sync
		await this.syncState();
	}

	/**
	 * syncState
	 * The brain of the operation. Decides whether to Start, Stop, or Update modules.
	 */
	private async syncState() {
		// If stopped (dashboard reached), don't restart
		if (this.state === "stopped") {
			return;
		}

		// Start if initializing (from init()), otherwise just update account
		if (this.state === "initializing") {
			await this.start();
		} else {
			await this.updateCurrentAccount();
		}
	}

	// --- Lifecycle Methods ---

	public async start() {
		logger.log("TMS Automation: Starting...");
		this.state = "running";
		this.abortController = new AbortController();

		await this.updateCurrentAccount();

		// Enable Modules
		await this.enableAutoLoginModule(); // Just autofills, doesn't submit
		this.enableCaptchaModule(); // Solves, and triggers submit on success
		this.enableToastModule(); // Watches for error toasts
		// Note: CredentialCapture.startCapturing() is called in main() on login page
	}

	public stop() {
		this.state = "stopped";

		// Cleanup Listeners
		if (this.abortController) {
			this.abortController.abort();
			this.abortController = null;
		}

		// Cleanup Observers
		this.disconnectObservers();

		// Reset state
		this.currentCaptchaEl = null;

		logger.log("TMS Automation: Stopped.");
	}

	async handleChangeToDashboardPage() {
		logger.log("TMS Automation: Detected dashboard page, stopping automation.");
		// Transition to stopped state
		this.state = "stopped";

		// Reset counters on successful login
		this.autoLoginAttempts = 0;
		this.reloadCounter = 0;

		// Process any captured credentials (auto-save)
		await CredentialCapture.processPendingCredentials(this.appConnection);

		if (this.currentAccount) {
			await this.appConnection.callAction(
				"setLastLoggedIn",
				this.currentAccount.alias,
				window.location.href,
				AccountType.TMS,
			);
		}
		this.stop();
	}

	private disconnectObservers() {
		if (this.mainMutationObserver) {
			this.mainMutationObserver.disconnect();
			this.mainMutationObserver = null;
		}
		if (this.srcMutationObserver) {
			this.srcMutationObserver.disconnect();
			this.srcMutationObserver = null;
		}
		if (this.toastObserver) {
			this.toastObserver.disconnect();
			this.toastObserver = null;
		}
	}

	private async updateCurrentAccount() {
		if (!this.cachedBrokerNumber) {
			this.cachedBrokerNumber = this.extractBrokerNumber(window.location.href);
		}

		if (!this.cachedBrokerNumber) {
			this.currentAccount = null;
			await this.appConnection.callAction(
				"showNotification",
				"Broker not found for this URL.",
				"error",
			);
			return;
		}

		const matchingAccounts = this.accounts.filter(
			(acc: Account) =>
				acc.type === AccountType.TMS &&
				acc.broker?.toString().padStart(2, "0") === this.cachedBrokerNumber,
		);

		const newAccount =
			matchingAccounts.find((acc) => acc.isPrimary) ||
			matchingAccounts[0] ||
			null;

		// Detect change
		const isSameAccount = newAccount?.alias === this.currentAccount?.alias;

		if (!isSameAccount) {
			// Account Switched - reset and try with new account if it has no error
			this.currentAccount = newAccount;
			if (this.state !== "stopped" && this.state !== "idle" && this.currentAccount) {
				// Check if new account has no error before attempting login
				if (!this.currentAccount.error) {
					logger.log("TMS: Switched to new account, attempting login...");
					this.autoLoginAttempts = 0;
					this.state = "running"; // Unpause when switching to valid account
					this.fillCredentials();
					this.reloadCaptcha(); // Trigger fresh captcha solve for new account
				} else {
					// New account also has error, stay paused
					logger.log("TMS: Switched account also has error, staying paused.");
					this.state = "paused";
				}
			}
		} else {
			// Same Account - Check if error was fixed
			const hadError = !!this.currentAccount?.error;
			const hasError = !!newAccount?.error;

			this.currentAccount = newAccount;

			// If error was cleared (user fixed it), retry login automatically
			if (this.state !== "stopped" && this.state !== "idle" && this.currentAccount && hadError && !hasError) {
				logger.log("TMS: Account error cleared. Retrying login...");
				this.autoLoginAttempts = 0;
				this.state = "running"; // Unpause since error was fixed
				this.fillCredentials();
				// Reload captcha to trigger fresh solve after error was fixed
				this.reloadCaptcha();
			}
		}
	}

	// --- Modules ---

	/**
	 * Module: Auto Login (Credentials only)
	 * Fills credentials. Actual submission is delegated to Captcha success.
	 */
	private async enableAutoLoginModule() {
		if (this.currentAccount) {
			this.fillCredentials();
		}
	}

	/**
	 * Module: Captcha
	 * Persistently monitors for Captcha element using MutationObservers.
	 */
	private enableCaptchaModule() {
		// 1. Initial Check
		this.checkForCaptchaElement();

		// 2. Persistent Watcher on Body
		// This handles Late Load, Dynamic Replacement, etc.
		if (!this.mainMutationObserver) {
			this.mainMutationObserver = new MutationObserver(() => {
				// We don't need to look at mutation records specifically,
				// just re-check if our element is there or changed.
				if (this.state !== "stopped") this.checkForCaptchaElement();
			});

			this.mainMutationObserver.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}
	}

	/**
	 * Logic to handle detection of the captcha element.
	 * Compares against current tracked element to handle replacements.
	 */
	private checkForCaptchaElement() {
		const el = document.querySelector<HTMLImageElement>(
			SELECTORS.CAPTCHA_IMAGE,
		);

		// Case A: Element Lost
		// It was there, but now it's gone.
		if (!el && this.currentCaptchaEl) {
			logger.log("TMS: Captcha element lost/removed.");
			this.cleanupSrcObserver();
			this.currentCaptchaEl = null;
			return;
		}

		// Case B: No change (logic already active for this element)
		if (el && el === this.currentCaptchaEl) {
			return;
		}

		// Case C: New Element Found (First time OR Replacement)
		if (el) {
			logger.log("TMS: New Captcha element detected.");

			// If we were tracking a different one, clean up first
			if (this.currentCaptchaEl) {
				this.cleanupSrcObserver();
			}

			this.currentCaptchaEl = el;

			// 1. Trigger Solve Immediately
			this.solveForElement(this.currentCaptchaEl);

			// 2. Watch this specific element for src changes (reloads)
			this.srcMutationObserver = new MutationObserver(async (mutations) => {
				if (this.state === "stopped") return;
				const srcMutated = mutations.some((m) => m.attributeName === "src");
				if (srcMutated && this.currentCaptchaEl) {
					logger.log("TMS: Captcha src refreshed.");
					this.solveForElement(this.currentCaptchaEl);
				}
			});

			this.srcMutationObserver.observe(this.currentCaptchaEl, {
				attributes: true,
				attributeFilter: ["src"],
			});
		}
	}

	private cleanupSrcObserver() {
		if (this.srcMutationObserver) {
			this.srcMutationObserver.disconnect();
			this.srcMutationObserver = null;
		}
	}

	private async solveForElement(el: HTMLImageElement) {
		// Safety check: element might have been removed between detection and solve
		if (!el || !el.isConnected) {
			logger.log("TMS: Captcha element no longer connected to DOM.");
			return;
		}

		const src = el.getAttribute("src");
		if (!src) return;

		// Filter out placeholder/loading states if applicable
		if (src.includes("captcha-image.jpg")) return;

		logger.log("TMS: Solving captcha...");
		const result = await solve_captcha(src);
		await this.handleCaptchaResult(result);
	}

	/**
	 * Module: Toast Observer
	 * Watches for error toasts to detect login failures.
	 * - Credential errors → Stop immediately, set account error
	 * - Other errors → Retry with captcha reload
	 */
	private enableToastModule() {
		// Find or wait for the toast container
		const toastContainer = document.querySelector(SELECTORS.TOAST_CONTAINER);
		const observeTarget = toastContainer || document.body;

		if (this.toastObserver) {
			this.toastObserver.disconnect();
		}

		this.toastObserver = new MutationObserver(() => {
			if (this.state === "stopped") return;
			this.checkForErrorToast();
		});

		this.toastObserver.observe(observeTarget, {
			childList: true,
			subtree: true,
		});
	}

	/**
	 * Checks for error toasts and handles them appropriately.
	 */
	private async checkForErrorToast() {
		const errorToast = document.querySelector(SELECTORS.TOAST_ERROR);
		if (!errorToast) return;

		const titleEl = errorToast.querySelector(SELECTORS.TOAST_TITLE);
		const errorMessage = titleEl?.textContent?.toLowerCase() || "";

		// Create a unique ID for this toast to prevent duplicate processing
		const toastId = `${errorMessage}-${Date.now().toString().slice(0, -3)}`; // Rough second-level timestamp
		if (this.lastProcessedToastId === toastId.slice(0, -1)) {
			// Same toast within ~10 seconds, skip
			return;
		}
		this.lastProcessedToastId = toastId.slice(0, -1);

		logger.log("TMS: Error toast detected:", errorMessage);

		// Check if this is a credential error (stop immediately)
		const isCredentialError = CREDENTIAL_ERROR_PATTERNS.some((pattern) =>
			errorMessage.includes(pattern),
		);

		if (isCredentialError) {
			// Credential error - PAUSE auto-login, user needs to fix credentials
			logger.log("TMS: Credential error detected, pausing auto-login.");
			await this.appConnection.callAction(
				"setError",
				this.currentAccount?.alias,
				"credentialError",
			);
			// Pause instead of stop - captcha solving continues, but no auto-submit
			// When user switches accounts, state will be reset to 'running'
			this.state = "paused";
		} else {
			// Other error - RETRY if attempts remaining
			if (this.autoLoginAttempts < MAX_LOGIN_ATTEMPTS) {
				logger.log(
					`TMS: Retrying login (attempt ${this.autoLoginAttempts + 1}/${MAX_LOGIN_ATTEMPTS})`,
				);
				this.reloadCaptcha();
			} else {
				// Max attempts reached
				logger.log("TMS: Max login attempts reached, stopping.");
				await this.appConnection.callAction(
					"showNotification",
					"Auto-login failed after maximum attempts. Please try manually.",
					"error",
				);
				await this.appConnection.callAction(
					"setError",
					this.currentAccount?.alias,
					"maxAttemptsError",
				);
				this.state = "stopped";
				this.stop();
			}
		}
	}

	// --- Helper Mechanics ---

	private setupGlobalMessageListeners() {
		onMessage("manualLoginTMS", async ({ data }) => {
			if (data.error) {
				await this.appConnection.callAction(
					"showNotification",
					`Cannot login due to an error: ${data.error}, please fix it by editing the account.`,
					"error",
				);
				return;
			}
			await this.performManualLogin(data as Account);
		});
	}

	private async performAutoLogin() {
		// If paused (credential error), don't submit - user needs to fix credentials
		if (this.state === "paused") {
			logger.log("TMS: Auto-login paused due to credential error.");
			return;
		}

		// Max attempts is now checked by toast module when error toast appears
		if (this.autoLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
			// Already at max, let toast module handle the final error
			return;
		}

		// BACKOFF DELAY
		const backoffTime = this.autoLoginAttempts * 1000 + 500;
		if (this.autoLoginAttempts > 0) {
			logger.log(
				`TMS Backoff: Waiting ${backoffTime}ms before attempt ${this.autoLoginAttempts + 1}`,
			);
			await new Promise((resolve) => setTimeout(resolve, backoffTime));
		}

		this.autoLoginAttempts++;

		if (!this.currentAccount) return;
		this.submitForm();
	}

	private submitForm() {
		const loginBtn = document.querySelector<HTMLInputElement>(
			SELECTORS.LOGIN_BTN,
		);
		if (loginBtn) {
			loginBtn.dispatchEvent(new Event("click", { bubbles: true }));
		}
		// Success is handled by wxt:locationchange → handleChangeToDashboardPage()
		// Errors should be detected via toast/error element observation (TODO)
	}

	private performManualLogin(account: Account) {
		this.currentAccount = account;
		this.fillCredentials();
		this.submitForm();
	}

	private async handleCaptchaResult(result: SolveResult) {
		// ALways solve logic (already done by getting here since solve_captcha is called before)
		// But only Auto-Login if checks pass

		if (result.type === ResultTypes.Success) {
			// CHECK AUTOFILL SETTING
			const isAutofillEnabled = this.appConnection.get().autofills.tms;
			if (!isAutofillEnabled) {
				logger.log(
					"TMS: Captcha solved but skipping auto-login (disabled using autofill toggle).",
				);
				return;
			}

			if (!this.currentAccount) {
				logger.log("TMS: Captcha solved but no current account selected.");
				return;
			}

			// CHECK ACCOUNT ERROR STATE
			// If account has an error (e.g. from previous failed attempts or other known issues),
			// we pause to prevent loops.
			if (this.currentAccount.error) {
				logger.log(
					"TMS: Auto-login skipped due to account error:",
					this.currentAccount.error,
				);
				await this.appConnection.callAction(
					"showNotification",
					`Login paused for ${this.currentAccount.alias} due to error. Please fix it in extension settings.`,
					"error",
				);
				return;
			}

			this.fillCredentials();
			await this.performAutoLogin();
		} else {
			if (this.reloadCounter < RELOAD_LIMIT) {
				this.reloadCounter++;
				this.fillCredentials();
				this.reloadCaptcha();
			}
		}
	}

	// --- Utilities ---

	private fillCredentials() {
		// IMPORTANT: Only fill if configured to do so
		const isAutofillEnabled = this.appConnection.get().autofills.tms;
		if (!isAutofillEnabled) return;

		if (!this.currentAccount) return;
		this.setInputValue(SELECTORS.USERNAME, this.currentAccount.username);
		this.setInputValue(SELECTORS.PASSWORD, this.currentAccount.password);
	}

	private setInputValue(selector: string, value: string) {
		const field = document.querySelector<HTMLInputElement>(selector);
		if (field) {
			field.value = value;
			for (const event of INPUT_EVENTS) {
				field.dispatchEvent(new Event(event, { bubbles: true }));
			}
		}
	}

	private reloadCaptcha() {
		const element = document.querySelector(SELECTORS.CAPTCHA_RELOAD);
		element?.dispatchEvent(new Event("click", { bubbles: true }));
	}

	private extractBrokerNumber(url: string): string | null {
		const match = url.match(TMS_LOGIN_URL);
		return match ? match[1] : null;
	}
}

export default defineContentScript({
	matches: [tms_watch_url],
	runAt: "document_idle",
	async main(ctx: ContentScriptContext) {
		const automation = new TMSAutomation();

		const url = window.location.href;

		if (TMS_DASHBOARD_PATTERN.test(url)) {
			await automation.handleChangeToDashboardPage();
		} else if (TMS_LOGIN_URL.test(url)) {
			// Start capturing credentials on login page
			CredentialCapture.startCapturing();
			await automation.init();
		}

		// Watch for location changes
		ctx.addEventListener(window, "wxt:locationchange", async ({ newUrl }) => {
			const urlStr = newUrl.toString();

			if (TMS_DASHBOARD_PATTERN.test(urlStr)) {
				CredentialCapture.stopCapturing();
				await automation.handleChangeToDashboardPage();
			} else if (TMS_LOGIN_URL.test(urlStr)) {
				CredentialCapture.startCapturing();
				await automation.init();
			}
		});

		ctx.addEventListener(window, "beforeunload", () => {
			CredentialCapture.stopCapturing();
			automation.stop();
		});
	},
});
