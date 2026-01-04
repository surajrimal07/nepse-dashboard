/** biome-ignore-all lint/suspicious/noExplicitAny: <iknow> */

import { generateSummary } from "@nepse-dashboard/ai";
import type { aiProvidersType } from "@nepse-dashboard/ai/types";
import { AI_CODES } from "@nepse-dashboard/ai/types";
import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import type {
	Doc,
	Id,
} from "@nepse-dashboard/convex/convex/_generated/dataModel";
import { createConfig, Persistence } from "crann-fork";
import type { BrowserLocation } from "porter-source-fork";
import { browser } from "#imports";
import { URLS } from "@/constants/app-urls";
import { getConvexClient } from "@/entrypoints/background";
import { getUser } from "@/lib/storage/user-storage";
import type {
	Account,
	accountType,
	ErrorTypes,
	NaasaxTempData,
} from "@/types/account-types";
import { AccountType } from "@/types/account-types";
import type { AISettings, LLMConfig } from "@/types/ai-types";
import { Env, EventName } from "@/types/analytics-types";
import { ConnectionState } from "@/types/connection-type";
import { EventToCount } from "@/types/increment-type";
import type { IndexKeys } from "@/types/indexes-type";
import { nepseIndexes } from "@/types/indexes-type";
import type { StackError } from "@/types/misc-types";
import type { newsDatatype, ParsedDocument } from "@/types/news-types";
import type { NotificationVariant } from "@/types/notification-types";
import type { modeType } from "@/types/search-type";
import { MODES } from "@/types/search-type";
import type { timeType } from "@/types/sidepanel-type";
import type { Config } from "@/types/user-types";
import { buildChartUrl } from "@/utils/built-chart-url";
import { generateChat } from "../actions/generate-chat";
import { generateSuggestions } from "../actions/generate-suggestions";
import { takeScreenshot } from "../actions/take-screenshot";
import { checkConfig } from "../actions/test-key";
import { Increment, Track, TrackPage } from "../analytics/analytics";
import { sendMessage } from "../messaging/extension-messaging";
import { handleNotification } from "../notification/handle-notification";
import { addAccount, deleteAccount, makePrimary } from "./helpers";
import { LOGIN_CONFIG } from "./login-this-account";

