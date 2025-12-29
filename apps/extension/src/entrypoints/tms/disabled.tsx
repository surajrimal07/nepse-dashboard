// import type { ContentScriptContext } from "#imports";
// import { chrome_tms_dashboard_url } from "@/constants/content-url";
// import { onMessage, sendMessage } from "@/lib/messaging/extension-messaging";
// import type { LiveDataFromTMS } from "@/types/consume-type";

// /**
//  * DOM Selectors for market data extraction
//  * Using more specific selectors for targeted observation
//  */
// const SELECTORS = {
// 	// Container that holds all the market data - we observe THIS specifically
// 	HEADER_CONTAINER: 'div[class*="header__indices"]',
// 	HEADER_AMOUNT: 'div[class*="header__indices--amount"]',
// 	NEPSE_INDEX: 'span[class*="header__indices--change"]',
// 	CHANGE_PERCENT: 'span[class*="header__indices--changeperc"]',
// 	TURNOVER: 'h6[class*="header__indices--changeperc"]:nth-of-type(1)',
// 	VOLUME: 'h6[class*="header__indices--changeperc"]:nth-of-type(2)',
// } as const;

// /**
//  * Configuration constants - tuned for efficiency
//  */
// const CONFIG = {
// 	/** Debounce delay for DOM mutations when page is visible */
// 	DEBOUNCE_DELAY_MS: 350,
// 	/** Longer debounce when page is hidden (backgrounded tab) */
// 	DEBOUNCE_DELAY_HIDDEN_MS: 2000,
// 	/** Maximum retry attempts for finding the target container */
// 	MAX_CONTAINER_RETRIES: 10,
// 	/** Delay between container search retries */
// 	CONTAINER_RETRY_DELAY_MS: 500,
// 	/** Minimum interval between sends to prevent flooding */
// 	MIN_SEND_INTERVAL_MS: 300,
// } as const;

// /**
//  * Validates that the extracted trade data contains meaningful values.
//  * Note: During pre-open hours, change and percentageChange CAN be 0, which is valid.
//  * We only require a valid close price and non-zero turnover/volume to indicate market activity.
//  */
// function isValidTradeData(values: LiveDataFromTMS): boolean {
// 	const numericClose = values.close;

// 	// Close price must be a valid positive number
// 	if (Number.isNaN(numericClose) || numericClose <= 0) {
// 		return false;
// 	}

// 	// At least one of turnover or volume should indicate activity
// 	// During market hours, these should be non-zero
// 	const hasTradingActivity =
// 		values.totalTradedShared !== 0 || values.turnover !== "0";

// 	return hasTradingActivity;
// }

// /**
//  * Fast equality check using a hash-like comparison
//  * More efficient than field-by-field comparison for frequent calls
//  */
// function areValuesEqual(
// 	a: LiveDataFromTMS | null,
// 	b: LiveDataFromTMS | null,
// ): boolean {
// 	if (a === b) return true; // Same reference or both null
// 	if (a === null || b === null) return false;

// 	// Compare numeric fields first (faster)
// 	if (a.close !== b.close) return false;
// 	if (a.change !== b.change) return false;
// 	if (a.percentageChange !== b.percentageChange) return false;

// 	// totalTradedShared is number, turnover is string
// 	return a.turnover === b.turnover && a.totalTradedShared === b.totalTradedShared;
// }

// /**
//  * Safely parses numeric text, removing commas and handling errors.
//  * Optimized to avoid regex when possible.
//  */
// function parseNumericText(text: string | null | undefined): number {
// 	if (!text) return 0;
// 	const cleaned = text.includes(",") ? text.replace(/,/g, "") : text;
// 	const num = Number(cleaned.trim());
// 	return Number.isNaN(num) ? 0 : num;
// }

// /**
//  * Parses and cleans string values, removing commas.
//  */
// function parseString(text: string | null | undefined): string {
// 	if (!text) return "0";
// 	const trimmed = text.trim();
// 	if (!trimmed) return "0";
// 	return trimmed.includes(",") ? trimmed.replace(/,/g, "") : trimmed;
// }

// /**
//  * Parses change text like "(10.5/0.75%)" into point and percent values.
//  * Optimized with early returns and minimal string operations.
//  */
// function parseChangeText(changeText: string): {
// 	pointChange: number;
// 	percentChange: number;
// } {
// 	const DEFAULT = { pointChange: 0, percentChange: 0 };

// 	if (!changeText) return DEFAULT;

