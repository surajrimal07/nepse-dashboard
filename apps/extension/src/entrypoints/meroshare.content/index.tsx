import { connect } from "crann-fork";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import {
	type ContentScriptContext,
	createShadowRootUi,
	defineContentScript,
} from "#imports";
import { ContentErrorBoundary } from "@/components/content-error-boundary";
import { ContentSuspense } from "@/components/content-suspense";
import {
	chrome_meroshare_url,
	MEROSHARE_ORIGIN,
} from "@/constants/content-url";
import { onMessage } from "@/lib/messaging/window-messaging";
import { appState } from "@/lib/service/app-service";
import type { Account } from "@/types/account-types";
import { AccountType } from "@/types/account-types";
import type { WindowWithLibraries } from "@/types/content-types";
import { CONFIG } from "@/types/content-types";
import { logger } from "@/utils/logger";
import { syncMeroshareData } from "./api";

import "../../../../../packages/ui/src/styles/globals.css";
import "sonner/dist/styles.css";
import { track } from "@/lib/analytics";
import { Env, EventName } from "@/types/analytics-types";
import PortfolioWidgets from "./app";

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

// =============== SHADOW DOM UI MANAGEMENT ===============

let mountedUi: Awaited<ReturnType<typeof createShadowRootUi>> | null = null;
let mountedElements: { root: Root; wrapper: HTMLElement } | null = null;

const ANCHOR_SELECTOR = ".page-title-wrapper";
const MAX_WAIT_TIME = 5000; // 5 seconds max wait

/**
 * Wait for an element to appear in the DOM using MutationObserver
 * Observes subtree since the anchor element is nested within Angular's router-outlet
 */
async function waitForElement(
	selector: string,
	timeout = MAX_WAIT_TIME,
): Promise<Element | null> {
	// First check if already exists
	const existing = document.querySelector(selector);
	if (existing) return existing;

	return new Promise((resolve) => {
		let observer: MutationObserver | null = null;
		let timeoutId: ReturnType<typeof setTimeout> | null = null;

		const cleanup = () => {
			observer?.disconnect();
			if (timeoutId) clearTimeout(timeoutId);
		};

		observer = new MutationObserver(() => {
			const element = document.querySelector(selector);
			if (element) {
				cleanup();
				resolve(element);
			}
		});

		// Observe subtree since .page-title-wrapper is nested within Angular's router-outlet
		// This is necessary for SPA page transitions
		observer.observe(document.body, { childList: true, subtree: true });

		// Timeout fallback
		timeoutId = setTimeout(() => {
			cleanup();
			resolve(null);
		}, timeout);
	});
}

async function mountUI(ctx: ContentScriptContext) {
	if (mountedUi) return;

	// Wait for anchor element to exist before mounting
	const anchorElement = await waitForElement(ANCHOR_SELECTOR);
	if (!anchorElement) {
		logger.log("Meroshare: Anchor element not found, skipping UI mount");
		return; // Silently fail - element never appeared
	}

	try {
		mountedUi = await createShadowRootUi(ctx, {
			name: "nepse-meroshare-widgets",
			position: "inline",
			anchor: ANCHOR_SELECTOR,
			append: "after",
			inheritStyles: false,
			onMount: (container) => {
				const wrapper = document.createElement("div");
				wrapper.className = "nepse-meroshare-widgets";
				wrapper.style.cssText = `
					padding: 0;
					margin: 8px 0;
					font-family: inherit;
				`;
				container.appendChild(wrapper);

				const root = createRoot(wrapper);
				root.render(
					<ContentErrorBoundary>
						<ContentSuspense>
							<PortfolioWidgets />
						</ContentSuspense>
					</ContentErrorBoundary>,
				);

				mountedElements = { root, wrapper };
				return { root, wrapper };
			},
			onRemove: (elements) => {
				elements?.root.unmount();
				elements?.wrapper.remove();
			},
		});

		mountedUi.mount();
	} catch (error) {
		logger.warn("Meroshare: Failed to mount UI", error);
		mountedUi = null;
		mountedElements = null;

		void track({
			context: Env.CONTENT,
			eventName: EventName.UNABLE_TO_MOUNT_UI,
			params: { error: error as string, location: "meroshare-content-app" },
		});
	}
}

async function unmountUI() {
	if (!mountedUi || !mountedElements) return;

	const { wrapper, root } = mountedElements;

	root.unmount();
	wrapper.remove();

	mountedUi.remove();
	mountedUi = null;
	mountedElements = null;
}

