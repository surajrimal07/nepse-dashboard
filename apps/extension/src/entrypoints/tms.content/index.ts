import { connect } from "crann-fork";
import { type ContentScriptContext, defineContentScript } from "#imports";
import { TMS_LOGIN_URL, tms_watch_url } from "@/constants/content-url";
import { track } from "@/lib/analytics";
import { onMessage } from "@/lib/messaging/window-messaging";
import { appState } from "@/lib/service/app-service";
import type { Account } from "@/types/account-types";
import { AccountType } from "@/types/account-types";
import { Env, EventName } from "@/types/analytics-types";
import type { SolveResult } from "@/types/content-types";
import { ResultTypes, TMS_DASHBOARD_PATTERN } from "@/types/content-types";
import { logger } from "@/utils/logger";
import { solve_captcha } from "./capcha";

/**
 * Constants & Selectors
 */
const SELECTORS = {
	CAPTCHA_RELOAD: '[aria-label="Reload captcha"]',
	CAPTCHA_IMAGE: ".form-control.captcha-image-dimension.col-10",
	USERNAME: 'input[placeholder="Client Code/ User Name"]',
	PASSWORD: 'input[placeholder="Password"]',
	LOGIN_BTN: 'input[value="Login"]',
} as const;

// Added key events to capture typing more reliably
const INPUT_EVENTS = ["input", "change", "keyup", "keydown"] as const;
const RELOAD_LIMIT = 7;
// Reverted back to 5 as per original request, though user temporarily set to 1 for testing.
// Keeping strictly to logic, I should respect the last known stable config or user intent.
// The user previously asked for 5. I will keep it 5 unless told otherwise.
const MAX_LOGIN_ATTEMPTS = 5;

/**
 * TMSAutomation Class
 * Handles reactive state management for TMS login automation.
 */
class TMSAutomation {
	// --- State & Flags ---
	private isActive = false; // Prevents double initialization
	private isRunning = false; // Tracks if modules are currently active
	private abortController: AbortController | null = null;

	// Observers
	private mainMutationObserver: MutationObserver | null = null; // Watch body for detection
	private srcMutationObserver: MutationObserver | null = null; // Watch element for updates

	// Active Elements
	private currentCaptchaEl: HTMLImageElement | null = null;

	private currentAccount: Account | null = null;
	private cachedBrokerNumber: string | null = null;
	private accounts: Account[] = [];

	private autoLoginAttempts = 0;
	private reloadCounter = 0;

	// Credential Monitoring State
	private monitoredCredentials = {
		username: "",
		password: "",
		isUserInput: false,
	};

	private isProgrammaticInput = false;

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
		if (this.isActive) return;
		this.isActive = true;

		// 1. Listen for global messages (always active)
		this.setupGlobalMessageListeners();

		// 2. Subscribe to store changes to drive logic
		this.appConnection.subscribe(
			async (state) => {
				this.accounts = state.accounts ?? [];
				await this.syncState();
			},
			["accounts", "autofills", "autoSaveNewAccount"],
		);

