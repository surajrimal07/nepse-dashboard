import { useCallback, useState } from "react";
import { track } from "@/lib/analytics";
import { sendMessage } from "@/lib/messaging/extension-messaging";
import { Env, EventName } from "@/types/analytics-types";

export function useSidepanel() {
	const [open, setOpen] = useState(false);

	const openSidepanel = useCallback(async () => {
		try {
			await sendMessage("openSidePanel");
			await new Promise((resolve) => setTimeout(resolve, 2000));
			setOpen(true);
		} catch (error) {
			setOpen(false);

			void track({
				context: Env.CONTENT,
				eventName: EventName.UNABLE_TO_OPEN_SIDE_PANEL,
				params: { error: error as string, location: "useSidepanel" },
			});
		}
	}, []);

	return {
		open,
		setOpen,
		openSidepanel,
	};
}