// =============== MEROSHARE AUTOMATION CLASS ===============

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
	private formObserver: MutationObserver | null = null;
	private select2Observer: MutationObserver | null = null;

	// Active Input Elements
	private currentUsernameEl: HTMLInputElement | null = null;
	private currentPasswordEl: HTMLInputElement | null = null;
	private currentDpNativeEl: HTMLSelectElement | null = null;
	private currentDpSelect2El: HTMLElement | null = null;

	// Credential Monitoring
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

		this.setupGlobalMessageListeners();

		this.appConnection.subscribe(
			async (state) => {
				this.accounts = state.accounts ?? [];
				await this.syncState();
			},
			["accounts", "autofills", "autoSaveNewAccount"],
		);

		await this.syncState();
	}

	private async syncState() {
		if (isMeroshareDashboard(window.location.href)) {
			if (this.isRunning) {
				logger.log("Meroshare: On Dashboard, stopping automation.");
				this.stop();
			}
			return;
		}

		if (window.location.href.includes("#/login")) {
			if (!this.isRunning) {
				await this.start();
			} else {
				await this.updateCurrentAccount();
			}
		}
	}

	public async start() {
		logger.log("Meroshare Automation: Starting...");
		this.isRunning = true;
		this.abortController = new AbortController();

		await this.updateCurrentAccount();
		this.enableAutoSaveModule();
		this.enableToastObserver();

		if (
			this.currentAccount?.error &&
			this.isPasswordError(this.currentAccount.error)
		) {
			this.hasPasswordError = true;
		}

		this.autoLoginAttempts = 0;
		if (this.currentAccount) {
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

		const isSameAccount = newAccount?.alias === this.currentAccount?.alias;

		if (!isSameAccount) {
			this.currentAccount = newAccount;
			if (this.isRunning && this.currentAccount) {
				this.autoLoginAttempts = 0;
				this.hasPasswordError = false;
				this.lastProcessedMessage = "";
				this.attemptAutoLogin();
			}
		} else {
			const hadError = !!this.currentAccount?.error;
			const hasError = !!newAccount?.error;

			this.currentAccount = newAccount;

			if (this.isRunning && this.currentAccount && hadError && !hasError) {
				logger.log("Meroshare: Account error cleared. Retrying login...");
				this.autoLoginAttempts = 0;
				this.hasPasswordError = false;
				this.lastProcessedMessage = "";
				this.attemptAutoLogin();
			}
		}
	}

	private async attemptAutoLogin() {
		if (!this.isRunning || !this.currentAccount) return;

		const isAutofillEnabled = this.appConnection.get().autofills.meroshare;
		if (!isAutofillEnabled) {
			logger.log("Meroshare: Auto-login disabled by user setting.");
			return;
		}

		const isPassError =
			this.hasPasswordError ||
			(this.currentAccount.error &&
				this.isPasswordError(this.currentAccount.error));

		const filled = await this.retryFillCredentials(this.currentAccount);

		if (!filled) {
			logger.log("Meroshare: Could not find login form elements.");
			this.scheduleNextAttempt();
			return;
		}

		if (isPassError) {
			logger.log("Meroshare: Pausing due to password error. Form filled.");
			this.stop();

			await this.appConnection.callAction(
				"showNotification",
				`Auto-login paused: Password error for ${this.currentAccount.alias}. Please fix manually and login.`,
				"error",
			);
			return;
		}

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

		this.submitForm();

		this.scheduleNextAttempt();
	}

	private scheduleNextAttempt() {
		this.autoLoginAttempts++;
		const backoff = this.autoLoginAttempts * 2000 + 1000;

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

	private async retryFillCredentials(account: Account): Promise<boolean> {
		const brokerValue = account.broker?.toString().trim();
		if (!brokerValue || brokerValue === "0") {
			logger.warn(
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

		for (let i = 0; i < MAX_RETRIES; i++) {
			const dpSuccess = await this.fillDP(brokerValue);
			if (dpSuccess) {
				this.fillInput(SELECTORS.USERNAME, account.username);
				this.fillInput(SELECTORS.PASSWORD, account.password);
				return true;
			}
			await new Promise((r) => setTimeout(r, DELAY));
		}

		logger.warn("Meroshare: Could not set broker dropdown after retries");
		return false;
	}

	private async fillCredentials(account: Account) {
		if (account.broker) {
			await this.fillDP(account.broker.toString());
		}
		this.fillInput(SELECTORS.USERNAME, account.username);
		this.fillInput(SELECTORS.PASSWORD, account.password);
	}

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
			logger.error("Auto save error", e);

			void track({
				context: Env.CONTENT,
				eventName: EventName.AUTOSAVE_ERROR,
				params: { error: e as string, location: "meroshare-content-app" },
			});
		} finally {
			this.monitoredCredentials = {
				username: "",
				password: "",
				broker: "",
				isUserInput: false,
			};
		}
	}

	private enableToastObserver() {
		this.toastObserver = new MutationObserver((mutations) => {
			for (const m of mutations) {
				if (m.type === "childList" && m.addedNodes.length > 0) {
					const added = m.addedNodes[0] as HTMLElement;
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
		const cleanText = text.replace(/[×x]/g, "").trim();

		if (!cleanText || cleanText === this.lastProcessedMessage) return;

		this.lastProcessedMessage = cleanText;
		setTimeout(() => {
			if (this.lastProcessedMessage === cleanText)
				this.lastProcessedMessage = "";
		}, 5000);

		const isCredError =
			cleanText.includes(ERRORS.CREDENTIAL_ERROR) ||
			cleanText.includes(ERRORS.CREDENTIAL_ERROR_2) ||
			(cleanText.toLowerCase().includes("credential") &&
				cleanText.toLowerCase().includes("error"));

		if (isCredError) {
			if (this.hasPasswordError) return;

			this.hasPasswordError = true;
			if (this.currentAccount) {
				this.appConnection.callAction(
					"setError",
					this.currentAccount.alias,
					"passwordError",
				);
			}

			this.stop();

			this.appConnection.callAction(
				"showNotification",
				`Login failed: ${cleanText}. Automation paused.`,
				"error",
			);

			if (this.currentAccount) {
				this.fillCredentials(this.currentAccount);
			}
		} else {
			logger.log(
				"Non-critical error detected. Will retry automatically based on backoff timer.",
			);
		}
	}

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
		this.hasPasswordError = false;

		await this.fillCredentials(account);
		this.submitForm();
	}
}

function fireEvents(element: HTMLElement, events: readonly string[]) {
	for (const event of events) {
		element.dispatchEvent(new Event(event, { bubbles: true }));
	}
}

// =============== URL HELPERS ===============

export function isMeroshareLogin(url: string): boolean {
	try {
		const u = new URL(url);
		return u.origin === MEROSHARE_ORIGIN && u.hash === "#/login";
	} catch {
		return false;
	}
}

export function isMeroshareDashboard(url: string): boolean {
	try {
		const u = new URL(url);
		return (
			u.origin === MEROSHARE_ORIGIN &&
			u.hash.startsWith("#/") &&
			u.hash !== "#/login"
		);
	} catch {
		return false;
	}
}

export function isMerosharePortfolio(url: string): boolean {
	try {
		const u = new URL(url);
		return u.origin === MEROSHARE_ORIGIN && u.hash === "#/portfolio";
	} catch {
		return false;
	}
}

// =============== MAIN CONTENT SCRIPT ===============

export default defineContentScript({
	matches: [chrome_meroshare_url],
	cssInjectionMode: "ui",
	runAt: "document_idle",

	async main(ctx: ContentScriptContext) {
		const automation = new MeroshareAutomation();
		let initialized = false;
		let lastUrl = window.location.href;

		const handleUrl = async (url: string) => {
			// Login page - run automation
			if (isMeroshareLogin(url)) {
				await unmountUI();

				if (!initialized) {
					await automation.init();
					initialized = true;
				}
				await automation.start();
				return;
			}

			// Dashboard pages
			if (isMeroshareDashboard(url)) {
				automation.stop();
				await Promise.all([
					automation.handleChangeToDashboardPage(),
					automation.handleAutoSaveCredentials(),
				]);

				// Auto-sync client details, WACC, and transactions on dashboard
				syncMeroshareData();
				// createShadowRootUi handles waiting for anchor element internally
				if (isMerosharePortfolio(url)) {
					await mountUI(ctx);
				} else {
					await unmountUI();
				}

				return;
			}
		};

		// Handle initial load
		await handleUrl(lastUrl);

		// Handle SPA navigation (hash changes)
		ctx.addEventListener(window, "wxt:locationchange", async ({ newUrl }) => {
			const newUrlStr = newUrl.toString();
			const wasOnLogin = isMeroshareLogin(lastUrl);
			const goingToLogin = isMeroshareLogin(newUrlStr);

			// Always handle portfolio mount/unmount regardless of where we came from
			if (isMerosharePortfolio(newUrlStr)) {
				await mountUI(ctx);
			} else if (
				isMerosharePortfolio(lastUrl) &&
				!isMerosharePortfolio(newUrlStr)
			) {
				// Unmount only when leaving portfolio page
				await unmountUI();
			}

			// Run handleUrl when:
			// 1. Coming FROM login page (successful login → dashboard)
			// 2. Going TO login page (user logout → need to restart automation)
			if (wasOnLogin || goingToLogin) {
				await handleUrl(newUrlStr);
			}

			// Update lastUrl for next navigation
			lastUrl = newUrlStr;
		});

		// Cleanup
		ctx.addEventListener(window, "beforeunload", () => {
			automation.stop();
		});
	},
});
