import { connect } from "crann-fork";
import { type ContentScriptContext, defineContentScript } from "#imports";
import { chrome_meroshare_url } from "@/constants/content-url";
import { onMessage } from "@/lib/messaging/window-messaging";
import { appState } from "@/lib/service/app-service";
import type { Account } from "@/types/account-types";
import { AccountType } from "@/types/account-types";
import type { WindowWithLibraries } from "@/types/content-types";
import {
	CONFIG,
	MEROSHARE_LOGIN_URL,
	MEROSHAREDASHBOARD_PATTERN,
} from "@/types/content-types";
import { logger } from "@/utils/logger";

/**
 * Constants & Selectors
 */
const SELECTORS = {
	DP_SELECT: 'select2[name="selectBranch"]',
	DP_NATIVE: ".select2-hidden-accessible",
	DP_CONTAINER: ".select2-container",
	USERNAME: CONFIG.SELECTORS.USERNAME,
	PASSWORD: CONFIG.SELECTORS.PASSWORD,
	LOGIN_BTN: CONFIG.SELECTORS.LOGIN_BUTTON,
	RENDERED: ".select2-selection__rendered",
} as const;

const ERRORS = {
	CREDENTIAL_ERROR: "Invalid password",
	CREDENTIAL_ERROR_2: "Username or password invalid",
	SERVER_ERROR: "Unable to process request at the moment",
	SOMETHING_ERROR: "Something went wrong",
};

const MAX_RETRIES = 10;
const DELAY = 500;

const INPUT_EVENTS = ["input", "change", "keyup", "keydown"] as const;
const SELECT_EVENTS = ["change", "select2:select"] as const;
const MAX_LOGIN_ATTEMPTS = 5;

/**
 * MeroshareAutomation Class
 * Reactive, class-based automation for Meroshare login.
 */
class MeroshareAutomation {
	// --- State & Flags ---
	private isActive = false;
	private isRunning = false;
	private abortController: AbortController | null = null;
	private hasPasswordError = false;

	// Connection
	private appConnection = connect(appState);

	// Data
	private accounts: Account[] = [];
	private currentAccount: Account | null = null;

	// Counters
	private autoLoginAttempts = 0;
	private retryTimer: NodeJS.Timeout | null = null;
	private lastProcessedMessage = "";

	// Observers
	private toastObserver: MutationObserver | null = null;
	private formObserver: MutationObserver | null = null; // For autosave monitoring
	private select2Observer: MutationObserver | null = null; // For Select2 change monitoring

	// Active Input Elements (to track attachments for autosave)
	private currentUsernameEl: HTMLInputElement | null = null;
	private currentPasswordEl: HTMLInputElement | null = null;
	private currentDpNativeEl: HTMLSelectElement | null = null;
	private currentDpSelect2El: HTMLElement | null = null;

	// Credential Monitoring (Manual Type)
	private monitoredCredentials = {
		username: "",
		password: "",
		broker: "",
		isUserInput: false,
	};

	private isProgrammaticInput = false;

	constructor() {
		this.accounts = this.appConnection.get().accounts ?? [];
	}

	public async init() {
		if (this.isActive) return;
		this.isActive = true;

		// 1. Listen for global messages
		this.setupGlobalMessageListeners();

		// 2. Subscribe
		this.appConnection.subscribe(
			async (state) => {
				this.accounts = state.accounts ?? [];
				await this.syncState();
			},
			["accounts", "autofills", "autoSaveNewAccount"],
		);

		// Initial Check
		await this.syncState();
	}

	private async syncState() {
		const onDashboard = MEROSHAREDASHBOARD_PATTERN.test(window.location.href);

		if (onDashboard) {
			if (this.isRunning) {
				logger.log("Meroshare: On Dashboard, stopping automation.");
				this.stop();
			}
			return;
		}

		// On Login Page
		if (window.location.href.includes("#/login")) {
			if (!this.isRunning) {
				await this.start();
			} else {
				await this.updateCurrentAccount();
			}
		}
	}

	// --- Lifecycle ---

