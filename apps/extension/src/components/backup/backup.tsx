import { Button } from "@nepse-dashboard/ui/components/button";
import { Download, RotateCcw, Upload } from "lucide-react";
import { useBackupRestore } from "@/hooks/backup/backup-restore";
import { cn } from "@/lib/utils";

export function BackupRestoreUI() {
	const {
		isDragging,
		createBackup,
		restoreBackup,
		handleDragOver,
		handleDragLeave,
		handleDrop,
	} = useBackupRestore();

	return (
		<div className="space-y-4 pt-2">
			<div className="flex items-center gap-2">
				<RotateCcw className="h-5 w-5" />
				<h3 className="text-lg font-medium">Backup & Restore</h3>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<div className="rounded-lg border bg-card p-4">
					<h4 className="font-medium mb-2 flex items-center gap-2">
						<Download className="h-4 w-4" />
						Create Backup
					</h4>
					<p className="text-sm text-muted-foreground mb-4">
						Download a JSON format unencrypted backup of your settings,
						preferences and account data. Please note it will not include your
						chat history.
					</p>
					<Button onClick={createBackup} className="w-full" variant="outline">
						<Download className="mr-2 h-4 w-4" />
						Download Backup
					</Button>
				</div>

				<div className="rounded-lg border bg-card p-4">
					<h4 className="font-medium mb-2 flex items-center gap-2">
						<Upload className="h-4 w-4" />
						Restore Settings
					</h4>
					<p className="text-sm text-muted-foreground mb-4">
						Restore your settings from a backup file. This will not wipe your
						existing settings, it will try to merge it and skip the duplicate
						items.
					</p>

					{/** biome-ignore lint/a11y/noStaticElementInteractions: <vv> */}
					<div
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						className={cn(
							"border-2 border-dashed rounded-md p-4 text-center transition-colors cursor-pointer",
							isDragging
								? "border-primary bg-primary/10"
								: "border-muted hover:border-muted-foreground",
						)}
					>
						<input
							type="file"
							accept=".json"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) restoreBackup(file);
							}}
							className="hidden"
							id="restore-input"
							onClick={(e) => {
								(e.target as HTMLInputElement).value = "";
							}}
						/>
						<label
							htmlFor="restore-input"
							className="flex flex-col items-center cursor-pointer"
						>
							<Upload className="h-6 w-6 mb-2 text-muted-foreground" />
							<span
								className={cn(
									"text-sm text-muted-foreground",
									isDragging && "text-primary",
								)}
							>
								{isDragging
									? "Drop your backup file here"
									: "Drop backup file here or click to select"}
							</span>
						</label>
					</div>
				</div>
			</div>
		</div>
	);
}
