import { createLazyRoute } from "@tanstack/react-router";
import { BackupRestoreUI } from "@/components/backup/backup";
import BackButton from "../back-button/back-button";

export const Route = createLazyRoute("/backup")({
	component: BackupRestore,
});

export default function BackupRestore() {
	return (
		<div className="fixed h-full top-0 left-0 right-0 z-50 bg-background rounded-lg text-gray-100 p-6 ">
			<BackupRestoreUI />
			<BackButton showBack={true} />
		</div>
	);
}