	public async start() {
		logger.log("Meroshare Automation: Starting...");
		this.isRunning = true;
		this.abortController = new AbortController();

		await this.updateCurrentAccount();
		this.enableAutoSaveModule();
		this.enableToastObserver();

		// Check if account has error initially to set flag
		if (
			this.currentAccount?.error &&
			this.isPasswordError(this.currentAccount.error)
		) {
			this.hasPasswordError = true;
		}

		// Start the loop
		this.autoLoginAttempts = 0;
		if (this.currentAccount) {
			// Trigger first attempt immediately
			this.attemptAutoLogin();
		}
	}

	public stop() {
		this.isRunning = false;

		if (this.abortController) {
			this.abortController.abort();
			this.abortController = null;
		}
		if (this.toastObserver) {
			this.toastObserver.disconnect();
			this.toastObserver = null;
		}
		if (this.formObserver) {
			this.formObserver.disconnect();
			this.formObserver = null;
		}
		if (this.select2Observer) {
			this.select2Observer.disconnect();
			this.select2Observer = null;
		}
		if (this.retryTimer) {
			clearTimeout(this.retryTimer);
			this.retryTimer = null;
		}

		// Cleanup Refs
		this.currentUsernameEl = null;
		this.currentPasswordEl = null;
		this.currentDpNativeEl = null;
		this.currentDpSelect2El = null;
	}

	private async updateCurrentAccount() {
		const matchingAccounts = this.accounts.filter(
			(acc) => acc.type === AccountType.MEROSHARE,
		);
		const newAccount =
			matchingAccounts.find((acc) => acc.isPrimary) ||
			matchingAccounts[0] ||
			null;

		// Detect change
		const isSameAccount = newAccount?.alias === this.currentAccount?.alias;

		if (!isSameAccount) {
			this.currentAccount = newAccount;
			if (this.isRunning && this.currentAccount) {
				// Reset all counters and state on account switch
				this.autoLoginAttempts = 0;
				this.hasPasswordError = false;
				this.lastProcessedMessage = ""; // Clear toast deduplication
				this.attemptAutoLogin();
			}
		} else {
			// Same Account - Check if error cleared
			const hadError = !!this.currentAccount?.error;
			const hasError = !!newAccount?.error;

			this.currentAccount = newAccount;

			if (this.isRunning && this.currentAccount && hadError && !hasError) {
				logger.log("Meroshare: Account error cleared. Retrying login...");
				this.autoLoginAttempts = 0;
				this.hasPasswordError = false;
				this.lastProcessedMessage = ""; // Clear toast deduplication
				this.attemptAutoLogin();
			}
		}
	}

	// --- Core Auto-Login Logic ---

	private async attemptAutoLogin() {
		// 1. Connectivity / State Checks
		if (!this.isRunning || !this.currentAccount) return;

		const isAutofillEnabled = this.appConnection.get().autofills.meroshare;
		if (!isAutofillEnabled) {
			logger.log("Meroshare: Auto-login disabled by user setting.");
			return;
		}

		// 2. Identify if we are in a "Password Error" state
		//    Matches user req: "if it is password error we pause autologin... show user we are pausing"
		const isPassError =
			this.hasPasswordError ||
			(this.currentAccount.error &&
				this.isPasswordError(this.currentAccount.error));

		// 3. Fill Credentials (ALWAYS, even on error)
		//    "try to fix the error faster rather then again filling everything manually"
		const filled = await this.retryFillCredentials(this.currentAccount);

		if (!filled) {
			logger.log("Meroshare: Could not find login form elements.");
			// If we can't search form, we can't submit.
			// We will retry finding form based on backoff
			this.scheduleNextAttempt();
			return;
		}

		// 4. Handle Password Error State (Stop)
		if (isPassError) {
			logger.log("Meroshare: Pausing due to password error. Form filled.");
			// We stop, do not submit, do not schedule retry.
			this.stop();

			await this.appConnection.callAction(
				"showNotification",
				`Auto-login paused: Password error for ${this.currentAccount.alias}. Please fix manually and login.`,
				"error",
			);
			return;
		}

		// 5. Handle Max Attempts (Stop)
		if (this.autoLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
			logger.log("Meroshare: Max login attempts reached.");
			await this.appConnection.callAction(
				"showNotification",
				"Auto-login failed: too many attempts.",
				"error",
			);
			await this.appConnection.callAction(
				"setError",
				this.currentAccount.alias,
				"autoLoginError",
			);
			this.stop();
			return;
		}

		// 6. Submit (If clean state)
		logger.log(
			`Meroshare: Submitting form (Attempt ${this.autoLoginAttempts + 1}/${MAX_LOGIN_ATTEMPTS})`,
		);
		this.submitForm();

		// 7. Schedule Next Retry (Backoff)
		//    "suppose we did not recieve anything... repeat... with backoff timer"
		this.scheduleNextAttempt();
	}

