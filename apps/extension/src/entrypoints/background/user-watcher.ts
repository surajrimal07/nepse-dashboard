import type { getUser } from "@/lib/storage/user-storage";
import { watchUser } from "@/lib/storage/user-storage";

type UserHandler = (user: Awaited<ReturnType<typeof getUser>>) => void;

class UserWatcher {
	private handlers = new Set<UserHandler>();
	private unwatch: (() => void) | null = null;

	start() {
		if (this.unwatch) return;

		this.unwatch = watchUser((user) => {
			for (const h of this.handlers) h(user);
		});
	}

	subscribe(handler: UserHandler) {
		this.start();
		this.handlers.add(handler);
		return () => this.handlers.delete(handler);
	}

	stop() {
		this.unwatch?.();
		this.unwatch = null;
		this.handlers.clear();
	}
}

export const userWatcher = new UserWatcher();
