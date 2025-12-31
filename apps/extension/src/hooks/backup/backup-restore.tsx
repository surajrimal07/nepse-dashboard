import z from "@nepse-dashboard/zod";
import { useTheme } from "next-themes";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { track } from "@/lib/analytics";
import { useDashboardState } from "@/state/dashboard-state";
import { generalState } from "@/state/general-state";
import { sidebarDashboardState } from "@/state/sidepanel-state";
import { Env, EventName } from "@/types/analytics-types";
import type { BackupData } from "@/types/backup-type";
import { BackupDataSchema } from "@/types/backup-type";
import type { IndexKeys } from "@/types/indexes-type";
import type { modeType } from "@/types/search-type";
import { useAppState } from "../use-app";
import { hashData } from "./hash";

export function useBackupRestore() {
	const version = 1;
	const { useStateItem } = useAppState();
	const [isDragging, setIsDragging] = useState(false);

	const { theme, setTheme } = useTheme();

	const [stockScrollingInSidepanel, setStockScrollingInSidepanel] =
		useStateItem("stockScrollingInSidepanel");

	const [notification, setNotification] = useStateItem("notification");

	const [stockScrolling, setStockScrolling] = useStateItem(
		"stockScrollingPopup",
	);
	const [searchMode, setSearchMode] = useStateItem("searchMode");
	const [aiMode, setAiMode] = useStateItem("aiMode");
	const [aiSettings, setAiSettings] = useStateItem("aiSettings");
	const [aiConfig, setAiConfig] = useStateItem("aiConfig");
	const [tmsUrl, setTmsUrl] = useStateItem("tmsUrl");
	const [chartConfig, setChartConfig] = useStateItem("chartConfig");
	const [subscribeConfig, setSubscribeConfig] = useStateItem("subscribeConfig");
	const [autofills, setAutofills] = useStateItem("autofills");
	const [autoSaveNewAccount, setAutoSaveNewAccount] =
		useStateItem("autoSaveNewAccount");
	const [syncPortfolio, setSyncPortfolio] = useStateItem("syncPortfolio");
	const [accounts, setAccounts] = useStateItem("accounts");

	const dashboardState = useDashboardState.getState();
	const sidepanelRoute = sidebarDashboardState.getState();
	const generalStateValue = generalState.getState();

	const createBackup = useCallback(async () => {
		try {
			const backupDataRaw: BackupData = {
				stockScrollingInSidepanel,
				stockScrolling,
				notification,
				searchMode,
				aiMode,
				aiSettings,
				aiConfig,
				tmsUrl,
				chartConfig,
				subscribeConfig,
				autofills,
				autoSaveNewAccount,
				syncPortfolio,
				accounts,
				theme: theme || "system",
				dashboardState,
				sidepanelRoute,
				generalState: generalStateValue,
			};

			const backupData = BackupDataSchema.parse(backupDataRaw);
			const hash = await hashData(backupData);

			const backupPayload = { version, hash, stores: backupData };

			const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;

			a.download = `nepse-dashboard-backup-${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			toast.success("Backup created successfully!");

			void track({
				context: Env.CONTENT,
				eventName: EventName.BACKUP_COMPLETED,
			});
		} catch (error) {
			let errorMessage = "Error creating backup: ";
			if (error instanceof z.ZodError) {
				errorMessage += `Internal validation failed for backup data. Details: ${error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`;
				toast.error(errorMessage);
				console.error(
					"Internal Zod validation failed during backup creation:",
					error,
				);
			} else if (error instanceof Error) {
				errorMessage += error.message;
				toast.error(errorMessage);
			} else {
				errorMessage += String(error);
				toast.error(errorMessage);
			}

			void track({
				context: Env.CONTENT,
				eventName: EventName.BACKUP_FAILED,
				params: {
					error: error instanceof Error ? error.message : String(error),
				},
			});
		}
	}, [
		accounts,
		autofills,
		autoSaveNewAccount,
		syncPortfolio,
		aiMode,
		aiSettings,
		aiConfig,
		tmsUrl,
		chartConfig,
		subscribeConfig,
		stockScrolling,
		stockScrollingInSidepanel,
		notification,
		theme,
	]);

	const restoreBackup = useCallback(
		async (file: File) => {
			try {
				const rawData = JSON.parse(await file.text());

				const { version: fileVersion, hash: expectedHash, stores } = rawData;

				if (fileVersion !== version) {
					console.warn("Backup version mismatch. Restoring anyway.");
				}

				const actualHash = await hashData(stores);
				if (expectedHash !== actualHash) {
					toast.error("Backup integrity check failed. Restore aborted.");
					return;
				}

				const backupToRestore = BackupDataSchema.parse(stores);

				useDashboardState.setState(backupToRestore.dashboardState);
				sidebarDashboardState.setState(backupToRestore.sidepanelRoute);
				generalState.setState(backupToRestore.generalState);

				if (backupToRestore.accounts) {
					setAccounts(backupToRestore.accounts);
				}

				if (backupToRestore.searchMode !== undefined) {
					setSearchMode(backupToRestore.searchMode as modeType);
				}

				if (backupToRestore.aiMode !== undefined) {
					setAiMode(backupToRestore.aiMode);
				}

				if (backupToRestore.aiSettings !== undefined) {
					setAiSettings(backupToRestore.aiSettings);
				}

				if (backupToRestore.aiConfig !== undefined) {
					setAiConfig(backupToRestore.aiConfig);
				}

				if (backupToRestore.tmsUrl !== undefined) {
					setTmsUrl(backupToRestore.tmsUrl);
				}

				if (backupToRestore.chartConfig !== undefined) {
					setChartConfig({
						customUrl: backupToRestore.chartConfig.customUrl,
						chartSite: backupToRestore.chartConfig.chartSite,
					});
				}

				if (backupToRestore.subscribeConfig !== undefined) {
					setSubscribeConfig({
						indexCharts: backupToRestore.subscribeConfig
							.indexCharts as IndexKeys[],
						stockCharts: backupToRestore.subscribeConfig.stockCharts,
						marketDepth: backupToRestore.subscribeConfig.marketDepth,
					});
				}

				if (backupToRestore.autofills !== undefined) {
					setAutofills(backupToRestore.autofills);
				}

				if (backupToRestore.autoSaveNewAccount !== undefined) {
					setAutoSaveNewAccount(backupToRestore.autoSaveNewAccount);
				}

				if (backupToRestore.syncPortfolio !== undefined) {
					setSyncPortfolio(backupToRestore.syncPortfolio);
				}

				if (theme && theme !== backupToRestore.theme) {
					setTheme(backupToRestore.theme);
				}

				if (
					backupToRestore.stockScrolling !== undefined &&
					stockScrolling !== backupToRestore.stockScrolling
				) {
					setStockScrolling(backupToRestore.stockScrolling);
				}

				if (
					backupToRestore.stockScrollingInSidepanel !== undefined &&
					stockScrollingInSidepanel !==
						backupToRestore.stockScrollingInSidepanel
				) {
					setStockScrollingInSidepanel(
						backupToRestore.stockScrollingInSidepanel,
					);
				}

				toast.success("Settings restored successfully!");
				void track({
					context: Env.CONTENT,
					eventName: EventName.RESTORE_COMPLETED,
				});
			} catch (error) {
				let errorMessage = "Error restoring backup: ";
				if (error instanceof z.ZodError) {
					errorMessage += `Validation failed. Details: ${error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`;
				} else if (error instanceof Error) {
					errorMessage += error.message;
				} else {
					errorMessage += String(error);
				}

				toast.error(errorMessage);

				void track({
					context: Env.CONTENT,
					eventName: EventName.RESTORE_FAILED,
				});
			}
		},
		[
			setAccounts,
			setSearchMode,
			setAiMode,
			setAiSettings,
			setAiConfig,
			setTmsUrl,
			setChartConfig,
			setSubscribeConfig,
			setAutofills,
			setAutoSaveNewAccount,
			setSyncPortfolio,
			setTheme,
			setStockScrolling,
			setStockScrollingInSidepanel,
			setNotification,
			theme,
		],
	);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback(() => {
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			const file = e.dataTransfer.files[0];
			if (file?.type === "application/json") {
				restoreBackup(file);
			} else {
				toast.error("Please provide a valid JSON backup file");
			}
		},
		[restoreBackup],
	);

	return {
		isDragging,
		createBackup,
		restoreBackup,
		handleDragOver,
		handleDragLeave,
		handleDrop,
	};
}