	private scheduleNextAttempt() {
		this.autoLoginAttempts++;

		// Backoff logic
		const backoff = this.autoLoginAttempts * 2000 + 1000;

		logger.log(
			`Meroshare: Waiting for dashboard... (Retry scheduled in ${backoff}ms)`,
		);

		if (this.retryTimer) clearTimeout(this.retryTimer);
		this.retryTimer = setTimeout(() => {
			this.attemptAutoLogin();
		}, backoff);
	}

	private isPasswordError(errorMsg?: string): boolean {
		if (!errorMsg) return false;
		const msg = errorMsg.toLowerCase();
		return (
			msg.includes("password") ||
			msg.includes("credential") ||
			msg.includes("invalid")
		);
	}

	// --- Modules ---

	private async retryFillCredentials(account: Account): Promise<boolean> {
		// Handle empty/invalid broker value
		const brokerValue = account.broker?.toString().trim();
		if (!brokerValue || brokerValue === "0") {
			console.warn(
				"Meroshare: No valid broker value for account",
				account.alias,
			);
			await this.appConnection.callAction(
				"showNotification",
				`Cannot auto-login: No broker configured for ${account.alias}`,
				"warning",
			);
			return false;
		}

		// Try to find and fill form for a short duration
		for (let i = 0; i < MAX_RETRIES; i++) {
			const dpSuccess = await this.fillDP(brokerValue);
			if (dpSuccess) {
				this.fillInput(SELECTORS.USERNAME, account.username);
				this.fillInput(SELECTORS.PASSWORD, account.password);
				return true;
			}
			await new Promise((r) => setTimeout(r, DELAY));
		}

		// All retries exhausted - notify user
		console.warn("Meroshare: Could not set broker dropdown after retries");
		return false;
	}

	// Kept for manual usage if needed
	private async fillCredentials(account: Account) {
		if (account.broker) {
			await this.fillDP(account.broker.toString());
		}
		this.fillInput(SELECTORS.USERNAME, account.username);
		this.fillInput(SELECTORS.PASSWORD, account.password);
	}

	// --- AutoSave Monitor ---

