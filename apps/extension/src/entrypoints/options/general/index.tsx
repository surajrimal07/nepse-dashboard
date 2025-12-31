import { Button } from "@nepse-dashboard/ui/components/button";
import { CardContent } from "@nepse-dashboard/ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@nepse-dashboard/ui/components/dialog";
import { Input } from "@nepse-dashboard/ui/components/input";
import { Label } from "@nepse-dashboard/ui/components/label";
import { Separator } from "@nepse-dashboard/ui/components/separator";
import { Switch } from "@nepse-dashboard/ui/components/switch";
import { Download, RotateCcw, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { browser } from "#imports";
import { BackupRestoreUI } from "@/components/backup/backup";
import Loading from "@/components/loading";
import { useBackupRestore } from "@/hooks/backup/backup-restore";
import { handleActionResult } from "@/hooks/handle-action";
import { useAppState } from "@/hooks/use-app";
import { useUser } from "@/hooks/useUser";
import { track } from "@/lib/analytics";
import { Env, EventName } from "@/types/analytics-types";

export default function GeneralSettings() {
	const { useStateItem, callAction } = useAppState();
	const { theme, setTheme } = useTheme();
	const { logout, isLoading } = useUser();

	const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
	const [deleteText, setDeleteText] = useState("");

	const [notificationEnabled] = useStateItem("notification");

	const [connectionStatus] = useStateItem("userLatency");

	const { createBackup } = useBackupRestore();

	const toggleTheme = useCallback(() => {
		const newTheme = theme === "dark" ? "light" : "dark";

		setTheme(newTheme);
	}, [theme, setTheme]);

	const handleNotificationToggle = useCallback(
		(async (enabled: boolean) => {
			await callAction("setNotification", enabled).then(handleActionResult);
		}) as (enabled: boolean) => Promise<void>,
		[callAction],
	);

	const handleResetSettings = useCallback(async () => {
		try {
			if (deleteText.toLowerCase() !== "delete") {
				toast.error("Please type 'delete' to confirm");
				return;
			}

			void track({
				context: Env.OPTIONS,
				eventName: EventName.RESET_REQUESTED,
			});

			toast.info("Creating backup before resetting...");

			setIsResetDialogOpen(false);
			setDeleteText("");

			await createBackup(); // not sure if its a good idea to create a backup before resetting, but lets do it for now

			toast.loading("Resetting extension...");

			logout();

			localStorage.clear(); // clear local storage
			await browser.storage.local.clear(); // clear extension storage

			void track({
				context: Env.OPTIONS,
				eventName: EventName.RESET_COMPLETED,
			});

			setTimeout(() => {
				window.location.reload();
			}, 2500);
		} catch (error) {
			toast.error(`Error resetting extension: ${error}`);

			void track({
				context: Env.OPTIONS,
				eventName: EventName.RESET_FAILED,
				params: {
					error: error instanceof Error ? error.message : String(error),
				},
			});
		}
	}, [deleteText, logout, createBackup]);

	const handleReloadExtension = useCallback(() => {
		try {
			toast.loading("Reloading extension...");
			void track({
				context: Env.OPTIONS,
				eventName: EventName.RELOAD_REQUESTED,
			});

			setTimeout(() => {
				browser.runtime.reload();
				window.close();
			}, 1000);
		} catch (error) {
			void track({
				context: Env.OPTIONS,
				eventName: EventName.RELOAD_FAILED,
				params: {
					error: error instanceof Error ? error.message : String(error),
				},
			});

			toast.error(`Error reloading extension: ${error}`);
		}
	}, []);

	const handleCheckUpdate = useCallback(() => {
		try {
			chrome.runtime.requestUpdateCheck((status, details) => {
				if (status === "update_available") {
					toast.success(`Update available: ${details?.version}`);
				} else if (status === "no_update") {
					toast.info("No updates available");
				} else if (status === "throttled") {
					toast.info("Please try again later");
				}
			});
			void track({
				context: Env.OPTIONS,
				eventName: EventName.UPDATE_CHECKED,
			});
		} catch (error) {
			toast.error(`Error checking for updates: ${error}`);

			void track({
				context: Env.OPTIONS,
				eventName: EventName.UPDATE_CHECK_ERROR,
				params: {
					error: error instanceof Error ? error.message : String(error),
				},
			});
		}
	}, []);

	if (isLoading) {
		return <Loading />;
	}

	return (
		<CardContent className="space-y-6 mt-2">
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label className="text-base">Dark Theme</Label>
						<p className="text-sm text-muted-foreground">
							Enable dark mode for the extension
						</p>
					</div>
					<Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
				</div>
				<Separator />

				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label className="text-base">Notifications</Label>
						<p className="text-sm text-muted-foreground">
							Enable browser notifications
						</p>
					</div>
					<Switch
						checked={notificationEnabled}
						onCheckedChange={handleNotificationToggle}
					/>
				</div>

				<Separator />

				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label className="text-base">Connection Status</Label>
						<p className="text-sm text-muted-foreground">
							Server latency:{" "}
							<span className="font-mono">{connectionStatus.latency} ms</span>
						</p>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between">
				<div className="space-y-0.5">
					<Label className="text-base font-medium">Reload Extension</Label>
					<p className="text-sm text-muted-foreground">
						Restart the extension without closing the browser
					</p>
				</div>
				<Button variant="outline" size="sm" onClick={handleReloadExtension}>
					<RotateCcw className="mr-2 h-4 w-4" />
					Reload
				</Button>
			</div>

			<div className="flex items-center justify-between">
				<div className="space-y-0.5">
					<Label className="text-base font-medium">Check for Updates</Label>
					<p className="text-sm text-muted-foreground">
						Check if a new version is available
					</p>
				</div>
				<Button variant="outline" size="sm" onClick={handleCheckUpdate}>
					<Download className="mr-2 h-4 w-4" />
					Check Updates
				</Button>
			</div>

			<BackupRestoreUI />

			<div className="flex items-center justify-between">
				<div className="space-y-0.5">
					<Label className="text-base font-medium">Reset Extension</Label>
					<p className="text-sm text-muted-foreground">
						Reset all extension settings to default. This action cannot be
						undone.
					</p>
				</div>
				<Button
					variant="destructive"
					size="sm"
					onClick={() => setIsResetDialogOpen(true)}
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Reset
				</Button>
			</div>

			<Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-destructive">
							⚠️ Dangerous Action
						</DialogTitle>
						<DialogDescription className="space-y-4">
							<p className="pt-2">
								This will permanently delete all your settings, saved accounts,
								and preferences. This action cannot be undone.
							</p>
							<div className="space-y-2">
								<Label htmlFor="reset-confirm" className="text-sm font-medium">
									Type{" "}
									<span className="font-mono bg-muted px-1 rounded">
										delete
									</span>{" "}
									to confirm
								</Label>
								<Input
									id="reset-confirm"
									value={deleteText}
									onChange={(e) => setDeleteText(e.target.value)}
									className="w-full"
									placeholder="Type 'delete' to confirm"
								/>
							</div>
							<div className="flex gap-2 justify-end pt-4">
								<Button
									variant="outline"
									onClick={() => {
										setIsResetDialogOpen(false);
										setDeleteText("");
									}}
								>
									Cancel
								</Button>
								<Button
									variant="destructive"
									onClick={handleResetSettings}
									disabled={deleteText.toLowerCase() !== "delete"}
								>
									Reset Extension
								</Button>
							</div>
						</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		</CardContent>
	);
}
