import { browser } from "#imports";
import { logger } from "@/utils/logger";

type CleanupFn = () => void | Promise<void>;

class SuspensionManager {
	private cleanups = new Set<CleanupFn>();
	private initialized = false;

	init() {
		if (this.initialized) return;
		this.initialized = true;

		browser.runtime.onSuspend.addListener(async () => {
			for (const cleanup of this.cleanups) {
				try {
					await cleanup();
				} catch (e) {
					logger.error("Suspend cleanup failed", e);
				}
			}
			this.cleanups.clear();
		});
	}

	register(fn: CleanupFn) {
		this.init();
		this.cleanups.add(fn);
		return () => this.cleanups.delete(fn);
	}
}

export const suspensionManager = new SuspensionManager();
