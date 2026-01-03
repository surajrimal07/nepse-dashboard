import { suspensionManager } from "@/entrypoints/background/suspension-manager";
import { userWatcher } from "@/entrypoints/background/user-watcher";
import { OP } from "@/lib/analytics/op";
import { IdentifyUser } from "./analytics";

let unsubscribe: (() => void) | null = null;
let registered = false;

export function autoIdentify() {
	// Stop previous watcher if any
	unsubscribe?.();

	//Identify immediately if user is already present
	IdentifyUser();

	// Start new watcher
	unsubscribe = userWatcher.subscribe(async (user) => {
		if (!user) return;

		await OP.identify({
			profileId: user.randomId,
			email: user.email || "Anonymous",
			avatar: user.image || undefined,
		});
	});

	// Register cleanup only once
	if (!registered) {
		registered = true;
		suspensionManager.register(() => {
			unsubscribe?.();
			unsubscribe = null;
		});
	}
}
