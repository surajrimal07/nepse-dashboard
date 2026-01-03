import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import { Settings } from "lucide-react";
import React, { memo, Suspense, useCallback, useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/react/shallow";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Env, EventName } from "@/types/analytics-types";
import type { searchAIResponse } from "@/types/search-type";
import LoadingDots from "../../components/loading-dots";
import { ErrorMessage } from "./components/error";

import { ModeSelector } from "./components/mode-selector";

import {
	selectAddAI,
	selectAddUser,
	selectChatId,
	selectIsVisible,
	selectMode,
	selectQ,
	selectResults,
	selectSetChatId,
	selectSetCompanies,
	selectSetError,
	selectSetIsGenerating,
	selectSetQ,
	selectSettings,
	selectToggleNextMode,
	selectToggleShowSettings,
} from "./selectors";

import { useSearchState } from "./store";
import {
	ERROR_LOAD_CHART,
	ERROR_SYMBOL_INVALID,
	getInputClass,
	getPlaceholderText,
} from "./utils";
import "./searchOverlay.css";
import { useAppState } from "@/hooks/use-app";
import MarketClosed from "./components/market-closed";

const ResultsList = React.lazy(
	() => import("@/entrypoints/search.content/components/result-list"),
);

const Chat = React.lazy(
	() => import("@/entrypoints/search.content/components/chat"),
);

const SettingsDropdown = React.lazy(
	() => import("@/entrypoints/search.content/components/settings"),
);
const TmsDisabled = React.lazy(
	() => import("@/entrypoints/search.content/components/tms-disabled"),
);
const AiModeDisabled = React.lazy(
	() => import("@/entrypoints/search.content/components/aimode-disabled"),
);

const MainContent = memo(
	({
		mode,
		aiMode,
		tmsUrl,
		showSettings,
		onSubmit,
		onCloseSettings,
		handleVisitChart,
		results,
		marketOpen,
	}: {
		mode: string;
		aiMode: boolean;
		tmsUrl: string | null;
		showSettings: boolean;
		onSubmit: (value?: string) => Promise<void>;
		onCloseSettings: () => void;
		handleVisitChart: (symbol: string) => Promise<void>;
		results: Doc<"company">[];
		marketOpen: boolean;
	}) => {
		if (showSettings) {
			return <SettingsDropdown onClose={onCloseSettings} />;
		}

		if (mode === "ai") {
			return aiMode ? (
				<Chat onSubmit={onSubmit} />
			) : (
				<AiModeDisabled />
			);
		}

		if (mode === "tms") {
			if (!tmsUrl) {
				return <TmsDisabled />;
			}

			if (!marketOpen) {
				return <MarketClosed />;
			}
		}

		return (
			<ResultsList handleVisitChart={handleVisitChart} results={results} />
		);
	},
);

MainContent.displayName = "MainContent";

export default function SearchOverlay({
	onClose,
	onEsc,
}: {
	onClose: () => void;
	onEsc: () => void;
}) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const { useStateItem, callAction } = useAppState();
	const [aiSettings] = useStateItem("aiSettings");
	const [companiesList] = useStateItem("companiesList");
	const [tmsUrl] = useStateItem("tmsUrl");
	const [aiMode] = useStateItem("aiMode");
	const [marketOpen] = useStateItem("marketOpen");

	const {
		setAIMessages,
		settings,
		toggleSettings,
		addUser,
		chatId,
		setChatId,
		setIsGenerating,
		isVisible,
		mode,
		setError,
		toggleNextMode,
		q,
		setQ,
		results,
		setCompanies,
	} = useSearchState(
		useShallow((state) => ({
			setAIMessages: selectAddAI(state),
			settings: selectSettings(state),
			toggleSettings: selectToggleShowSettings(state),
			addUser: selectAddUser(state),
			chatId: selectChatId(state),
			setChatId: selectSetChatId(state),
			setIsGenerating: selectSetIsGenerating(state),
			isVisible: selectIsVisible(state),
			mode: selectMode(state),
			setError: selectSetError(state),
			toggleNextMode: selectToggleNextMode(state),
			q: selectQ(state),
			setQ: selectSetQ(state),
			results: selectResults(state),
			setCompanies: selectSetCompanies(state),
		})),
	);

	const handleVisitChart = useCallback(
		async (symbol: string) => {
			try {
				if (mode === "chart") {
					await callAction("handleVisitChart", symbol);
				} else if (mode === "tms") {
					if (!marketOpen) {
						setError("Market is currently closed.");
						return;
					}
					await callAction("openTradePage", symbol, "Buy");
				}

				onClose();
			} catch (e) {
				setError(ERROR_LOAD_CHART);
				track({
					context: Env.CONTENT,
					eventName: EventName.SEARCH_CONTENT_ERROR,
					params: {
						error: e instanceof Error ? e.message : String(e),
					},
				});
			}
		},
		[mode, marketOpen, callAction, onClose, setError],
	);

	useHotkeys(
		"esc",
		() => {
			setQ("");
			onEsc();
		},
		{
			preventDefault: true,
			enableOnFormTags: ["input"],
		},
		[onEsc],
	);

	useHotkeys(
		"tab",
		(e) => {
			e.preventDefault();
			toggleNextMode();
		},
		{
			enableOnFormTags: ["input"],
			preventDefault: true,
		},
		[mode],
	);

	useEffect(() => {
		if (companiesList) {
			setCompanies(companiesList);
		}
	}, [companiesList, setCompanies]);

	useEffect(() => {
		if (isVisible) {
			const timer = setTimeout(() => {
				inputRef.current?.focus();
			}, 10);
			return () => clearTimeout(timer);
		}
		return undefined;
	}, [isVisible]);

	const handleSubmit = useCallback(
		async (value?: string) => {
			const inputValue = value || q;

			if (!inputValue || inputValue.trim().length === 0) return;

			if (mode === "ai") {
				if (!aiSettings.hasKeys) {
					setError("AI keys are not configured.");
					return;
				}

				addUser(inputValue);
				setQ("");
				setIsGenerating(true);

				const result: searchAIResponse = await callAction("searchChat", {
					url: location.toString(),
					messages: inputValue,
					chatid: chatId,
				});

				if (result?.message) {
					setAIMessages(result.message);
				}

				if (result?.chatId) {
					setChatId(result.chatId);
				}

				setIsGenerating(false);
				return;
			}

			// non-AI mode
			if (results.length === 0) {
				setError(ERROR_SYMBOL_INVALID);
				return;
			}

			const first = results[0];
			setQ("");
			handleVisitChart(first.symbol);
		},
		[
			q,
			mode,
			aiSettings.hasKeys,
			results,
			chatId,
			setError,
			addUser,
			setQ,
			setIsGenerating,
			callAction,
			setAIMessages,
			setChatId,
			handleVisitChart,
		],
	);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setQ(e.target.value);
		},
		[setQ],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				handleSubmit();
			}
		},
		[handleSubmit],
	);

	const handleToggleSettings = useCallback(() => {
		toggleSettings();
	}, [settings]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center px-2">
			<div
				className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
				onClick={onClose}
				aria-hidden="true"
			/>

			<div className="relative w-full max-w-xl">
				<div
					className={cn(
						"rounded-2xl shadow-2xl border",
						"bg-slate-900 border-slate-700/60",
					)}
				>
					<div className="relative px-1 pt-1 h-80">
						<Suspense fallback={<LoadingDots className="scale-110" />}>
							<ErrorMessage />
							<MainContent
								mode={mode}
								aiMode={aiMode}
								tmsUrl={tmsUrl}
								showSettings={settings}
								onSubmit={handleSubmit}
								onCloseSettings={handleToggleSettings}
								handleVisitChart={handleVisitChart}
								results={results}
								marketOpen={marketOpen}
							/>
						</Suspense>
					</div>
					<div className=" p-1 flex items-center gap-1 mt-1">
						<input
							ref={inputRef}
							value={q ?? ""}
							onChange={handleInputChange}
							placeholder={getPlaceholderText(mode)}
							className={getInputClass()}
							onKeyDown={handleKeyDown}
						/>
						<button
							type="button"
							onClick={handleToggleSettings}
							className={cn(
								"p-1 rounded-lg transition-all",
								"hover:bg-slate-800 text-slate-400 hover:text-slate-300",
								settings && "bg-slate-800 text-slate-300",
							)}
							aria-label="Settings"
						>
							<Settings size={16} />
						</button>
					</div>
					<ModeSelector />
				</div>
			</div>
		</div>
	);
}