// 	// Find the slash separator first - avoid full regex if not needed
// 	const slashIndex = changeText.indexOf("/");
// 	if (slashIndex === -1) return DEFAULT;

// 	try {
// 		// Extract point change (before slash)
// 		const pointPart = changeText.slice(0, slashIndex).replace(/[()]/g, "");
// 		const pointChange = Number.parseFloat(pointPart) || 0;

// 		// Extract percent change (after slash, before %)
// 		const percentPart = changeText
// 			.slice(slashIndex + 1)
// 			.replace(/[()%]/g, "");
// 		const percentChange = Number.parseFloat(percentPart) || 0;

// 		return { pointChange, percentChange };
// 	} catch {
// 		return DEFAULT;
// 	}
// }

// /**
//  * Schedules a callback to run during idle time or fallback to setTimeout.
//  * Uses requestIdleCallback when available for non-blocking execution.
//  */
// function scheduleIdleCallback(
// 	callback: () => void,
// 	timeout = 100,
// ): number | ReturnType<typeof setTimeout> {
// 	if ("requestIdleCallback" in window) {
// 		return window.requestIdleCallback(callback, { timeout });
// 	}
// 	return setTimeout(callback, 0);
// }

// /**
//  * Cancels a scheduled idle callback.
//  */
// function cancelIdleCallback(
// 	id: number | ReturnType<typeof setTimeout>,
// ): void {
// 	if ("cancelIdleCallback" in window && typeof id === "number") {
// 		window.cancelIdleCallback(id);
// 	} else {
// 		clearTimeout(id as ReturnType<typeof setTimeout>);
// 	}
// }

// /**
//  * MarketDataExtractor - A production-ready, highly optimized class for extracting
//  * live market data from TMS.
//  *
//  * Features:
//  * - Singleton pattern to prevent multiple instances
//  * - Explicit start/stop lifecycle control
//  * - Debounced updates with adaptive timing based on page visibility
//  * - Targeted DOM observation (specific container, not entire body)
//  * - Page Visibility API integration to pause when hidden
//  * - Bounded send queue to prevent stack overflow
//  * - Memory-safe cleanup with proper resource disposal
//  * - Robust error handling with graceful degradation
//  */
// class MarketDataExtractor {
// 	private static instance: MarketDataExtractor | null = null;

// 	private readonly ctx: ContentScriptContext;
// 	private observer: MutationObserver | null = null;
// 	private containerSearchTimer: ReturnType<typeof setTimeout> | null = null;
// 	private containerRetryCount = 0;
// 	private previousValues: LiveDataFromTMS | null = null;
// 	private debounceTimer: ReturnType<typeof setTimeout> | null = null;
// 	private idleCallbackId: number | ReturnType<typeof setTimeout> | null = null;
// 	private lastSendTime = 0;
// 	private isRunning = false;
// 	private isConnected = true;
// 	private isPendingSend = false;
// 	private isPageVisible = true;
// 	private hasPendingUpdate = false;
// 	private targetContainer: Element | null = null;

// 	// Bound methods for event listeners (prevents creating new functions)
// 	private readonly boundVisibilityHandler: () => void;
// 	private readonly boundMutationHandler: () => void;

// 	private constructor(ctx: ContentScriptContext) {
// 		this.ctx = ctx;

// 		// Pre-bind methods to avoid creating new function references
// 		this.boundVisibilityHandler = this.handleVisibilityChange.bind(this);
// 		this.boundMutationHandler = this.handleMutationDebounced.bind(this);

// 		this.setupContextInvalidationHandler();
// 		this.setupVisibilityListener();
// 	}

// 	/**
// 	 * Gets or creates the singleton instance
// 	 */
// 	public static getInstance(ctx: ContentScriptContext): MarketDataExtractor {
// 		if (!MarketDataExtractor.instance) {
// 			MarketDataExtractor.instance = new MarketDataExtractor(ctx);
// 		}
// 		return MarketDataExtractor.instance;
// 	}

// 	/**
// 	 * Destroys the singleton instance and releases all resources
// 	 */
// 	public static destroyInstance(): void {
// 		if (MarketDataExtractor.instance) {
// 			MarketDataExtractor.instance.fullCleanup();
// 			MarketDataExtractor.instance = null;
// 		}
// 	}

// 	/**
// 	 * Starts the market data extraction monitoring.
// 	 * Idempotent - safe to call multiple times.
// 	 */
// 	public start(): void {
// 		if (this.isRunning) {
// 			return; // Silent return - already running
// 		}