		// 3. Initial Sync
		await this.syncState();
	}

	/**
	 * syncState
	 * The brain of the operation. Decides whether to Start, Stop, or Update modules.
	 */
	private async syncState() {
		// We ALWAYS want to run now to assist with Captcha for manual logins.
		// Modules internally handle their own "should I do anything?" checks.
		if (!this.isRunning) {
			await this.start();
		} else {
			await this.updateCurrentAccount();
		}
	}

	// --- Lifecycle Methods ---

	public async start() {
		logger.log("TMS Automation: Starting...");
		this.isRunning = true;
		this.abortController = new AbortController();

		await this.updateCurrentAccount();

		// Enable Modules
		await this.enableAutoLoginModule(); // Just autofills, doesn't submit
		this.enableCaptchaModule(); // Solves, and triggers submit on success
		this.enableAutoSaveModule();
	}

	public stop() {
		this.isRunning = false;

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
			// Account Switched
			this.currentAccount = newAccount;
			if (this.isRunning && this.currentAccount) {
				this.autoLoginAttempts = 0;
				this.fillCredentials();
				// Optional: Trigger a fresh captcha solve if possible?
			}
		} else {
			// Same Account - Check if error was fixed
			const hadError = !!this.currentAccount?.error;
			const hasError = !!newAccount?.error;

			this.currentAccount = newAccount;

			// If error was cleared (user fixed it), retry login automatically
			if (this.isRunning && this.currentAccount && hadError && !hasError) {
				logger.log("TMS: Account error cleared. Retrying login...");
				this.autoLoginAttempts = 0;
				this.fillCredentials();
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
				if (this.isRunning) this.checkForCaptchaElement();
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
				if (!this.isRunning) return;
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
	 * Module: Auto Save
	 * We attach listeners regardless, but check setting inside the callback.
	 */
	private enableAutoSaveModule() {
		const usernameField = document.querySelector(
			SELECTORS.USERNAME,
		) as HTMLInputElement;
		const passwordField = document.querySelector(
			SELECTORS.PASSWORD,
		) as HTMLInputElement;
		const loginButton = document.querySelector(
			SELECTORS.LOGIN_BTN,
		) as HTMLInputElement;

		if (!usernameField || !passwordField || !loginButton) return;

		// Avoid re-attaching if already there?
		// Since we use AbortController and recreate it on start(), safe to just add.
		const signal = this.abortController?.signal;

		usernameField.addEventListener(
			"input",
			(e) => {
				if (!this.appConnection.get().autoSaveNewAccount) return;
				// If we programmatically set it, ignore tracking
				if (this.isProgrammaticInput) return;

				this.monitoredCredentials.username = (
					e.target as HTMLInputElement
				).value;
				// IMPORTANT: Mark as user input so we know to save later
				this.monitoredCredentials.isUserInput = true;
			},
			{ signal },
		);

		passwordField.addEventListener(
			"input",
			(e) => {
				if (!this.appConnection.get().autoSaveNewAccount) return;
				if (this.isProgrammaticInput) return;

				this.monitoredCredentials.password = (
					e.target as HTMLInputElement
				).value;
				this.monitoredCredentials.isUserInput = true;
			},
			{ signal },
		);

		loginButton.addEventListener(
			"click",
			() => {
				// Checks happen inside listener so it's fresh
				if (!this.appConnection.get().autoSaveNewAccount) return;

				// If user manually typed something, we watch for successful login
				if (
					this.monitoredCredentials.isUserInput &&
					this.monitoredCredentials.username &&
					this.monitoredCredentials.password
				) {
					logger.log("TMS: Manual login detected, watching for success...");
					this.watchForLoginSuccessAndSave();
				}
			},
			{ signal },
		);
	}

	/**
	 * Waits for success URL pattern after a manual login click.
	 * Detached from the main event loop to poll independent of other logic.
	 */
	private async watchForLoginSuccessAndSave() {
		const startTime = Date.now();
		const TIMEOUT = 10000; // 10 seconds to login

		const check = async () => {
			if (Date.now() - startTime > TIMEOUT) {
				logger.log("TMS: Manual login watch timed out.");
				return;
			}

			// If URL matches dashboard
			if (TMS_DASHBOARD_PATTERN.test(window.location.href)) {
				logger.log("TMS: Manual login successful! Saving...");
				await this.handleAutoSaveCredentials();
				return;
			}

			requestAnimationFrame(check);
		};
		requestAnimationFrame(check);
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
		if (this.autoLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
			await this.appConnection.callAction(
				"showNotification",
				"Auto-login failed likely due to too many attempts. please check your Id and password.",
				"error",
			);
			await this.appConnection.callAction(
				"setError",
				this.currentAccount?.alias,
				"autoLoginError",
			);
			// Global autofill NOT disabled. Notification clearly states failure.
			return;
		}

		// BACKOFF DELAY
		// Attempt 0: 0 + 500 = 500ms
		// Attempt 1: 1000 + 500 = 1500ms
		// Attempt 2: 2000 + 500 = 2500ms
		const backoffTime = this.autoLoginAttempts * 1000 + 500;
		if (this.autoLoginAttempts > 0) {
			logger.log(
				`TMS Backoff: Waiting ${backoffTime}ms before attempt ${this.autoLoginAttempts + 1}`,
			);
			await new Promise((resolve) => setTimeout(resolve, backoffTime));
		}

		this.autoLoginAttempts++;

		try {
			if (!this.currentAccount) return;
			await this.submitForm(this.currentAccount.alias);
		} catch (error) {
			track({
				context: Env.CONTENT,
				eventName: EventName.NAASAX_CONTENT_EXCEPTION,
				params: { error: String(error), name: "tms-auto-login" },
			});
		}
	}

	private async submitForm(alias: string) {
		const loginBtn = document.querySelector<HTMLInputElement>(
			SELECTORS.LOGIN_BTN,
		);
		if (loginBtn) {
			loginBtn.dispatchEvent(new Event("click", { bubbles: true }));
		}

		await new Promise((res) => setTimeout(res, 2000));

		const newUrl = window.location.href;
		if (TMS_DASHBOARD_PATTERN.test(newUrl)) {
			// SUCCESS - Reset all counters
			this.autoLoginAttempts = 0;
			this.reloadCounter = 0; // Reset captcha reload counter on success
			await this.appConnection.callAction(
				"setLastLoggedIn",
				alias,
				newUrl,
				AccountType.TMS,
			);

			this.stop();
			return true;
		} else {
			// FAILED
			track({
				context: Env.CONTENT,
				eventName: EventName.AUTO_LOGIN_FAILED_TMS,
			});
			return false;
		}
	}

	private async performManualLogin(account: Account) {
		this.currentAccount = account;
		this.fillCredentials();
		await this.submitForm(account.alias);
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

	public async handleAutoSaveCredentials() {
		if (
			!this.monitoredCredentials.isUserInput ||
			!this.monitoredCredentials.username ||
			!this.monitoredCredentials.password
		) {
			return;
		}

		if (!this.cachedBrokerNumber) return;

		try {
			await this.appConnection.callAction(
				"saveAccountIfNeeded",
				AccountType.TMS,
				Number(this.cachedBrokerNumber),
				this.monitoredCredentials.username,
				this.monitoredCredentials.password,
			);
		} catch (error) {
			console.error("Auto save failed", error);
		} finally {
			this.resetMonitoredCredentials();
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
			this.isProgrammaticInput = true;
			field.value = value;
			for (const event of INPUT_EVENTS) {
				field.dispatchEvent(new Event(event, { bubbles: true }));
			}
			this.isProgrammaticInput = false;
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

	private resetMonitoredCredentials() {
		this.monitoredCredentials = {
			username: "",
			password: "",
			isUserInput: false,
		};
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
			await automation.init();

			await automation.start();
		}

		// Watch for location changes
		ctx.addEventListener(window, "wxt:locationchange", async ({ newUrl }) => {
			const urlStr = newUrl.toString();

			if (TMS_DASHBOARD_PATTERN.test(urlStr)) {
				await automation.handleChangeToDashboardPage();
			} else if (TMS_LOGIN_URL.test(urlStr)) {
				await automation.init(); // Ensure init before start
				await automation.start();
			}
		});

		ctx.addEventListener(window, "beforeunload", () => {
			automation.stop();
		});
	},
});
