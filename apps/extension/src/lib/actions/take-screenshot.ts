import { Env, EventName } from "@/types/analytics-types";
import { Track } from "../analytics/analytics";

export async function takeScreenshot(): Promise<{
	success: boolean;
	message: string;
	data: string | null;
}> {
	const hasPermission = await browser.permissions.contains({
		permissions: ["activeTab"],
	});

	if (!hasPermission) {
		void Track({
			context: Env.BACKGROUND,
			eventName: EventName.PERMISSION_DENIED,
			params: { permission: "activeTab" },
		});

		return {
			success: false,
			message: "ActiveTab permission is not granted.",
			data: null,
		};
	}

	try {
		const win = await browser.windows.getCurrent();

		if (!win?.id) {
			return {
				success: false,
				message: "Unable to get current window.",
				data: null,
			};
		}
		const dataUrl = await browser.tabs.captureVisibleTab(win.id, {
			format: "png",
		});

		void Track({
			context: Env.BACKGROUND,
			eventName: EventName.SCREENSHOT_SUCCESS,
		});

		return {
			success: true,
			message: "Screenshot captured.",
			data: dataUrl,
		};
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to capture screenshot.";

		void Track({
			context: Env.BACKGROUND,
			eventName: EventName.SCREENSHOT_FAILED,
			params: {
				error: message,
			},
		});

		return {
			success: false,
			message,
			data: null,
		};
	}
}
