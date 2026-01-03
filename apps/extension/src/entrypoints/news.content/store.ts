import type { aiErrors } from "@nepse-dashboard/ai/types";
import { AI_CODES } from "@nepse-dashboard/ai/types";
import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import { connect } from "crann-fork";
import { createJSONStorage, persist } from "zustand/middleware";
import { useStore } from "zustand/react";
import { createStore } from "zustand/vanilla";
import { track } from "@/lib/analytics";
import { appState } from "@/lib/service/app-service";
import { Env, EventName } from "@/types/analytics-types";
import type { ParsedNews } from "@/types/news-types";
import { analyzeDocument } from "@/utils/content/analyze";
import { logger } from "@/utils/logger";
import { sendMessage } from "../../lib/messaging/extension-messaging";

const { callAction } = connect(appState);

export interface NewsState {
	content: ParsedNews | null;
	setContent: (content: ParsedNews) => void;
	isLoading: boolean;
	checkCache: (url: string) => Promise<boolean>;
	summary: Doc<"news"> | null;
	generate: (url: string) => Promise<void>;
	error: aiErrors | null;
	handleRetry: (url: string) => void;
	feedback: -1 | 0 | 1;
	getFeedback: () => Promise<void>;
	setFeedback: (value: -1 | 0 | 1) => void;
	isSubmittingFeedback: boolean;

	keySettingDialogOpen: boolean;
	setKeySettingDialogOpen: (open: boolean) => void;
	sendParsedContent: () => void;

	ttsVoice: Record<string, string>; // language -> voice name
	setTtsVoice: (language: string, voiceName: string) => void;
	goToKeyPage: () => void;
}

export const newsState = createStore<NewsState>()(
	persist(
		(set, get) => ({
			ttsVoice: {},
			setTtsVoice: (language: string, voiceName: string) => {
				set((state) => ({
					ttsVoice: { ...state.ttsVoice, [language]: voiceName },
				}));
			},
			isLoading: false,
			content: null,
			feedback: 0,
			summary: null,
			isSubmittingFeedback: false,
			keySettingDialogOpen: false,
			goToKeyPage: async () => {
				try {
					await sendMessage("openSidePanel");
					// pause for 2 seconds to allow route change to complete
					await new Promise((resolve) => setTimeout(resolve, 1500));
					await sendMessage("goToRoute", { route: "/keys" });
				} catch (error) {
					void track({
						context: Env.CONTENT,
						eventName: EventName.UNABLE_TO_OPEN_SIDE_PANEL,
						params: { error: error as string, location: "useSidepanel" },
					});

					logger.info("Likely sidepanel is already open");
				}
			},
			setKeySettingDialogOpen: (open: boolean) => {
				set({ keySettingDialogOpen: open });
			},
			error: null,
			setContent: (content: ParsedNews) => {
				set({ content });
			},

			sendParsedContent: async () => {
				const parsedContent = analyzeDocument();

				const trySend = async (): Promise<boolean> => {
					try {
						const res = await sendMessage("sendWebsiteContent", parsedContent);
						return res === true;
					} catch (_error) {
						return false;
					}
				};

				const success = await trySend();
				if (success) return;

				try {
					await sendMessage("openSidePanel");
					await new Promise((resolve) => setTimeout(resolve, 1500));
					await sendMessage("goToRoute", { route: "/ai-chat" });

					await new Promise((resolve) => setTimeout(resolve, 2000));
					await trySend();
				} catch (_error) {
					logger.info("Likely sidepanel is already open");
				}
			},

			getFeedback: async () => {
				const existingFeedback = get().feedback;
				const summary = get().summary;

				if (existingFeedback) {
					return;
				}

				if (!summary?._id) {
					return;
				}

				const value = await callAction("getUserFeedback", summary._id);

				if (!value) {
					return;
				}

				set({ feedback: value as -1 | 0 | 1 });
			},

			setFeedback: async (value: -1 | 0 | 1) => {
				set({ isSubmittingFeedback: true });

				const currentSummary = get().summary;
				const oldFeedback = get().feedback;

				if (!currentSummary?._id) {
					return;
				}

				const newValue = value === oldFeedback ? 0 : value;

				const response = await callAction(
					"submitFeedback",
					currentSummary._id,
					newValue,
				);

				if (response.success) {
					set({ feedback: response.value as -1 | 0 | 1 });

					// update  summary.positiveCount and negativeCount
					set((state) => {
						if (!state.summary) {
							return state;
						}

						return {
							summary: {
								...state.summary,
								positiveCount: response.positiveCount,
								negativeCount: response.negativeCount,
							},
						};
					});

					set({ isSubmittingFeedback: false });
				}

				set({ isSubmittingFeedback: false });
			},

			generate: async (url: string) => {
				set({ isLoading: true });

				const content = get().content;

				if (!url || !content?.content || !content?.lang) {
					const unsupportedLang =
						content?.lang && !["eng", "npi"].includes(content.lang);
					set({
						isLoading: false,
						error: unsupportedLang
							? AI_CODES.UNSUPPORTED_LANGUAGE
							: AI_CODES.UNABLE_TO_EXTRACT,
					});
					return;
				}

				try {
					const response = await callAction("getNewsSummary", {
						url,
						...content,
					});

					if (!response?.success || !response.data) {
						set({
							isLoading: false,
							error: (response?.message as aiErrors) || AI_CODES.UNKNOWN_ERROR,
						});

						track({
							context: Env.CONTENT,
							eventName: EventName.NEWS_ERROR,
							params: {
								error: response?.message || "unknown_error_no_retry",
								function: "newsState.generate",
							},
						});

						return;
					}

					set({ summary: response.data, isLoading: false, error: null });
				} catch {
					set({
						isLoading: false,
						error: AI_CODES.NETWORK_ERROR,
					});

					track({
						context: Env.CONTENT,
						eventName: EventName.NEWS_ERROR,
						params: {
							error: "network_error_exception",
							function: "newsState.generate",
						},
					});
				}
			},

			handleRetry: (url: string) => {
				const currentSummart = get().summary;
				if (currentSummart) {
					return;
				}
				get().generate(url);
			},

			checkCache: async (url: string) => {
				set({ isLoading: true });

				const cacheResult = await callAction("getNewsSummaryCache", url);

				if (cacheResult.success && cacheResult.data) {
					set({
						summary: cacheResult.data,
						isLoading: false,
						error: null,
					});
					return true;
				}

				track({
					context: Env.CONTENT,
					eventName: EventName.NEWS_ERROR,
					params: {
						error: cacheResult.message,
						function: "newsState.checkCache",
					},
				});

				set({ summary: null, isLoading: false, error: cacheResult.message });
				return false;
			},
		}),

		{
			name: "news-state",
			storage: createJSONStorage(() => sessionStorage),
		},
	),
);

export function useNewsState<T>(selector: (state: NewsState) => T) {
	return useStore(newsState, selector);
}
