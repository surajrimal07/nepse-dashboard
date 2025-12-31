import { browser } from "#imports";
import { getAppState } from "@/entrypoints/background";
import { Env, EventName } from "@/types/analytics-types";
import { Track } from "../analytics/analytics";

interface UserSettingsChange {
	isOnToolbar?: boolean;
}

class PinListener {
	private appState = getAppState();
	private listener: ((changes: UserSettingsChange) => void) | null = null;

	// ---------- analytics helpers ----------

	private track(eventName: EventName, params?: Record<string, unknown>) {
		void Track({
			context: Env.BACKGROUND,
			eventName,
			params,
		});
	}

	private trackError(error: unknown, name = "PinListener") {
		this.track(EventName.PIN_ERROR, {
			error: error instanceof Error ? error.message : String(error),
			name,
		});
	}

	// ---------- state helpers ----------

	private async applyPinState(isPinned: boolean) {
		this.track(isPinned ? EventName.PIN_PINNED : EventName.PIN_NOT_PINNED);

		await this.appState.set({ pin: isPinned });
	}

	private async markNotAvailable() {
		this.track(EventName.PIN_NOT_AVAILABLE);
		await this.appState.set({ pin: false });
	}

	// ---------- core logic ----------

	private async updatePinState() {
		if (!browser.action?.getUserSettings) {
			await this.markNotAvailable();
			return;
		}

		try {
			const { isOnToolbar } = await browser.action.getUserSettings();

			if (typeof isOnToolbar !== "boolean") {
				await this.markNotAvailable();
				return;
			}

			await this.applyPinState(isOnToolbar);
		} catch (error) {
			this.trackError(error);
			await this.appState.set({ pin: false });
		}
	}

	// ---------- lifecycle ----------

	async setup() {
		if (
			!browser.action?.getUserSettings ||
			!browser.action?.onUserSettingsChanged
		) {
			await this.markNotAvailable();
			return;
		}

		// initial sync
		void this.updatePinState();

		this.listener = async ({ isOnToolbar }) => {
			if (typeof isOnToolbar === "boolean") {
				await this.applyPinState(isOnToolbar);
			}
		};

		browser.action.onUserSettingsChanged.addListener(this.listener);
	}

	stop() {
		if (!this.listener) return;

		browser.action.onUserSettingsChanged.removeListener(this.listener);
		this.listener = null;
	}
}

// ---------- singleton wiring ----------

let pinListener: PinListener | null = null;

export function setupPinListener() {
	pinListener ??= new PinListener();
	void pinListener.setup();
}

export function stopPinListener() {
	pinListener?.stop();
}