// 		if (!this.isConnected) {
// 			console.warn(
// 				"[MarketDataExtractor] Cannot start - context is invalidated",
// 			);
// 			return;
// 		}

// 		this.isRunning = true;
// 		this.startMonitoring();
// 	}

// 	/**
// 	 * Stops the market data extraction monitoring.
// 	 * Idempotent - safe to call multiple times.
// 	 */
// 	public stop(): void {
// 		if (!this.isRunning) {
// 			return; // Silent return - already stopped
// 		}

// 		this.cleanup();
// 		this.isRunning = false;
// 	}

// 	/**
// 	 * Returns whether the extractor is currently running
// 	 */
// 	public isActive(): boolean {
// 		return this.isRunning;
// 	}

// 	/**
// 	 * Sets up handler for when the content script context is invalidated
// 	 */
// 	private setupContextInvalidationHandler(): void {
// 		this.ctx.onInvalidated(() => {
// 			this.isConnected = false;
// 			this.fullCleanup();
// 		});
// 	}

// 	/**
// 	 * Sets up Page Visibility API listener to optimize resource usage
// 	 */
// 	private setupVisibilityListener(): void {
// 		this.isPageVisible = document.visibilityState === "visible";

// 		// Use ctx.addEventListener for automatic cleanup
// 		this.ctx.addEventListener(
// 			document,
// 			"visibilitychange",
// 			this.boundVisibilityHandler,
// 		);
// 	}

// 	/**
// 	 * Handles page visibility changes to optimize resource usage
// 	 */
// 	private handleVisibilityChange(): void {
// 		const wasVisible = this.isPageVisible;
// 		this.isPageVisible = document.visibilityState === "visible";

// 		// If becoming visible and we have pending updates, process them
// 		if (!wasVisible && this.isPageVisible && this.hasPendingUpdate) {
// 			this.hasPendingUpdate = false;
// 			this.processExtraction();
// 		}
// 	}

// 	/**
// 	 * Starts the monitoring process by finding the target container
// 	 */
// 	private startMonitoring(): void {
// 		if (!this.isConnected || !this.isRunning) return;

// 		// Wait for document.body
// 		if (!document.body) {
// 			this.waitForBody();
// 			return;
// 		}

// 		this.findAndObserveContainer();
// 	}

// 	/**
// 	 * Waits for document.body to be available using requestAnimationFrame
// 	 */
// 	private waitForBody(): void {
// 		const checkBody = () => {
// 			if (!this.isConnected || !this.isRunning) return;

// 			if (document.body) {
// 				this.findAndObserveContainer();
// 			} else {
// 				requestAnimationFrame(checkBody);
// 			}
// 		};
// 		requestAnimationFrame(checkBody);
// 	}

// 	/**
// 	 * Finds the specific market data container and attaches observer.
// 	 * Falls back to document.body if container isn't found after retries.
// 	 */
// 	private findAndObserveContainer(): void {
// 		if (!this.isConnected || !this.isRunning) return;

// 		// Try to find the specific container
// 		this.targetContainer = document.querySelector(SELECTORS.HEADER_CONTAINER);

// 		if (this.targetContainer) {
// 			this.containerRetryCount = 0;
// 			this.attachObserver(this.targetContainer);
// 			return;
// 		}

// 		// Container not found - may still be loading
// 		this.containerRetryCount++;

// 		if (this.containerRetryCount < CONFIG.MAX_CONTAINER_RETRIES) {
// 			this.containerSearchTimer = setTimeout(() => {
// 				this.containerSearchTimer = null;
// 				this.findAndObserveContainer();
// 			}, CONFIG.CONTAINER_RETRY_DELAY_MS);
// 		} else {
// 			// Fallback to body observation (less efficient but works)
// 			console.warn(
// 				"[MarketDataExtractor] Container not found, falling back to body observation",
// 			);
// 			this.attachObserver(document.body);
// 		}
// 	}

// 	/**
// 	 * Attaches the MutationObserver to the specified target element
// 	 */
// 	private attachObserver(target: Element): void {
// 		if (this.observer || !this.isConnected || !this.isRunning) return;

// 		try {
// 			// Do initial extraction immediately
// 			this.processExtraction();

// 			this.observer = new MutationObserver(this.boundMutationHandler);

