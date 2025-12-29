import { connect } from "crann-fork";
import { MatchPattern } from "#imports";
import {
	chrome_naasax_url,
	naasa_dashboard_url,
} from "@/constants/content-url";
import { onMessage } from "@/lib/messaging/window-messaging";
import { appState } from "@/lib/service/app-service";
import type { Account } from "@/types/account-types";
import { AccountType } from "@/types/account-types";

// Patterns
const naasaAuth = new MatchPattern(chrome_naasax_url);
const naasaDashboard = new MatchPattern(naasa_dashboard_url);

/**
 * Constants & Selectors
 */
const ELEMENT_IDS = {
	USERNAME: "username",
	PASSWORD: "login-password",
	LOGIN_BTN: "kc-login",
	ERROR_SPAN: "input-error",
	LOGIN_FORM: "kc-form-login",
} as const;

const ERRORS = {
	INVALID_CREDENTIALS: "Invalid username or password.",
	ACTION_EXPIRED: "Action expired. Please continue with login now.",
} as const;

const MAX_LOGIN_ATTEMPTS = 2;
const LOCAL_STORAGE_KEY = "naasax_temp_data";
const LOCAL_STORAGE_ATTEMPTS_KEY = "naasax_login_attempts";

interface NaasaxTempData {
	username?: string | null;
	password?: string | null;
	alias?: string | null;
}

/**
 * NaasaXAutomation Class
 * Handles auto-login and auto-save for NaasaX (Non-SPA, reloads on submit).
 */
class NaasaXAutomation {
	// --- State ---
	private isActive = false;
	private isRunning = false;
	private abortController: AbortController | null = null;

	// Connection
	private appConnection = connect(appState);

	// Data
	private accounts: Account[] = [];
	private currentAccount: Account | null = null;

	// Counters & Flags
	private autoLoginAttempts = 0;
	private isProgrammaticInput = false;
	private hasHandledCriticalError = false; // Prevent duplicate error handling

	// Observers
	private errorObserver: MutationObserver | null = null;

	// Credential Monitoring
	// REMOVED monitoredCredentials as we now read directly from DOM on click

	constructor() {
		// Initial sync might be empty if storage isn't ready
		this.accounts = this.appConnection.get().accounts ?? [];
	}