export const appState = createConfig({
	stockScrollingPopup: {
		default: true as boolean,
		persist: Persistence.Local,
	},
	showTime: {
		default: {
			enabled: true,
			type: "currentTime",
		} as timeType,
		persist: Persistence.Local,
	},

	aiSettings: {
		//new
		// make this set of <providers aiSettings>, providers means openai, cohere etc
		default: {
			model: null,
			hasKeys: false,
			provider: null as null | aiProvidersType,
			apiKey: null,
		} as AISettings,
		persist: Persistence.Local,
	},
	aiConfig: {
		//old
		default: {} as LLMConfig,
		persist: Persistence.Local,
	},

	notification: {
		default: true as boolean,
		persist: Persistence.Local,
	},

	stockScrollingInSidepanel: {
		default: true as boolean,
		persist: Persistence.Local,
	},

	pin: {
		default: true as boolean,
		persist: Persistence.Local,
	},
	companiesList: {
		default: [] as Doc<"company">[],
		persist: Persistence.Local,
	},

	tmsUrl: {
		default: null as string | null,
		persist: Persistence.Local,
	},

	chartConfig: {
		default: {
			customUrl: undefined as string | undefined,
			chartSite: "default",
		},
		persist: Persistence.Local,
	},

	searchMode: {
		default: "chart" as modeType,
		persist: Persistence.Local,
	},

	aiMode: {
		default: false,
		persist: Persistence.Local,
	},

	marketOpen: {
		default: false,
		persist: Persistence.Local,
	},

	// ===== SOCKET CONFIG STATE =====
	subscribeConfig: {
		default: {
			indexCharts: [nepseIndexes[10]] as IndexKeys[],
			stockCharts: [] as string[],
			marketDepth: [] as string[],
		} as Config,
		persist: Persistence.Local,
	},

	// ===== CONTENT STATE =====

	autofills: {
		default: {
			[AccountType.NAASAX]: true,
			[AccountType.MEROSHARE]: true,
			[AccountType.TMS]: true,
		} as Record<accountType, boolean>,
		persist: Persistence.Local,
	},

	autoSaveNewAccount: {
		default: true as boolean,
		persist: Persistence.Local,
	},

	syncPortfolio: {
		default: true as boolean,
		persist: Persistence.Local,
	},

	brokers: {
		default: {} as Doc<"brokers"> | null,
		persist: Persistence.Local,
	},
	dp: {
		default: {} as Doc<"dp"> | null,
		persist: Persistence.Local,
	},

	isAddingAccount: {
		default: false as boolean,
		persist: Persistence.None,
	},
	editingAccount: {
		default: null as string | null,
		persist: Persistence.Local,
	},

	// ===== ACCOUNT STATE =====
	accounts: {
		default: [] as Account[],
		persist: Persistence.Local,
	},

	// ===== LATENCY STATE =====
	userLatency: {
		default: {
			lastPing: 0,
			latency: 0,
			message: "No internet connection.",
			isConnected: ConnectionState.NO_CONNECTION as ConnectionState,
		},
	},

	toggleNextSearchMode: {
		handler: async (
			_state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
		) => {
			const currentMode = _state.searchMode;
			const currentIndex = MODES.indexOf(currentMode);
			const nextMode = MODES[(currentIndex + 1) % MODES.length];
			await setState({ searchMode: nextMode });
		},
	},

	updateTIme: {
		handler: async (
			_state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			timeSetting: timeType,
		) => {
			await setState({ showTime: timeSetting });

			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.TIME_SETTING_UPDATED,
				params: {
					enabled: timeSetting.enabled,
					type: timeSetting.type,
				},
			});

			return { success: true, message: "Time setting updated successfully" };
		},
	},

	setAISettings: {
		handler: async (
			_state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			settings: AISettings,
		) => {
			await setState({ aiSettings: settings });
			return { success: true, message: "AI settings updated successfully" };
		},
		validate: (settings: AISettings) => {
			if (typeof settings !== "object")
				throw new Error("Settings must be an object");
		},
	},

	getSuggestedQuestions: {
		handler: async (
			_state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			data: { url: string; content: ParsedDocument | null },
		) => {
			const user = await getUser();
			if (!user) {
				return "UNAUTHORIZED";
			}

			const convex = getConvexClient();

			const cache = await convex.query(api.webSuggestions.getSuggestion, {
				url: data.url,
			});

			if (cache && cache.length > 2) {
				void Increment({
					property: EventToCount.SUGGESTED_QUESTIONS_CACHE_HIT,
					value: 1,
				});

				return cache;
			}

			void Increment({
				property: EventToCount.SUGGESTED_QUESTIONS_CACHE_MISS,
				value: 1,
			});

			const result = await generateSuggestions(data.url, data.content);

			return result || null;
		},
	},
	searchChat: {
		handler: async (
			_state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			data: { url: string; messages: string; chatid?: string },
		) => {
			const user = await getUser();
			if (!user) {
				return "UNAUTHORIZED";
			}

			try {
				const result = await generateChat(data.url, data.messages, data.chatid);

				void Increment({
					property: EventToCount.CHAT_QUERIES_MADE,
					value: 1,
				});

				return result;
			} catch (e) {
				void Track({
					context: Env.BACKGROUND,
					eventName: EventName.CHAT_QUERY_EXCEPTION,
					params: {
						error: e instanceof Error ? e.message : String(e),
					},
				});

				return { message: "Error generating chat response" };
			}
		},
	},
	checkConfig: {
		// make a llm call to see if the api key, model and provider are valid
		handler: async (
			_state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			data: { model: string; provider: aiProvidersType; key: string },
		) => {
			try {
				const result = await checkConfig(data.model, data.provider, data.key);

				void Increment({
					property: EventToCount.CHECK_CONFIG,
					value: 1,
				});

				return result;
			} catch (e) {
				void Track({
					context: Env.BACKGROUND,
					eventName: EventName.CHAT_QUERY_EXCEPTION,
					params: {
						error: e instanceof Error ? e.message : String(e),
					},
				});

				return { message: "Error checking config" };
			}
		},
	},
	// ===== UI SETTINGS ACTIONS =====

	setNotification: {
		handler: async (
			_state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			enabled: boolean,
		) => {
			await setState({ notification: enabled });
			void Track({
				context: Env.BACKGROUND,
				eventName: enabled
					? EventName.NOTIFICATION_ENABLED
					: EventName.NOTIFICATION_DISABLED,
			});

			return {
				success: true,
				message: "Notification setting updated successfully",
			};
		},
		validate: (enabled: boolean) => {
			if (typeof enabled !== "boolean")
				throw new Error("Notification must be a boolean");
		},
	},

	setStockScrollingPopup: {
		handler: async (
			_state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			enabled: boolean,
		) => {
			await setState({ stockScrollingPopup: enabled });

			void Track({
				context: Env.BACKGROUND,
				eventName: enabled
					? EventName.STOCK_SCROLLING_ENABLED
					: EventName.STOCK_SCROLLING_DISABLED,
			});

			return {
				success: true,
				message: "Stock scrolling popup setting updated successfully",
			};
		},
		validate: (enabled: boolean) => {
			if (typeof enabled !== "boolean")
				throw new Error("Stock scrolling popup must be a boolean");
		},
	},

	setStockScrollingInSidepanel: {
		handler: async (
			_state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			enabled: boolean,
		) => {
			await setState({ stockScrollingInSidepanel: enabled });

			void Track({
				context: Env.BACKGROUND,
				eventName: enabled
					? EventName.STOCK_SCROLLING_ENABLED_SIDEPANEL
					: EventName.STOCK_SCROLLING_DISABLED_SIDEPANEL,
			});

			return {
				success: true,
				message: "Stock scrolling sidepanel setting updated successfully",
			};
		},
		validate: (enabled: boolean) => {
			if (typeof enabled !== "boolean")
				throw new Error("Stock scrolling sidepanel must be a boolean");
		},
	},

	setPin: {
		handler: async (
			_state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			enabled: boolean,
		) => {
			await setState({ pin: enabled });
			return { success: true, message: "Pin setting updated successfully" };
		},
		validate: (enabled: boolean) => {
			if (typeof enabled !== "boolean")
				throw new Error("Pin setting must be a boolean");
		},
	},

	setTmsUrl: {
		handler: async (
			_state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			url: string | null,
		) => {
			await setState({ tmsUrl: url });

			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.TMS_URL_UPDATED,
				params: { url: url ?? "null" },
			});

			return { success: true, message: "TMS URL set successfully" };
		},
	},

	// ===== EXTERNAL ACTIONS (MIGRATED FROM ACTION-REPO) =====
	handlePrivacyPolicy: {
		handler: async (
			_state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
		) => {
			try {
				await browser.tabs.create({ url: URLS.privacy_url });

				void TrackPage({
					context: Env.BACKGROUND,
					path: "/privacy-policy",
					title: "Privacy Policy",
				});

				return {
					success: true,
					message: "Privacy policy opened successfully.",
				};
			} catch {
				return { success: false, message: "Failed to open privacy policy." };
			}
		},
	},

	handleJoinTelegram: {
		handler: async (
			_state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
		) => {
			try {
				await browser.tabs.create({ url: URLS.telegram_url, active: true });

				void TrackPage({
					context: Env.BACKGROUND,
					path: "/join-telegram",
					title: "Join Telegram",
				});

				return { success: true, message: "Telegram opened successfully." };
			} catch {
				return { success: false, message: "Failed to open Telegram." };
			}
		},
	},
	handleGithub: {
		handler: async (
			_state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
		) => {
			try {
				await browser.tabs.create({ url: URLS.github_url });

				void TrackPage({
					context: Env.BACKGROUND,
					path: "/github-repository",
					title: "GitHub Repository",
				});

				return {
					success: true,
					message: "GitHub repository opened successfully.",
				};
			} catch {
				return { success: false, message: "Failed to open GitHub repository." };
			}
		},
	},

	handleEmailSupport: {
		handler: async (
			state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			error: StackError,
		) => {
			try {
				const mailBody = encodeURIComponent(
					`Error Details:\n${JSON.stringify(error, null, 2)}`,
				);
				const emailUrl = `mailto:${state.author_email}?subject=Nepse%20Dashboard%20Error%20Report&body=${mailBody}`;

				void TrackPage({
					context: Env.BACKGROUND,
					path: "/email-support",
					title: "Email Support",
				});

				await browser.tabs.create({ url: emailUrl, active: true });
				return { success: true, message: "Email client opened successfully." };
			} catch (error) {
				void Track({
					context: Env.BACKGROUND,
					eventName: EventName.EMAIL_OPEN_ERROR,
					params: {
						error: error instanceof Error ? error.message : String(error),
					},
				});
				return { success: false, message: "Failed to open email client." };
			}
		},
	},

	handleTermsOfService: {
		handler: async (
			_state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
		) => {
			try {
				await browser.tabs.create({ url: URLS.terms_url });

				void TrackPage({
					context: Env.BACKGROUND,
					path: "/terms-of-service",
					title: "Terms of Service",
				});

				return {
					success: true,
					message: "Terms of service opened successfully.",
				};
			} catch {
				return { success: false, message: "Failed to open terms of service." };
			}
		},
	},

	handleReview: {
		handler: async (
			_state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
		) => {
			try {
				await browser.tabs.create({ url: URLS.review_url });

				void TrackPage({
					context: Env.BACKGROUND,
					path: "/review-page",
					title: "Review Page",
				});

				return { success: true, message: "Thank you for your review!" };
			} catch {
				return { success: false, message: "Failed to open review page." };
			}
		},
	},

	handleOpenOptions: {
		handler: async (
			_state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
		) => {
			try {
				if (browser.runtime.openOptionsPage) {
					await browser.runtime.openOptionsPage();

					void TrackPage({
						context: Env.BACKGROUND,
						path: "/options-page",
						title: "Options Page",
					});

					return {
						success: true,
						message: "Options page opened successfully.",
					};
				}
				return { success: false, message: "Options page not available." };
			} catch {
				return { success: false, message: "Failed to open options page." };
			}
		},
	},

	handleNotification: {
		handler: async (
			_state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			text: string,
			level: "info" | "error" = "info",
		) => {
			try {
				if (text && level) {
					void Increment({
						property: EventToCount.NOTIFICATION_SHOWN,
						value: 1,
					});

					return await handleNotification("Nepse Dashboard", text, level);
				}
				return { success: false, message: "Invalid notification parameters." };
			} catch {
				void Track({
					context: Env.BACKGROUND,
					eventName: EventName.NOTIFICATION_ERROR,
					params: {
						text,
						level,
					},
				});

				return { success: false, message: "Failed to show notification." };
			}
		},
		validate: (text: string, level?: "info" | "error") => {
			if (!text || typeof text !== "string") {
				throw new Error("Notification text is required and must be a string");
			}
			if (level && !["info", "error"].includes(level)) {
				throw new Error("Level must be info or error");
			}
		},
	},

	getUserFeedback: {
		handler: async (
			_state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			newsId: string,
		) => {
			const client = getConvexClient();

			const user = await getUser();

			if (!user.email) {
				return;
			}

			const feedback = await client.query(api.news.getFeedback, {
				newsId: newsId as Id<"news">,
				emailId: user.email,
			});

			return feedback;
		},
	},

	submitFeedback: {
		handler: async (
			_state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			newsId: string,
			value: number,
		) => {
			try {
				const emailId = (await getUser()).email;

				if (!emailId) {
					return { success: false, error: "User not logged in." };
				}

				if (!newsId) {
					await handleNotification(
						"Nepse Dashboard",
						"Summary is still being generated. Please wait.",
						"info",
					);

					return { success: false, error: "Invalid news ID." };
				}

				const client = getConvexClient();

				const response = await client.mutation(api.news.submitFeedback, {
					newsId: newsId as Id<"news">,
					emailId,
					value,
				});

				if (response.success) {
					await handleNotification(
						"Nepse Dashboard",
						"Thank you for your feedback!",
						"info",
					);
				} else {
					await handleNotification(
						"Nepse Dashboard",
						"Failed to submit feedback. Please try again later.",
						"error",
					);
				}

				return response;
			} catch {
				await handleNotification(
					"Nepse Dashboard",
					"An error occurred while submitting feedback.",
					"error",
				);

				return {
					success: false,
					error: "An error occurred while submitting feedback.",
				};
			}
		},
		validate: (_newsId: string, value: number) => {
			if (typeof value !== "number" || ![-1, 0, 1].includes(value)) {
				throw new Error(
					"value must be -1 (negative), 0 (neutral) or 1 (positive)",
				);
			}
		},
	},

	requestNewsSite: {
		handler: async (
			_state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			siteName: string,
		) => {
			const client = getConvexClient();

			const response = await client.mutation(api.newsSites.addSite, {
				siteName,
			});

			return response;
		},
	},

	takeScreenshot: {
		handler: async () => {
			return takeScreenshot();
		},
	},

	getNewsSummaryCache: {
		handler: async (
			_state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			url: string,
		) => {
			const client = getConvexClient();

			const cachedSummary = await client.mutation(api.news.hasCache, {
				url,
			});

			if (cachedSummary.success) {
				void Increment({
					property: EventToCount.SUMMARY_CACHE_HIT,
					value: 1,
				});

				return {
					success: true,
					message: "Summary retrieved from cache.",
					data: cachedSummary.data,
				};
			}

			void Increment({
				property: EventToCount.SUMMARY_CACHE_MISS,
				value: 1,
			});

			return {
				success: false,
				message: "No cached summary found.",
				data: null,
			};
		},
	},

	getNewsSummary: {
		handler: async (
			state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			data: newsDatatype,
		) => {
			const client = getConvexClient();
			const user = await getUser();

			// Early validation
			if (!user.email) {
				return { success: false, message: AI_CODES.AUTH_ERROR };
			}

			const { hasKeys, apiKey, provider, model } = state.aiSettings;

			if (!hasKeys || !apiKey || !provider) {
				// disabled the server-side summary generation,
				// its not worth it, given that i constantly run our of rate limits
				return {
					success: false,
					message: AI_CODES.MISSING_PARAMS,
				};
			}

			try {
				const { summary } = await generateSummary({
					modelId: model,
					provider,
					key: apiKey,
					data,
				});

				if (!summary) {
					return { success: false, message: AI_CODES.MODEL_ERROR };
				}

				const result = await client.mutation(api.news.saveSummary, {
					...summary,
					createdAt: Date.now(),
					readCount: 1,
					positiveCount: 0,
					negativeCount: 0,
					userId: user.randomId,
					model,
					url: data.url,
				});

				return {
					success: true,
					data: {
						...summary,
						_id: result,
						createdAt: Date.now(),
						readCount: 1,
						positiveCount: 0,
						negativeCount: 0,
						userId: user.randomId,
						model,
						url: data.url,
					},
				};
			} catch (error) {
				// Save error for debugging
				await client.mutation(api.news.savenewsError, {
					model,
					url: data.url,
					error: error instanceof Error ? error.message : String(error),
				});

				// Return specific error message if available
				const errorMessage =
					error instanceof Error ? error.message : AI_CODES.MODEL_ERROR;
				return { success: false, message: errorMessage };
			}
		},
	},

	handleVisitChart: {
		handler: async (
			_state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			symbol: string,
		) => {
			try {
				if (!symbol) {
					return { success: false, message: "Invalid stock symbol." };
				}

				const chartConfig = _state.chartConfig;

				const link = buildChartUrl({
					chartSite: chartConfig.chartSite,
					customUrl: chartConfig.customUrl,
					symbol,
				});
				await browser.tabs.create({ url: link, active: true });

				void Track({
					context: Env.BACKGROUND,
					eventName: EventName.CHART_OPENED,
					params: { symbol },
				});

				return { success: true, message: `Chart opened for ${symbol}.` };
			} catch {
				return { success: false, message: "Failed to open chart." };
			}
		},
		validate: (symbol: string) => {
			if (!symbol || typeof symbol !== "string") {
				throw new Error("Stock symbol is required and must be a string");
			}
		},
	},

	openTradePage: {
		handler: async (
			state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			stock: string,
			type: "Buy" | "Sell",
		) => {
			try {
				const tmsUrl = state.tmsUrl;
				if (!tmsUrl || !stock) {
					return { success: false, message: "Invalid trade data." };
				}

				const url = `${tmsUrl}/me/memberclientorderentry?symbol=${stock.toUpperCase()}&transaction=${type}`;
				browser.tabs.create({ url });

				void Track({
					context: Env.BACKGROUND,
					eventName:
						type === "Buy" ? EventName.BUY_INITIATED : EventName.SELL_INITIATED,
					params: {
						broker: tmsUrl,
						symbol: stock,
					},
				});

				return {
					success: true,
					message: `Trade page opened for ${type} ${stock}`,
				};
			} catch {
				return { success: false, message: "Failed to open trade page." };
			}
		},
		validate: (stock: string, type: string) => {
			if (!stock || typeof stock !== "string") {
				throw new Error("Stock symbol is required and must be a string");
			}
			if (!["Buy", "Sell"].includes(type)) {
				throw new Error("Type must be Buy or Sell");
			}
		},
	},

	handleReloadExtension: {
		handler: async (
			_state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
		) => {
			try {
				void Track({
					context: Env.BACKGROUND,
					eventName: EventName.RELOAD_REQUESTED,
				});

				setTimeout(() => browser.runtime.reload(), 2000);
				return { success: true, message: "Reloading extension..." };
			} catch {
				return { success: false, message: "Failed to request reload." };
			}
		},
	},

	handleInstallUpdate: {
		handler: async (
			_state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
		) => {
			try {
				void Track({
					context: Env.BACKGROUND,
					eventName: EventName.HANDLE_UPDATE_CLICKED,
				});

				setTimeout(() => browser.runtime.reload(), 2000);
				return { success: true, message: "Update installation started." };
			} catch {
				return { success: false, message: "Failed to install update." };
			}
		},
	},

	// // need massive fix, to be fixed
	// handleNepseIndexUpdate: {
	// 	handler: async (
	// 		state: any,
	// 		_setState: (newState: Partial<any>) => Promise<void>,
	// 		_target: BrowserLocation,
	// 		data: LiveDataFromTMS,
	// 	) => {
	// 		const now = Date.now();

	// 		// Check if we need to verify consumption privileges
	// 		// if (!socketClient?.consumeGranted) {
	// 		// 	if (now - lastConsumeCheck >= CONFIG.consume_check_interval) {
	// 		// 		if (socketClient?.ws && socketClient.isConnected) {
	// 		// 			socketClient.ws.send(
	// 		// 				JSON.stringify({
	// 		// 					requestId: generateRequestId(),
	// 		// 					type: SocketRequestTypeConst.isConsumeAvailable,
	// 		// 					userToken: state.supabaseAccessToken,
	// 		// 				}),
	// 		// 			);
	// 		// 		}
	// 		// 		lastConsumeCheck = now;
	// 		// 	}
	// 		// 	return { success: true, message: "Consumption privileges verified." };
	// 		// }

	// 		// Send data if client is ready
	// 		// if (socketClient?.ws && socketClient.isConnected) {
	// 		// 	socketClient.ws.send(
	// 		// 		JSON.stringify({
	// 		// 			requestId: generateRequestId(),
	// 		// 			type: SocketRequestTypeConst.sendData,
	// 		// 			consumeData: data,
	// 		// 		}),
	// 		// 	);
	// 		// 	return {
	// 		// 		success: true,
	// 		// 		message: "Nepse index data sent successfully.",
	// 		// 	};
	// 		// }
	// 		return {
	// 			success: false,
	// 			message: "WebSocket not connected. Cannot send data.",
	// 		};
	// 	},
	// },

	// ===== SOCKET CONFIG ACTIONS =====
	addIndexChart: {
		handler: async (
			state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			chart: IndexKeys,
		) => {
			if (!state.subscribeConfig.indexCharts.includes(chart)) {
				const newSubscribeConfig = {
					...state.subscribeConfig,
					indexCharts: [...state.subscribeConfig.indexCharts, chart],
				};

				await setState({ subscribeConfig: newSubscribeConfig });

				void Track({
					context: Env.BACKGROUND,
					eventName: EventName.DASHBOARD_ADDED,
					params: { index: chart },
				});

				return { success: true, message: `${chart} added` };
			}
			return { success: false, message: `${chart} already exists` };
		},
		validate: (chart: IndexKeys) => {
			if (!chart) throw new Error("Chart is required");
		},
	},

	removeIndexChart: {
		handler: async (
			state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			chartToRemove: IndexKeys,
		) => {
			if (state.subscribeConfig.indexCharts.includes(chartToRemove)) {
				// const filteredCharts = state.subscribeConfig.indexCharts.filter(
				// 	(chart: IndexKeys) => chart !== chartToRemove,
				// );

				// const newSubscribeConfig = mutativeCreate(
				// 	state.subscribeConfig,
				// 	(draft) => {
				// 		draft.indexCharts = filteredCharts;
				// 	},
				// );

				const newSubscribeConfig = {
					...state.subscribeConfig,
					indexCharts: state.subscribeConfig.indexCharts.filter(
						(chart: IndexKeys) => chart !== chartToRemove,
					),
				};

				await setState({ subscribeConfig: newSubscribeConfig });

				void Track({
					context: Env.BACKGROUND,
					eventName: EventName.DASHBOARD_REMOVED,
					params: { index: chartToRemove },
				});

				return {
					success: true,
					message: `${chartToRemove} removed`,
				};
			}
			return { success: false, message: `${chartToRemove} not found` };
		},
		validate: (chart: IndexKeys) => {
			if (!chart) throw new Error("Chart is required");
		},
	},
	addStockChart: {
		handler: async (
			state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			chart: string,
		) => {
			const currentStockCharts = state.subscribeConfig.stockCharts || [];
			if (!currentStockCharts.includes(chart)) {
				const newSubscribeConfig = {
					...state.subscribeConfig,
					stockCharts: [...(state.subscribeConfig.stockCharts ?? []), chart],
				};

				void Track({
					context: Env.BACKGROUND,
					eventName: EventName.STOCK_CHART_ADDED,
					params: { stock: chart },
				});

				await setState({ subscribeConfig: newSubscribeConfig });
				return { success: true, message: "Stock chart added successfully" };
			}
			return { success: false, message: "Stock chart already exists" };
		},
		validate: (chart: string) => {
			if (!chart || typeof chart !== "string")
				throw new Error("Valid chart string is required");
		},
	},
	removeStockChart: {
		handler: async (
			state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			chartToRemove: string,
		) => {
			const currentStockCharts = state.subscribeConfig.stockCharts || [];
			if (currentStockCharts.includes(chartToRemove)) {
				const newSubscribeConfig = {
					...state.subscribeConfig,
					stockCharts: (state.subscribeConfig.stockCharts ?? []).filter(
						(chart: string) => chart !== chartToRemove,
					),
				};

				void Track({
					context: Env.BACKGROUND,
					eventName: EventName.STOCK_CHART_REMOVED,
					params: { stock: chartToRemove },
				});

				await setState({ subscribeConfig: newSubscribeConfig });
				return { success: true, message: "Stock chart removed successfully" };
			}
			return { success: false, message: "Stock chart not found" };
		},
		validate: (chart: string) => {
			if (!chart || typeof chart !== "string")
				throw new Error("Valid chart string is required");
		},
	},
	addMarketDepthStock: {
		handler: async (
			state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			stock: string,
		) => {
			const currentStocks = state.subscribeConfig.marketDepth || [];
			if (!currentStocks.includes(stock)) {
				const newSubscribeConfig = {
					...state.subscribeConfig,
					marketDepth: [...(state.subscribeConfig.marketDepth ?? []), stock],
				};

				void Track({
					context: Env.BACKGROUND,
					eventName: EventName.MARKET_DEPTH_SYMBOL_ADDED,
					params: { stock },
				});

				await setState({ subscribeConfig: newSubscribeConfig });
				return {
					success: true,
					message: "Market depth stock added successfully",
				};
			}
			return { success: false, message: "Market depth stock already exists" };
		},
		validate: (stock: string) => {
			if (!stock || typeof stock !== "string")
				throw new Error("Valid stock string is required");
		},
	},
	removeMarketDepthStock: {
		handler: async (
			state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			stockToRemove: string,
		) => {
			const currentStocks = state.subscribeConfig.marketDepth || [];
			if (currentStocks.includes(stockToRemove)) {
				const newSubscribeConfig = {
					...state.subscribeConfig,
					marketDepth: (state.subscribeConfig.marketDepth ?? []).filter(
						(stock: string) => stock !== stockToRemove,
					),
				};

				void Track({
					context: Env.BACKGROUND,
					eventName: EventName.MARKET_DEPTH_SYMBOL_REMOVED,
					params: { stock: stockToRemove },
				});

				await setState({ subscribeConfig: newSubscribeConfig });
				return {
					success: true,
					message: "Market depth stock removed successfully",
				};
			}
			return { success: false, message: "Market depth stock not found" };
		},
		validate: (stock: string) => {
			if (!stock || typeof stock !== "string")
				throw new Error("Valid stock string is required");
		},
	},

	// ===== ACCOUNT ACTIONS =====

	setAutofill: {
		handler: async (
			state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			accountType: accountType,
			enabled: boolean,
		) => {
			await setState({
				autofills: { ...state.autofills, [accountType]: enabled },
			});
			const accountNames = {
				[AccountType.TMS]: "TMS",
				[AccountType.NAASAX]: "Naasax",
				[AccountType.MEROSHARE]: "Meroshare",
			};

			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.AUTOFILL_UPDATED,
				params: { accountType, enabled },
			});

			return {
				success: true,
				message: `${accountNames[accountType]} autofill updated successfully`,
			};
		},
		validate: (accountType: accountType, enabled: boolean) => {
			if (!accountType || typeof accountType !== "string")
				throw new Error("Account type must be a valid string");
			if (typeof enabled !== "boolean")
				throw new Error("Autofill value must be a boolean");
		},
	},

	setTmsAutofill: {
		handler: async (
			state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			enabled: boolean,
		) => {
			await setState({
				autofills: { ...state.autofills, [AccountType.TMS]: enabled },
			});

			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.AUTOFILL_UPDATED,
				params: { accountType: AccountType.TMS, enabled },
			});

			return { success: true, message: "TMS autofill updated successfully" };
		},
		validate: (enabled: boolean) => {
			if (typeof enabled !== "boolean")
				throw new Error("TMS autofill must be a boolean");
		},
	},

	setNaasaxAutofill: {
		handler: async (
			state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			enabled: boolean,
		) => {
			await setState({
				autofills: { ...state.autofills, [AccountType.NAASAX]: enabled },
			});

			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.AUTOFILL_UPDATED,
				params: { accountType: AccountType.NAASAX, enabled },
			});

			return { success: true, message: "Naasax autofill updated successfully" };
		},
		validate: (enabled: boolean) => {
			if (typeof enabled !== "boolean")
				throw new Error("Naasax autofill must be a boolean");
		},
	},

	setMeroAutofill: {
		handler: async (
			state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			enabled: boolean,
		) => {
			await setState({
				autofills: { ...state.autofills, [AccountType.MEROSHARE]: enabled },
			});

			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.AUTOFILL_UPDATED,
				params: { accountType: AccountType.MEROSHARE, enabled },
			});

			return { success: true, message: "Mero autofill updated successfully" };
		},
		validate: (enabled: boolean) => {
			if (typeof enabled !== "boolean")
				throw new Error("Mero autofill must be a boolean");
		},
	},

	setAutoSaveNewAccount: {
		handler: async (
			_state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			enabled: boolean,
		) => {
			await setState({ autoSaveNewAccount: enabled });

			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.AUTOSAVE_NEW_ACCOUNT_UPDATED,
				params: { enabled },
			});

			return {
				success: true,
				message: "Auto save new account updated successfully",
			};
		},
		validate: (enabled: boolean) => {
			if (typeof enabled !== "boolean")
				throw new Error("Auto save new account must be a boolean");
		},
	},

	setSyncPortfolio: {
		handler: async (
			_state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			enabled: boolean,
		) => {
			await setState({ syncPortfolio: enabled });

			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.SYNC_PORTFOLIO_UPDATED,
				params: { enabled },
			});

			return {
				success: true,
				message: "Sync portfolio setting updated successfully",
			};
		},
		validate: (enabled: boolean) => {
			if (typeof enabled !== "boolean")
				throw new Error("Sync portfolio must be a boolean");
		},
	},

	addAccount: {
		handler: async (
			state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			newAccountData: Account,
		) => {
			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.ACCOUNT_ADDED,
				params: {
					accountType: newAccountData.type,
					broker: newAccountData.broker,
				},
			});

			const accounts = state.accounts ?? [];
			const newAccounts = addAccount(accounts, newAccountData);

			await setState({ accounts: newAccounts });
			return { success: true, message: "Account added successfully" };
		},
		validate: (account: Account) => {
			if (!account || typeof account !== "object")
				throw new Error("Valid account object is required");
			if (!account.username || !account.password || !account.type)
				throw new Error("Username, password, and type are required");
		},
	},

	deleteAccount: {
		handler: async (
			state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			alias: string,
		) => {
			const accounts = state.accounts ?? [];
			const accountIndex = state.accounts?.findIndex(
				(acc: Account) => acc.alias === alias,
			);

			if (accountIndex === -1) {
				return { success: false, message: "Account not found" };
			}

			const newAccounts = deleteAccount(accounts, accountIndex);

			await setState({ accounts: newAccounts });

			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.ACCOUNT_REMOVED,
				params: { alias },
			});

			return { success: true, message: "Account deleted successfully" };
		},
		validate: (alias: string) => {
			if (!alias || typeof alias !== "string")
				throw new Error("Valid alias is required");
		},
	},

	makePrimary: {
		handler: async (
			state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			alias: string,
		) => {
			const accounts = state.accounts ?? [];

			const targetAccount = state.accounts?.find(
				(acc: Account) => acc.alias === alias,
			);

			if (!targetAccount) {
				return { success: false, message: "Account not found" };
			}

			const newAccounts = makePrimary(accounts, alias, targetAccount);

			await setState({ accounts: newAccounts });

			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.PRIMARY_STATUS_CHANGED,
				params: { alias },
			});

			return { success: true, message: "Account set as primary successfully" };
		},
		validate: (alias: string) => {
			if (!alias || typeof alias !== "string")
				throw new Error("Valid alias is required");
		},
	},

	setEditingAccount: {
		handler: async (
			_state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			editingAccountAlias: string | null,
		) => {
			await setState({ editingAccount: editingAccountAlias });
			return { success: true, message: "Editing account set successfully" };
		},
	},

	setIsAddingAccount: {
		handler: async (
			_state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			isAddingAccount: boolean,
		) => {
			await setState({ isAddingAccount });
			return { success: true, message: "Is adding account set successfully" };
		},
	},

	setError: {
		handler: async (
			state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			alias: string,
			error: ErrorTypes | null,
		) => {
			const accounts = state.accounts ?? [];
			const accountIndex = state.accounts?.findIndex(
				(acc: Account) => acc.alias === alias,
			);

			if (accountIndex === -1) {
				return { success: false, message: "Account not found" };
			}

			const newAccounts = accounts.map((acc: Account, i: number) =>
				i === accountIndex ? { ...acc, error } : acc,
			);

			const errorMessage =
				error === "credentialError"
					? "Invalid credentials. Please check your username and password."
					: "An unknown error occurred. Please try again.";

			await handleNotification("Nepse Dashboard", errorMessage, "error");

			await setState({ accounts: newAccounts });
			return { success: true, message: "Account error set successfully" };
		},
		validate: (alias: string, _error: ErrorTypes | null) => {
			if (!alias || typeof alias !== "string")
				throw new Error("Valid alias is required");
		},
	},

	setDisabled: {
		handler: async (
			state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			alias: string,
			disabled: boolean,
		) => {
			const accounts = state.accounts ?? [];
			const accountIndex = state.accounts?.findIndex(
				(acc: Account) => acc.alias === alias,
			);

			if (accountIndex === -1) {
				return { success: false, message: "Account not found" };
			}

			const newAccounts = accounts.map((acc: Account, i: number) =>
				i === accountIndex ? { ...acc, disabled } : acc,
			);

			await setState({ accounts: newAccounts });
			return {
				success: true,
				message: "Account disabled status set successfully",
			};
		},
		validate: (alias: string, disabled: boolean) => {
			if (!alias || typeof alias !== "string")
				throw new Error("Valid alias is required");
			if (typeof disabled !== "boolean")
				throw new Error("Disabled must be a boolean");
		},
	},

	handleThisAccountLogin: {
		handler: async (
			state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			alias: string,
		) => {
			const accounts = state.accounts ?? [];

			const account = accounts?.find((acc: Account) => acc.alias === alias);

			if (!account) {
				return { success: false, message: "Account not found" };
			}

			// Set pendingLogin to true for this account
			const newAccounts = accounts.map((acc: Account) =>
				acc.alias === alias ? { ...acc, pendingLogin: true } : acc,
			);

			await setState({ accounts: newAccounts });

			const config = LOGIN_CONFIG[account.type as accountType];
			const urlPattern = config.tabUrlPattern(account.broker);
			const loginUrl = config.loginUrl(account.broker);

			// Query all tabs to find matching active tab
			const tabs = await browser.tabs.query({ url: urlPattern });

			if (tabs.length > 0 && tabs[0]?.id) {
				// Tab exists - activate it and call logout (auto-login will be handled)
				const tab = tabs[0];

				await Promise.all([
					browser.tabs.update(tab.id, { active: true }),
					sendMessage(config.logoutMessage, undefined, tab.id),
					handleNotification(
						"Nepse Dashboard",
						`Logging out current session and logging in as ${alias}`,
						"info",
					),
				]);

				void Track({
					context: Env.BACKGROUND,
					eventName: EventName.MANUAL_ACCOUNT_LOGIN_INITIATED,
					params: { alias, accountType: account.type, hasExistingTab: true },
				});

				return {
					success: true,
					message: `Logging out current session and logging in as ${alias}`,
				};
			}

			// No matching tab - create new tab with login URL
			await browser.tabs.create({
				url: loginUrl,
				active: true,
			});

			void Track({
				context: Env.BACKGROUND,
				eventName: EventName.MANUAL_ACCOUNT_LOGIN_INITIATED,
				params: { alias, accountType: account.type, hasExistingTab: false },
			});

			return {
				success: true,
				message: `Opening login page for ${alias}`,
			};
		},

		validate: (alias: string) => {
			if (!alias || typeof alias !== "string") {
				throw new Error("Valid alias is required");
			}
		},
	},
	setUpdatedAt: {
		handler: async (
			state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			alias: string,
			updatedAt: string,
		) => {
			const accounts = state.accounts ?? [];
			const accountIndex = state.accounts?.findIndex(
				(acc: Account) => acc.alias === alias,
			);

			if (accountIndex === -1) {
				return { success: false, message: "Account not found" };
			}

			const newAccounts = accounts.map((acc: Account, i: number) =>
				i === accountIndex ? { ...acc, updatedAt } : acc,
			);
			await setState({ accounts: newAccounts });
			return {
				success: true,
				message: "Account updated time set successfully",
			};
		},
		validate: (alias: string, updatedAt: string) => {
			if (!alias || typeof alias !== "string")
				throw new Error("Valid alias is required");
			if (!updatedAt || typeof updatedAt !== "string")
				throw new Error("Valid updated time is required");
		},
	},

	setLastLoggedIn: {
		handler: async (
			state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			alias: string,
			url: string,
			type: accountType,
		) => {
			const accounts = state.accounts ?? [];
			const accountIndex = state.accounts?.findIndex(
				(acc: Account) => acc.alias === alias,
			);

			if (accountIndex === -1) {
				return { success: false, message: "Account not found" };
			}

			// show notification early
			await handleNotification(
				"Nepse Dashboard",
				`Logged in as ${alias}`,
				"success",
			);

			//
			const eventName =
				type === AccountType.TMS
					? EventName.AUTO_LOGIN_SUCCESS_TMS
					: type === AccountType.NAASAX
						? EventName.AUTO_LOGIN_SUCCESS_NAASAX
						: EventName.AUTO_LOGIN_SUCCESS_MEROSHARE;

			const countType =
				type === AccountType.TMS
					? EventToCount.LOGIN_COUNT_TMS
					: type === AccountType.NAASAX
						? EventToCount.LOGIN_COUNT_NAASAX
						: EventToCount.LOGIN_COUNT_MEROSHARE;

			const targetAccount = accounts[accountIndex];

			const newAccounts = accounts.map((acc: Account, i: number) => {
				if (i === accountIndex) {
					// This is the account we're logging into
					return {
						...acc,
						lastLoggedIn: new Date().toISOString(),
						isCurrentlyLoggingIn: true,
						pendingLogin: false,
					};
				}

				// Set isCurrentlyLoggingIn to false for other accounts based on scope
				if (type === AccountType.TMS) {
					// TMS: only affect accounts with the same broker
					if (
						acc.type === AccountType.TMS &&
						acc.broker === targetAccount.broker
					) {
						return { ...acc, isCurrentlyLoggingIn: false };
					}
				} else {
					// NAASAX or MEROSHARE: affect all accounts of the same type
					if (acc.type === type) {
						return { ...acc, isCurrentlyLoggingIn: false };
					}
				}

				// Leave other accounts unchanged
				return acc;
			});

			if (type === AccountType.TMS) {
				const baseUrl = `${url.split("/tms/")[0]}/tms`;
				await setState({ tmsUrl: baseUrl });
			}

			await setState({ accounts: newAccounts });

			//handle pendingLogin,

			void Track({
				context: Env.BACKGROUND,
				eventName,
				params: { alias },
			});

			Increment({
				property: countType,
				value: 1,
			});

			return {
				success: true,
				message: "Account last logged in time set successfully",
			};
		},
		validate: (alias: string) => {
			if (!alias || typeof alias !== "string")
				throw new Error("Valid alias is required");
		},
	},

	saveAccountIfNeeded: {
		handler: async (
			state: any,
			setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			type: accountType,
			broker: number | null,
			username: string,
			password: string,
		) => {
			if (!username || !password || !type) {
				return {
					success: false,
					message: "Username, password, and type are required",
				};
			}

			const existingAccount = state.accounts.find(
				(acc: Account) => acc.username === username && acc.type === type,
			);

			if (existingAccount) {
				// take no action if password is same

				if (existingAccount.password === password) {
					return {
						success: true,
						message: "No changes detected for the account",
					};
				}

				// Update existing account: update password, broker and reset flags/timestamps
				const updatedAccount: Account = {
					...existingAccount,
					password,
					broker,
					error: null,
					disabled: false,
					updatedAt: new Date().toISOString(),
					lastLoggedIn: new Date().toISOString(),
				};

				const newAccounts = state.accounts.map((acc: Account) =>
					acc.username === username && acc.type === type ? updatedAccount : acc,
				);

				void Increment({
					property: EventToCount.AUTOSAVED_ACCOUNT,
					value: 1,
				});

				await setState({ accounts: newAccounts });

				await handleNotification(
					"Nepse Dashboard",
					`${updatedAccount.alias} updated successfully`,
					"success",
				);

				return {
					success: true,
					message: `${updatedAccount.alias} updated successfully`,
				};
			}

			const account: Account = {
				username,
				password,
				type,
				alias: username,
				isPrimary: false,
				error: null,
				disabled: false,
				updatedAt: new Date().toISOString(),
				lastLoggedIn: new Date().toISOString(),
				broker,
				isCurrentlyLoggingIn: false,
				pendingLogin: false,
			};

			// Determine if this should be primary based on account type
			if (type === AccountType.TMS) {
				// TMS: check if first account for this broker
				const existingBrokerAccounts = state.accounts.filter(
					(acc: Account) =>
						acc.type === AccountType.TMS && acc.broker === broker,
				);
				if (existingBrokerAccounts.length === 0) {
					account.isPrimary = true;
				}
			} else {
				// NAASAX and MEROSHARE: check if first account of this type
				if (
					state.accounts.length === 0 ||
					state.accounts.every((acc: Account) => acc.type !== type)
				) {
					account.isPrimary = true;
				}
			}

			const newAccounts = [...state.accounts, account];

			void Increment({
				property: EventToCount.AUTOSAVED_ACCOUNT,
				value: 1,
			});

			handleNotification(
				"Nepse Dashboard",
				`${account.alias} saved successfully`,
				"info",
			);

			await setState({ accounts: newAccounts });
			return { success: true, message: "Account saved successfully" };
		},
		validate: (
			type: accountType,
			_broker: number | null,
			username: string,
			password: string,
		) => {
			if (!type || typeof type !== "string")
				throw new Error("Valid account type is required");
			if (!username || typeof username !== "string")
				throw new Error("Valid username is required");
			if (!password || typeof password !== "string")
				throw new Error("Valid password is required");
		},
	},

	// ===== NOTIFICATION & TRACKING ACTIONS =====
	showNotification: {
		handler: async (
			_state: any,
			_setState: (newState: Partial<any>) => Promise<void>,
			_target: BrowserLocation,
			text: string,
			level: NotificationVariant = "info",
		) => {
			try {
				return await handleNotification(
					"Nepse Dashboard",
					text,
					level,
					undefined,
				);
			} catch (error) {
				void Track({
					context: Env.BACKGROUND,
					eventName: EventName.NOTIFICATION_ERROR,
					params: {
						error: error instanceof Error ? error.message : String(error),
						stack: error instanceof Error ? error.stack : undefined,
						timestamp: new Date().toISOString(),
					},
				});

				return { success: false, message: "Failed to show notification" };
			}
		},
		validate: (text: string, level?: NotificationVariant) => {
			if (!text || typeof text !== "string")
				throw new Error("Notification text is required and must be a string");
			if (level && !["info", "error", "success", "warning"].includes(level))
				throw new Error("Level must be info, error, success, or warning");
		},
	},
});