// 			// Optimized observation options
// 			this.observer.observe(target, {
// 				childList: true,
// 				subtree: true,
// 				characterData: true,
// 				// Don't observe attributes - we only care about text content
// 				attributes: false,
// 			});
// 		} catch (error) {
// 			console.error("[MarketDataExtractor] Error attaching observer:", error);
// 			this.cleanup();
// 		}
// 	}

// 	/**
// 	 * Debounced mutation handler - adapts debounce time based on visibility
// 	 */
// 	private handleMutationDebounced(): void {
// 		if (!this.isConnected || !this.isRunning) {
// 			this.cleanup();
// 			return;
// 		}

// 		// Clear existing timer
// 		if (this.debounceTimer) {
// 			clearTimeout(this.debounceTimer);
// 			this.debounceTimer = null;
// 		}

// 		// Use longer debounce when page is hidden
// 		const delay = this.isPageVisible
// 			? CONFIG.DEBOUNCE_DELAY_MS
// 			: CONFIG.DEBOUNCE_DELAY_HIDDEN_MS;

// 		this.debounceTimer = setTimeout(() => {
// 			this.debounceTimer = null;

// 			if (!this.isPageVisible) {
// 				// Mark for processing when visible again
// 				this.hasPendingUpdate = true;
// 				return;
// 			}

// 			this.processExtraction();
// 		}, delay);
// 	}

// 	/**
// 	 * Main extraction processing - runs during idle time when possible
// 	 */
// 	private processExtraction(): void {
// 		if (!this.isConnected || !this.isRunning) return;

// 		// Cancel any pending idle callback
// 		if (this.idleCallbackId !== null) {
// 			cancelIdleCallback(this.idleCallbackId);
// 			this.idleCallbackId = null;
// 		}

// 		// Schedule extraction during idle time
// 		this.idleCallbackId = scheduleIdleCallback(() => {
// 			this.idleCallbackId = null;
// 			this.extractAndSend();
// 		}, 50);
// 	}

// 	/**
// 	 * Extracts market values and sends if changed
// 	 */
// 	private extractAndSend(): void {
// 		const values = this.extractMarketValues();

// 		if (!values) return;

// 		// Quick equality check
// 		if (areValuesEqual(values, this.previousValues)) {
// 			return;
// 		}

// 		// Rate limiting - prevent flooding
// 		const now = Date.now();
// 		if (now - this.lastSendTime < CONFIG.MIN_SEND_INTERVAL_MS) {
// 			// Schedule a delayed send instead of dropping
// 			if (this.debounceTimer) {
// 				clearTimeout(this.debounceTimer);
// 			}
// 			this.debounceTimer = setTimeout(() => {
// 				this.debounceTimer = null;
// 				this.sendUpdate(values);
// 			}, CONFIG.MIN_SEND_INTERVAL_MS - (now - this.lastSendTime));
// 			return;
// 		}

// 		this.sendUpdate(values);
// 	}

// 	/**
// 	 * Extracts market values from the DOM.
// 	 * Optimized with early returns and minimal DOM queries.
// 	 */
// 	private extractMarketValues(): LiveDataFromTMS | null {
// 		try {
// 			const headerAmount = document.querySelector(SELECTORS.HEADER_AMOUNT);
// 			if (!headerAmount) return null;

// 			const nepseIndexElement = headerAmount.querySelector(
// 				SELECTORS.NEPSE_INDEX,
// 			);
// 			if (!nepseIndexElement) return null;

// 			const changeElement = headerAmount.querySelector(
// 				SELECTORS.CHANGE_PERCENT,
// 			);
// 			const turnoverElement = document.querySelector(SELECTORS.TURNOVER);
// 			const volumeElement = document.querySelector(SELECTORS.VOLUME);

// 			// Extract raw text values - use textContent directly
// 			const nepseIndexText = nepseIndexElement.textContent?.trim() ?? "";
// 			const changeText = changeElement?.textContent?.trim() ?? "";

// 			// Parse turnover/volume with label removal
// 			const turnoverRaw = turnoverElement?.textContent ?? "";
// 			const volumeRaw = volumeElement?.textContent ?? "";

// 			// Remove labels efficiently
// 			const turnoverText = turnoverRaw.includes("Turnover:")
// 				? turnoverRaw.replace("Turnover:", "")
// 				: turnoverRaw;
// 			const volumeText = volumeRaw.includes("Volume:")
// 				? volumeRaw.replace("Volume:", "")
// 				: volumeRaw;

// 			// Parse values
// 			const { pointChange, percentChange } = parseChangeText(changeText);