	public async init() {
		if (this.isActive) return;
		this.isActive = true;

		// 1. Listen for global messages
		this.setupGlobalMessageListeners();

		// 2. Subscribe (Handles ongoing updates AND initial load if constructor missed it)
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

	// --- Lifecycle ---

	private async syncState() {
		const url = new URL(window.location.href);

		// Dashboard Logic
		if (naasaDashboard.includes(url)) {
			logger.log("NaasaX: on Dashboard.");
			if (this.isRunning) this.stop();
			await this.handleDashboard();
			return;
		}

		// Login Page Logic
		if (naasaAuth.includes(url)) {
			// If not running, start
			if (!this.isRunning) {
				await this.start();
			} else {
				// If already running, just update current account
				// This handles the case where accounts load LATER after start()
				await this.updateCurrentAccount();
			}
		}
	}

	public async start() {
		logger.log("NaasaX Automation: Starting...");
		this.isRunning = true;
		this.abortController = new AbortController();

		// Cleanup potential old resources just in case
		this.disconnectFollowers();

		// 1. Determine target account
		await this.updateCurrentAccount();

		if (!this.currentAccount) {
			logger.log("NaasaX Automation: No NaasaX account found yet.");
			// We DO NOT return here excessively. We stay "Running" so that when
			// the subscription fires with data, updateCurrentAccount() will trigger logic.
			// however, we can't proceed to steps 2/3 safely without an account.
			// But we CAN enable manual save monitoring.
		}

		// 2. Check for existing errors on page (Non-SPA specific)
		const hasCriticalError = await this.checkForExistingErrors();
		if (hasCriticalError) {
			logger.log("NaasaX: Critical error on page load. Pausing automation.");
			return;
		}

		// 3. Enable modules
		this.enableAutoSaveModule(); // Monitor inputs for manual login

		if (this.currentAccount) {
			await this.attemptAutoLogin(); // Try to login if applicable
		}
	}

	public stop() {
		logger.log("NaasaX Automation: Stopping...");
		this.isRunning = false;

		if (this.abortController) {
			this.abortController.abort();
			this.abortController = null;
		}
		this.disconnectFollowers();
	}

	private disconnectFollowers() {
		if (this.errorObserver) {
			this.errorObserver.disconnect();
			this.errorObserver = null;
		}
	}

	private async updateCurrentAccount() {
		const oldAlias = this.currentAccount?.alias;

		const matchingAccounts = this.accounts.filter(
			(acc) => acc.type === AccountType.NAASAX,
		);
		this.currentAccount =
			matchingAccounts.find((acc) => acc.isPrimary) ||
			matchingAccounts[0] ||
			null;

		// REACTIVITY CHECK
		// If we are currently running, and the account has changed (or appeared from null),
		// we should trigger the auto-login attempt again.
		if (this.isRunning && this.currentAccount) {
			if (this.currentAccount.alias !== oldAlias) {
				logger.log(
					`NaasaX: Account updated to ${this.currentAccount.alias}. Retrying login.`,
				);
				// Reset attempts on account switch to allow fresh start
				this.clearAttempts();
				this.hasHandledCriticalError = false;
				await this.attemptAutoLogin();
			}
		}
	}

	// --- LocalStorage Helpers ---
	private getLocalStorageData(): NaasaxTempData {
		try {
			const item = localStorage.getItem(LOCAL_STORAGE_KEY);
			return item ? JSON.parse(item) : {};
		} catch (e) {
			console.error("NaasaX: Error parsing local storage, clearing corrupted data", e);
			// Clear corrupted data to prevent future errors
			localStorage.removeItem(LOCAL_STORAGE_KEY);
			return {};
		}
	}

	private setLocalStorageData(data: NaasaxTempData) {
		try {
			// Merge with existing
			const existing = this.getLocalStorageData();
			const merged = { ...existing, ...data };
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
		} catch (e) {
			console.error("NaasaX: Error setting local storage", e);
		}
	}

	private clearLocalStorageData() {
		localStorage.removeItem(LOCAL_STORAGE_KEY);
	}

	// --- Separate AutoLoginAttempts Storage ---
	private getAttempts(): number {
		try {
			const item = localStorage.getItem(LOCAL_STORAGE_ATTEMPTS_KEY);
			return item ? parseInt(item, 10) : 0;
		} catch (e) {
			return 0;
		}
	}

	private setAttempts(attempts: number) {
		try {
			localStorage.setItem(LOCAL_STORAGE_ATTEMPTS_KEY, attempts.toString());
		} catch (e) {
			console.error("NaasaX: Error setting attempts", e);
		}
	}

	private clearAttempts() {
		localStorage.removeItem(LOCAL_STORAGE_ATTEMPTS_KEY);
	}

	// --- Auto Login Logic ---

	private async attemptAutoLogin() {
		if (!this.isRunning) return;
		if (!this.currentAccount) return;

		logger.log(
			`NaasaX: Attempting auto-login for ${this.currentAccount.alias}...`,
		);

		// Check User Settings
		const isAutofillEnabled = this.appConnection.get().autofills.naasax;
		if (!isAutofillEnabled) {
			logger.log("NaasaX: Auto-login disabled by user.");
			return;
		}

		// Look for form - Wait for it!
		const usernameField = await this.waitForElement(ELEMENT_IDS.USERNAME);

		if (!usernameField) {
			logger.log("NaasaX: Login form not found after waiting (timeout).");
			return; // Exit if form never appears
		}

		// FILL CREDENTIALS (ALWAYS)
		this.fillCredentials(this.currentAccount);

		// Check Account Health AFTER filling
		if (this.currentAccount.error) {
			logger.log("NaasaX: Account has error. Form filled but submit paused.");
			await this.appConnection.callAction(
				"showNotification",
				`Auto-login paused: ${this.currentAccount.error}. Credentials filled.`,
				"info",
			);
			return; // STOP HERE
		}

		// SETUP ERROR MONITORING immediately before action
		this.setupErrorMonitoring();

		// RETRIEVE PERSISTED ATTEMPTS FROM LOCAL STORAGE
		this.autoLoginAttempts = this.getAttempts();
		logger.log(
			`NaasaX: Current auto-login attempts from LS: ${this.autoLoginAttempts}`,
		);

		// SUBMIT
		// We use a slight delay and a "Temp Data" trick because page reloads
		if (this.autoLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
			logger.log("NaasaX: Max attempts reached.");
			await this.appConnection.callAction(
				"showNotification",
				"Auto-login stopped: too many attempts.",
				"warning",
			);
			// Disable autofill to prevent loops
			await this.appConnection.callAction(
				"setAutofill",
				AccountType.NAASAX,
				false,
			);
			await this.appConnection.callAction(
				"setError",
				this.currentAccount.alias,
				"passwordError",
			);
			// DO NOT CLEAR TEMP DATA HERE - We might be midway through a redirect
			// and we need to preserve 'alias' for the dashboard success notification.
			// The data will be cleared in handleDashboard() or manually via new login.
			return;
		}

		this.autoLoginAttempts++;
		await this.submitForm(
			this.currentAccount.alias,
			true,
			this.autoLoginAttempts,
		);
	}

	private fillCredentials(account: Account) {
		this.fillInput(ELEMENT_IDS.USERNAME, account.username);
		this.fillInput(ELEMENT_IDS.PASSWORD, account.password);
	}

	private fillInput(id: string, value: string) {
		const el = document.getElementById(id) as HTMLInputElement;
		if (!el) return;

		this.isProgrammaticInput = true;
		el.value = value;
		el.dispatchEvent(new Event("input", { bubbles: true }));
		el.dispatchEvent(new Event("change", { bubbles: true }));
		this.isProgrammaticInput = false;
	}

	private async submitForm(
		aliasOrUser: string,
		isAutoLogin: boolean,
		attempts?: number,
	) {
		const btn = document.getElementById(
			ELEMENT_IDS.LOGIN_BTN,
		) as HTMLButtonElement;
		if (!btn || btn.disabled) return;

		// PERSIST INTENT: Save a temp record in LOCAL STORAGE so we know who we were trying to log in as
		// when the page reloads and hits the dashboard.
		if (isAutoLogin) {
			this.setLocalStorageData({
				alias: aliasOrUser,
			});
			this.setAttempts(attempts || 0);
		}

		btn.click();
	}

	private waitForElement(
		id: string,
		timeout = 5000,
	): Promise<HTMLElement | null> {
		return new Promise((resolve) => {
			if (document.getElementById(id)) {
				return resolve(document.getElementById(id) as HTMLElement);
			}

			const observer = new MutationObserver(() => {
				if (document.getElementById(id)) {
					resolve(document.getElementById(id) as HTMLElement);
					observer.disconnect();
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});

			setTimeout(() => {
				observer.disconnect();
				resolve(null);
			}, timeout);
		});
	}

	// --- Modules ---

	private enableAutoSaveModule() {
		const uField = document.getElementById(
			ELEMENT_IDS.USERNAME,
		) as HTMLInputElement;
		const pField = document.getElementById(
			ELEMENT_IDS.PASSWORD,
		) as HTMLInputElement;
		const btn = document.getElementById(ELEMENT_IDS.LOGIN_BTN);

		if (!uField || !pField || !btn) return;

		const signal = this.abortController?.signal;

		// Monitor manual input changes and update localStorage
		// This allows us to track user's manual edits to credentials
		uField.addEventListener(
			"input",
			(e) => {
				if (this.isProgrammaticInput) return;
				const value = (e.target as HTMLInputElement).value;
				this.setLocalStorageData({ username: value });
			},
			{ signal },
		);

		pField.addEventListener(
			"input",
			(e) => {
				if (this.isProgrammaticInput) return;
				const value = (e.target as HTMLInputElement).value;
				this.setLocalStorageData({ password: value });
			},
			{ signal },
		);

		btn.addEventListener(
			"click",
			async () => {
				const username = uField.value;
				const password = pField.value;

				if (username && password) {
					logger.log(
						"NaasaX: Login detected (manual/resume). Saving temp data...",
					);

					// 1. Check if trying to login with an account known to have errors
					const accountWithError = this.accounts.find(
						(acc) =>
							acc.username === username &&
							acc.type === AccountType.NAASAX &&
							acc.error,
					);
					if (accountWithError) {
						await this.appConnection.callAction(
							"showNotification",
							`Wait! Account ${accountWithError.alias} has error: ${accountWithError.error}`,
							"info",
						);
					}

					// 2. Prepare Data
					const dataToSave: NaasaxTempData = {
						username,
						password,
					};

					// 3. Infer Alias if possible (Current Account or found in list)
					// This ensures 'Logged in as...' works even on manual resume
					if (
						this.currentAccount &&
						this.currentAccount.username === username
					) {
						dataToSave.alias = this.currentAccount.alias;
					} else {
						// Optional: Try to find alias in other accounts
						const knownAcc = this.accounts.find(
							(acc) =>
								acc.username === username && acc.type === AccountType.NAASAX,
						);
						if (knownAcc) {
							dataToSave.alias = knownAcc.alias;
						}
					}

					// 4. Save to localStorage
					this.setLocalStorageData(dataToSave);
				}
			},
			{ signal },
		);
	}

	private setupErrorMonitoring() {
		if (this.errorObserver) this.errorObserver.disconnect();

		this.errorObserver = new MutationObserver((mutations) => {
			for (const m of mutations) {
				if (m.type === "childList" && m.addedNodes.length > 0) {
					this.checkForErrorMutations();
				}
			}
		});

		const target =
			document.getElementById(ELEMENT_IDS.LOGIN_FORM) || document.body;
		this.errorObserver.observe(target, { childList: true, subtree: true });
	}

	private checkForErrorMutations() {
		const errorSpan = document.getElementById(ELEMENT_IDS.ERROR_SPAN);
		const alertTitle = document.querySelector(
			".pf-c-alert__title.kc-feedback-text",
		);

		const errorText =
			errorSpan?.textContent?.trim() || alertTitle?.textContent?.trim();
		if (!errorText) return;

		// Handle Errors - prevent duplicate handling
		if (this.hasHandledCriticalError) return;

		if (errorText.includes(ERRORS.INVALID_CREDENTIALS)) {
			this.hasHandledCriticalError = true;
			logger.log("NaasaX: Invalid Credentials detected.");
			if (this.currentAccount) {
				this.appConnection.callAction(
					"setError",
					this.currentAccount.alias,
					"passwordError",
				);
				this.stop();
				this.appConnection.callAction(
					"showNotification",
					`Login failed for ${this.currentAccount.alias}: Invalid Password.`,
					"error",
				);
			}
			this.errorObserver?.disconnect(); // Stop watching to prevent loops
		} else if (errorText.includes(ERRORS.ACTION_EXPIRED)) {
			// Reload page to fix "Action Expired"
			logger.log("NaasaX: Action Expired. Reloading...");
			location.reload();
		}
	}

	private async checkForExistingErrors(): Promise<boolean> {
		const errorSpan = document.getElementById(ELEMENT_IDS.ERROR_SPAN);
		const errorText = errorSpan?.textContent?.trim();

		if (errorText === ERRORS.INVALID_CREDENTIALS) {
			if (this.currentAccount) {
				await this.appConnection.callAction(
					"setError",
					this.currentAccount.alias,
					"passwordError",
				);
				await this.appConnection.callAction(
					"showNotification",
					"Invalid credentials. Auto-login paused.",
					"error",
				);
				return true;
			}
		} else if (errorText === ERRORS.ACTION_EXPIRED) {
			location.reload();
			return true;
		}
		return false;
	}

	// --- Dashboard / Post-Login ---

	public async handleDashboard() {
		// Always clear autoLoginAttempts when landing on dashboard (success!)
		this.clearAttempts();
		this.autoLoginAttempts = 0;

		// 1. Check Temp Data from LOCAL STORAGE
		const tempData = this.getLocalStorageData();

		logger.log("NaasaX: Temp Data (LS)", tempData);

		// If nothing in LS, return
		if (!tempData || (!tempData.alias && !tempData.username)) return;

		const { alias, username, password } = tempData;

		logger.log("NaasaX: Alias", alias);

		// Case A: Auto-Login Success - Show "Logged in as" and send lastlogin to backend
		if (alias) {
			await this.appConnection.callAction("setLastLoggedIn", alias);
			await this.appConnection.callAction(
				"showNotification",
				`Logged in as ${alias}`,
				"success",
			);
		}

		// Case B: Manual Login Auto-Save
		if (username && password) {
			await this.appConnection.callAction(
				"saveAccountIfNeeded",
				AccountType.NAASAX,
				null, // No broker for NaasaX
				username,
				password,
			);
		}

		// Cleanup Temp Data after sending to backend
		this.clearLocalStorageData();
	}

	// --- Global Msg ---

	private setupGlobalMessageListeners() {
		onMessage("manualLoginNaasax", async ({ data }) => {
			if (data.error) {
				await this.appConnection.callAction(
					"showNotification",
					`Cannot login: ${data.error}`,
					"error",
				);
				return;
			}
			// Manual login requested - reset error state
			this.hasHandledCriticalError = false;
			this.currentAccount = data as Account;
			// Fill & Submit immediately
			this.fillCredentials(this.currentAccount);
			setTimeout(() => {
				// Pass isAutoLogin=false for manual login to avoid persisting auto-login data
				this.submitForm(this.currentAccount!.alias, false);
			}, 500);
		});
	}
}

export default defineContentScript({
	matches: [chrome_naasax_url, naasa_dashboard_url],
	runAt: "document_idle",
	async main(ctx) {
		const automation = new NaasaXAutomation();

		const url = window.location.href;

		if (naasaAuth.includes(new URL(url))) {
			await automation.init();

			await automation.start();
		} else if (naasaDashboard.includes(new URL(url))) {
			logger.log("NaasaX: Dashboard detected.");
			await automation.handleDashboard();
		}

		ctx.addEventListener(window, "wxt:locationchange", async ({ newUrl }) => {
			const url = newUrl.toString();

			// Always ensure init is done first
			await automation.init();

			if (naasaAuth.includes(new URL(url))) {
				await automation.start();
			} else if (naasaDashboard.includes(new URL(url))) {
				logger.log("NaasaX: Dashboard detected.");
				await automation.handleDashboard();
			}
		});

		ctx.addEventListener(window, "beforeunload", () => {
			automation.stop();
		});
	},
});
