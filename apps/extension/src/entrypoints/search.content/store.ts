import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import { createJSONStorage, persist } from "zustand/middleware";
import { useStore } from "zustand/react";
import { createStore } from "zustand/vanilla";
import { track } from "@/lib/analytics";
import { Env, EventName } from "@/types/analytics-types";
import type { ParsedDocument } from "@/types/news-types";
import type { modeType } from "@/types/search-type";
import { getNextMode } from "@/types/search-type";
import { logger } from "@/utils/logger";
import { sendMessage } from "../../lib/messaging/extension-messaging";

interface ChatMessage {
	from: "user" | "assistant";
	text: string;
}

// Helper to get URL key (pathname + search)
function getUrlKey(url: URL) {
	return `${url.pathname}${url.search}`;
}

export interface SearchState {
	location: URL;

	// Records keyed by URL
	chatIds: Record<string, string | null>;
	messagesRecord: Record<string, ChatMessage[]>;

	// Current URL's data (computed from records)
	chatId: string | null;
	messages: ChatMessage[];

	setChatId: (chatId: string | null) => void;
	addUser: (text: string) => void;
	addAI: (text: string) => void;
	clear: () => void;

	isGenerating: boolean;
	setIsGenerating: (generating: boolean) => void;

	initialize: () => Promise<void>;

	isVisible: boolean;
	companies: Doc<"company">[];
	isLoading: boolean;
	q: string | null;
	error: string | null;
	showSettings: boolean;
	tempCustomUrl: string | null;
	result: Doc<"company">[];
	mode: modeType;
	setCompanies: (companies: Doc<"company">[]) => void;

	setMode: (mode: modeType) => void;
	setQ: (q: string | null) => void;

	toggleSettings: () => void;
	closeSettings: () => void;
	setTempCustomUrl: (url: string) => void;
	toggleNextMode: () => void;
	setError: (error: string | null) => void;

	content: ParsedDocument | null;
	setContent: (content: ParsedDocument) => void;
	chatWithAI: () => void;
	sendParsedContent: () => void;
}

export const searchState = createStore<SearchState>()(
	persist(
		(set, get) => {
			const getCurrentUrlKey = () => getUrlKey(get().location);
			return {
				location: new URL(window.location.href),

				// Persisted records
				chatIds: {},
				messagesRecord: {},

				// Computed values for current URL
				chatId: null,
				messages: [],

				isGenerating: false,
				setIsGenerating: (generating: boolean) => {
					set({ isGenerating: generating });
				},

				setChatId: (chatId: string | null) => {
					const urlKey = getCurrentUrlKey();
					set((state) => ({
						chatId,
						chatIds: { ...state.chatIds, [urlKey]: chatId },
					}));
				},

				initialize: async () => {
					set({ isLoading: true });
					const urlKey = getCurrentUrlKey();

					try {
						try {
							const response = await sendMessage("companiesList");
							set({ companies: response, result: response });
						} catch (_error) {
							logger.info("Error fetching companies list");
						}

						// Load from persisted records
						const state = get();
						const chatId = state.chatIds[urlKey] || null;
						const messages = state.messagesRecord[urlKey] || [];

						set({ chatId, messages });
					} catch (error) {
						set({ error: (error as Error).message });

						track({
							context: Env.CONTENT,
							eventName: EventName.SEARCH_CONTENT_ERROR,
							params: {
								error: (error as Error).message,
							},
						});
					} finally {
						set({ isLoading: false });
					}
				},

				addUser: (text) => {
					const urlKey = getCurrentUrlKey();
					set((state) => {
						const currentMessages = state.messagesRecord[urlKey] || [];
						const newMessages = [
							...currentMessages,
							{ from: "user" as const, text },
						];

						return {
							messages: newMessages,
							messagesRecord: {
								...state.messagesRecord,
								[urlKey]: newMessages,
							},
						};
					});
				},

				addAI: (text) => {
					const urlKey = getCurrentUrlKey();
					set((state) => {
						const currentMessages = state.messagesRecord[urlKey] || [];
						const newMessages = [
							...currentMessages,
							{ from: "assistant" as const, text },
						];

						return {
							messages: newMessages,
							messagesRecord: {
								...state.messagesRecord,
								[urlKey]: newMessages,
							},
						};
					});
				},

				clear: () => {
					const urlKey = getCurrentUrlKey();
					set((state) => {
						const newMessagesRecord = { ...state.messagesRecord };
						const newChatIds = { ...state.chatIds };

						delete newMessagesRecord[urlKey];
						delete newChatIds[urlKey];

						return {
							messages: [],
							chatId: null,
							messagesRecord: newMessagesRecord,
							chatIds: newChatIds,
						};
					});
				},

				isVisible: false,
				companies: [] as Doc<"company">[],
				setCompanies: (companies: Doc<"company">[]) => {
					set({ companies });
				},
				isLoading: false,
				q: null,
				error: null,
				showSettings: false,
				tempCustomUrl: null,
				result: [] as Doc<"company">[],
				content: null,

				chatWithAI: async () => {
					const chatId = get().chatId;
					const route = chatId ? `/ai-chat/${chatId}` : "/ai-chat";

					try {
						await sendMessage("openSidePanel");
						await new Promise((resolve) => setTimeout(resolve, 1500));
						await sendMessage("goToRoute", { route });
					} catch (_error) {
						logger.info("Likely sidepanel is already open");
					}
				},

				sendParsedContent: async () => {
					const content = get().content;
					const trySend = async (): Promise<boolean> => {
						try {
							const res = await sendMessage("sendWebsiteContent", content);
							return res === true;
						} catch {
							return false;
						}
					};

					const success = await trySend();
					try {
						if (success) return;
						await sendMessage("openSidePanel");
						await new Promise((resolve) => setTimeout(resolve, 1500));
						await sendMessage("goToRoute", { route: "/ai-chat" });

						await new Promise((resolve) => setTimeout(resolve, 2500));
						await trySend();
					} catch (_error) {
						logger.info("Likely sidepanel is already open");
					}
				},

				setContent: (content: ParsedDocument) => {
					set({ content });
				},

				suggestions: [] as string[],
				mode: "chart",

				setMode: async (mode: modeType) => {
					set({ mode });
				},

				closeSettings: () => {
					set({ showSettings: false });
				},

				toggleNextMode: async () => {
					const currentMode = get().mode;
					const nextMode = getNextMode(currentMode);
					set({ mode: nextMode });
				},

				setQ: (q: string | null) => {
					set({ q });

					if (get().error) {
						set({ error: null });
					}
					if (get().mode === "ai") {
						return;
					}

					if (!q || q.trim().length === 0) {
						set({ result: get().companies });
						return;
					}

					const upperSearch = q.toUpperCase();
					const lowerSearch = q.toLowerCase();

					const filtered = get().companies.filter((r) => {
						if (r.symbol.includes(upperSearch)) return true;
						return r.securityName.toLowerCase().includes(lowerSearch);
					});
					set({ result: filtered });
				},

				setError: (error: string | null) => {
					set({ error });
				},

				toggleSettings: () => {
					const current = get().showSettings;
					set({ showSettings: !current });
				},

				setTempCustomUrl: (url: string) => {
					set({ tempCustomUrl: url });
				},
			};
		},
		{
			name: "search-state",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				mode: state.mode,
				chatIds: state.chatIds,
				messagesRecord: state.messagesRecord,
			}),
		},
	),
);

export function useSearchState<T>(selector: (state: SearchState) => T) {
	return useStore(searchState, selector);
}
