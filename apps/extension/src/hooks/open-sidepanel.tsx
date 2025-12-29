import { useCallback, useState } from "react";
import { sendMessage } from "@/lib/messaging/extension-messaging";

export function useSidepanel() {
	const [open, setOpen] = useState(false);

	const openSidepanel = useCallback(async () => {
		try {
			await sendMessage("openSidePanel");
			setOpen(true);
		} catch {
			setOpen(false);
		}
	}, []);

	return {
		open,
		setOpen,
		openSidepanel,
	};
}