// 			const values: LiveDataFromTMS = {
// 				close: parseNumericText(nepseIndexText),
// 				change: pointChange,
// 				percentageChange: percentChange,
// 				turnover: parseString(turnoverText),
// 				totalTradedShared: parseNumericText(volumeText),
// 			};

// 			// Validate before returning
// 			if (!isValidTradeData(values)) {
// 				return null;
// 			}

// 			return values;
// 		} catch (error) {
// 			console.error("[MarketDataExtractor] Error extracting values:", error);
// 			return null;
// 		}
// 	}

// 	/**
// 	 * Sends updated values to the background script.
// 	 * Non-blocking with proper error handling.
// 	 */
// 	private sendUpdate(values: LiveDataFromTMS): void {
// 		// Prevent concurrent sends - just update the latest values
// 		if (this.isPendingSend) {
// 			this.previousValues = values; // Store for comparison after current send
// 			return;
// 		}

// 		this.isPendingSend = true;
// 		this.lastSendTime = Date.now();

// 		try {
// 			// Fire and forget - sendMessage is synchronous in its initiation
// 			sendMessage("sendExtractionData", { extractedData: values });

// 			// Update previous values on successful send initiation
// 			this.previousValues = values;
// 		} catch (error) {
// 			// Check for context invalidation
// 			if (
// 				error instanceof Error &&
// 				(error.message.includes("Extension context invalidated") ||
// 					error.message.includes("Could not establish connection"))
// 			) {
// 				this.isConnected = false;
// 				this.fullCleanup();
// 				return;
// 			}

// 			console.error("[MarketDataExtractor] Error sending update:", error);
// 		} finally {
// 			this.isPendingSend = false;
// 		}
// 	}

// 	/**
// 	 * Cleans up monitoring resources (can be restarted)
// 	 */
// 	private cleanup(): void {
// 		if (this.observer) {
// 			this.observer.disconnect();
// 			this.observer = null;
// 		}

// 		if (this.debounceTimer) {
// 			clearTimeout(this.debounceTimer);
// 			this.debounceTimer = null;
// 		}

// 		if (this.containerSearchTimer) {
// 			clearTimeout(this.containerSearchTimer);
// 			this.containerSearchTimer = null;
// 		}

// 		if (this.idleCallbackId !== null) {
// 			cancelIdleCallback(this.idleCallbackId);
// 			this.idleCallbackId = null;
// 		}

// 		this.targetContainer = null;
// 		this.containerRetryCount = 0;
// 		this.previousValues = null;
// 		this.isPendingSend = false;
// 		this.hasPendingUpdate = false;
// 		this.isRunning = false;
// 	}

// 	/**
// 	 * Full cleanup including visibility listener (for instance destruction)
// 	 */
// 	private fullCleanup(): void {
// 		this.cleanup();
// 		// Note: ctx.addEventListener automatically cleans up on context invalidation
// 	}
// }

// /**
//  * Content script entry point
//  *
//  * Lifecycle:
//  * 1. Script loads and waits for message from background
//  * 2. Background sends "shouldExtract" check, responds with start/stop
//  * 3. Extraction only runs when explicitly enabled by backend
//  * 4. Automatically cleans up on page unload or context invalidation
//  *
//  * Efficiency features:
//  * - Targeted DOM observation (specific container, not entire body)
//  * - Page Visibility API - pauses when tab is hidden
//  * - Adaptive debouncing based on visibility state
//  * - requestIdleCallback for non-blocking extraction
//  * - Rate limiting to prevent message flooding
//  */
// export default defineContentScript({
// 	matches: [chrome_tms_dashboard_url],
// 	runAt: "document_idle",
// 	main(ctx: ContentScriptContext) {
// 		const extractor = MarketDataExtractor.getInstance(ctx);

// 		console.log("content script loaded");

// 		// Register message listeners FIRST, before any async operations
// 		onMessage("startExtraction", () => {
// 			extractor.start();
// 		});

// 		onMessage("stopExtraction", () => {
// 			extractor.stop();
// 		});

// 		// Handle page unload - cleanup everything
// 		ctx.addEventListener(window, "beforeunload", () => {
// 			MarketDataExtractor.destroyInstance();
// 		});

// 		// NOW ask background if we should extract
// 		// This ensures listeners are ready before the response arrives
// 		sendMessage("shouldExtract").catch(() => {
// 			// Background not ready yet - that's fine, it will send startExtraction when ready
// 		});
// 	},
// });
