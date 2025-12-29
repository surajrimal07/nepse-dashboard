import { suspensionManager } from "@/entrypoints/background/suspension-manager";
import { userWatcher } from "@/entrypoints/background/user-watcher";
import { OP } from "@/lib/analytics/op";

let unsubscribe: (() => void) | null = null;
let registered = false;

export function autoIdentify() {
	// Stop previous watcher if any
	unsubscribe?.();

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