	private enableAutoSaveModule() {
		this.checkForInputs();
		this.formObserver = new MutationObserver(() => {
			this.checkForInputs();
		});
		this.formObserver.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	private checkForInputs() {
		const uField = document.querySelector<HTMLInputElement>(SELECTORS.USERNAME);
		const pField = document.querySelector<HTMLInputElement>(SELECTORS.PASSWORD);
		const dpField = document.querySelector<HTMLSelectElement>(
			SELECTORS.DP_NATIVE,
		);
		const select2Root = document.querySelector<HTMLElement>("#selectBranch");
		const signal = this.abortController?.signal;

		if (uField && uField !== this.currentUsernameEl) {
			this.currentUsernameEl = uField;
			INPUT_EVENTS.forEach((evt) => {
				uField.addEventListener(
					evt,
					(e) => {
						if (this.isProgrammaticInput) return;
						this.monitoredCredentials.username = (
							e.target as HTMLInputElement
						).value;
						this.monitoredCredentials.isUserInput = true;
					},
					{ signal },
				);
			});
		}

		if (pField && pField !== this.currentPasswordEl) {
			this.currentPasswordEl = pField;
			INPUT_EVENTS.forEach((evt) => {
				pField.addEventListener(
					evt,
					(e) => {
						if (this.isProgrammaticInput) return;
						this.monitoredCredentials.password = (
							e.target as HTMLInputElement
						).value;
						this.monitoredCredentials.isUserInput = true;
					},
					{ signal },
				);
			});
		}

		if (dpField && dpField !== this.currentDpNativeEl) {
			this.currentDpNativeEl = dpField;
			dpField.addEventListener(
				"change",
				(e) => {
					if (this.isProgrammaticInput) return;
					this.monitoredCredentials.broker = (
						e.target as HTMLSelectElement
					).value;
					this.monitoredCredentials.isUserInput = true;
				},
				{ signal },
			);
		}

		if (select2Root && select2Root !== this.currentDpSelect2El) {
			this.currentDpSelect2El = select2Root;
			const rendered = () =>
				select2Root
					.querySelector<HTMLElement>(SELECTORS.RENDERED)
					?.textContent?.trim() ?? "";
			let lastText = rendered();

			// Cleanup previous observer if exists
			if (this.select2Observer) {
				this.select2Observer.disconnect();
			}

			this.select2Observer = new MutationObserver(() => {
				if (this.isProgrammaticInput) return;
				const current = rendered();
				if (!current || current === lastText) return;
				lastText = current;
				const match = current.match(/\((\d+)\)$/);
				this.monitoredCredentials.broker = match ? match[1] : current;
				this.monitoredCredentials.isUserInput = true;
			});

			this.select2Observer.observe(select2Root, {
				childList: true,
				subtree: true,
				characterData: true,
			});
			signal?.addEventListener("abort", () => {
				this.select2Observer?.disconnect();
				this.select2Observer = null;
			});
		}
	}

	async handleAutoSaveCredentials() {
		const { username, password, broker, isUserInput } =
			this.monitoredCredentials;
		if (
			!isUserInput ||
			!username ||
			!password ||
			!broker ||
			!this.currentAccount
		) {
			return;
		}

		try {
			logger.log("Meroshare AutoSave: Saving...");
			await this.appConnection.callAction(
				"saveAccountIfNeeded",
				AccountType.MEROSHARE,
				Number(broker),
				username,
				password,
			);
		} catch (e) {
			console.error("Auto save error", e);
		} finally {
			this.monitoredCredentials = {
				username: "",
				password: "",
				broker: "",
				isUserInput: false,
			};
		}
	}

	// --- Toast & Error Handling ---

	private enableToastObserver() {
		this.toastObserver = new MutationObserver((mutations) => {
			for (const m of mutations) {
				if (m.type === "childList" && m.addedNodes.length > 0) {
					// Check added nodes for toast class
					const added = m.addedNodes[0] as HTMLElement;
					// Some toasts are direct children, others nested
					if (
						added.classList?.contains("toast-message") ||
						added.querySelector?.(".toast-message")
					) {
						const text = added.textContent?.trim() || "";
						this.handleToastMessage(text);
					}
				}
			}
		});

		const specificContainer =
			document.querySelector("#toast-container") ||
			document.querySelector(".overlay-container");

		const target = specificContainer || document.body;
		this.toastObserver.observe(target, {
			childList: true,
			subtree: true,
		});
	}

	private handleToastMessage(text: string) {
		// Clean text: remove the close icon (×) content if captured
		const cleanText = text.replace(/[×x]/g, "").trim();

		if (!cleanText || cleanText === this.lastProcessedMessage) return;

		this.lastProcessedMessage = cleanText;
		setTimeout(() => {
			if (this.lastProcessedMessage === cleanText)
				this.lastProcessedMessage = "";
		}, 5000);

		logger.log("Meroshare Toast:", cleanText);

		const isCredError =
			cleanText.includes(ERRORS.CREDENTIAL_ERROR) ||
			cleanText.includes(ERRORS.CREDENTIAL_ERROR_2) ||
			(cleanText.toLowerCase().includes("credential") &&
				cleanText.toLowerCase().includes("error"));

		if (isCredError) {
			// Prevent duplicate handling if we already caught a fatal error in this session
			if (this.hasPasswordError) return;

			this.hasPasswordError = true;
			if (this.currentAccount) {
				this.appConnection.callAction(
					"setError",
					this.currentAccount.alias,
					"passwordError",
				);
			}

			// Stop immediately
			this.stop();

			this.appConnection.callAction(
				"showNotification",
				`Login failed: ${cleanText}. Automation paused.`,
				"error",
			);

			// Refill form for manual fix
			if (this.currentAccount) {
				this.fillCredentials(this.currentAccount);
			}
		} else {
			// Other error - just log. The automatic retry loop (setTimeout) will handle the retry.
			logger.log(
				"Non-critical error detected. Will retry automatically based on backoff timer.",
			);
		}
	}

	// --- Dom Helpers ---

	private submitForm() {
		const btn = document.querySelector<HTMLButtonElement>(SELECTORS.LOGIN_BTN);
		if (btn && !btn.disabled) {
			btn.click();
		}
	}

	async handleChangeToDashboardPage() {
		if (this.currentAccount) {
			await this.appConnection.callAction(
				"setLastLoggedIn",
				this.currentAccount.alias,
			);
		}
		this.stop();
	}

	private fillInput(selector: string, value: string) {
		const input = document.querySelector<HTMLInputElement>(selector);
		if (!input) return;

		this.isProgrammaticInput = true;
		input.value = value;

		const ng = (window as WindowWithLibraries).ng;
		if (ng) {
			const probe = ng.probe(input);
			const comp = probe?.componentInstance;
			if (comp) {
				comp.writeValue(value);
				comp.onChange(value);
			}
		}

		for (const evt of INPUT_EVENTS) {
			input.dispatchEvent(new Event(evt, { bubbles: true }));
		}
		this.isProgrammaticInput = false;
	}

	private async fillDP(dpValue: string): Promise<boolean> {
		const nativeSelect = document.querySelector<HTMLSelectElement>(
			SELECTORS.DP_NATIVE,
		);
		const container = document.querySelector(SELECTORS.DP_CONTAINER);
		const select2El = document.querySelector(SELECTORS.DP_SELECT);

		if (!nativeSelect || !container || !select2El) return false;

		const options = nativeSelect.options;
		let targetOption: HTMLOptionElement | null = null;
		for (let i = 0; i < options.length; i++) {
			if (options[i].text.includes(dpValue)) {
				targetOption = options[i];
				break;
			}
		}

		if (!targetOption) return false;

		this.isProgrammaticInput = true;
		nativeSelect.value = targetOption.value;

		const jQuery = (window as WindowWithLibraries).jQuery;
		if (jQuery) {
			const instance = jQuery(nativeSelect).data("select2");
			if (instance) {
				instance.trigger("select", {
					data: { id: targetOption.value, text: targetOption.text },
				});
			}
		}

		const rendered = container.querySelector(SELECTORS.RENDERED);
		if (rendered) {
			rendered.textContent = targetOption.text;
			rendered.setAttribute("title", targetOption.text);
		}

		fireEvents(nativeSelect, SELECT_EVENTS);

		const ng = (window as WindowWithLibraries).ng;
		if (ng) {
			const probe = ng.probe(select2El);
			const comp = probe?.componentInstance;
			if (comp) {
				comp.writeValue(targetOption.value);
				comp.onChange(targetOption.value);
			}
		}
		this.isProgrammaticInput = false;
		return true;
	}

	// --- Global Msg ---
	private setupGlobalMessageListeners() {
		onMessage("manualLoginMero", async ({ data }) => {
			if (data.error) {
				await this.appConnection.callAction(
					"showNotification",
					`Cannot login: ${data.error}`,
					"error",
				);
				return;
			}
			await this.performManualLogin(data as Account);
		});
	}

	private async performManualLogin(account: Account) {
		this.currentAccount = account;
		this.hasPasswordError = false; // Reset error on manual trigger

		await this.fillCredentials(account);
		this.submitForm();
	}
}

function fireEvents(element: HTMLElement, events: readonly string[]) {
	for (const event of events) {
		element.dispatchEvent(new Event(event, { bubbles: true }));
	}
}

export default defineContentScript({
	matches: [chrome_meroshare_url],
	runAt: "document_idle",
	async main(ctx: ContentScriptContext) {
		const automation = new MeroshareAutomation();

		const currentUrl = window.location.href;
		if (currentUrl.includes(MEROSHARE_LOGIN_URL)) {
			await automation.init();

			await automation.start();
		} else if (MEROSHAREDASHBOARD_PATTERN.test(currentUrl)) {
			automation.stop();
		}

		// Watch for location changes
		ctx.addEventListener(window, "wxt:locationchange", async ({ newUrl }) => {
			const urlStr = newUrl.toString();

			if (urlStr.includes("#/login")) {
				await automation.start();
			} else if (MEROSHAREDASHBOARD_PATTERN.test(urlStr)) {
				logger.log("Meroshare: Dashboard detected via WXT.");
				// Stop automation explicitly and cleanup
				await automation.handleChangeToDashboardPage();

				// Handle Autosave
				await automation.handleAutoSaveCredentials();
			}
		});

		ctx.addEventListener(window, "beforeunload", () => {
			automation.stop();
		});
	},
});
