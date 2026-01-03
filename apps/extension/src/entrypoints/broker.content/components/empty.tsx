import { Button } from "@nepse-dashboard/ui/components/button";
import { ExternalLink } from "lucide-react";
import { memo } from "react";
import { useSidepanel } from "@/hooks/open-sidepanel";
import { useAppState } from "@/hooks/use-app";
import { track } from "@/lib/analytics";
import { sendMessage } from "@/lib/messaging/extension-messaging";
import { Env, EventName } from "@/types/analytics-types";
import { logger } from "@/utils/logger";

export const EmptyAccountsState = memo(() => {
	const { callAction } = useAppState();

	const { open, openSidepanel } = useSidepanel();

	const handleOpenSidepanel = async () => {
		try {
			await openSidepanel();
			sendMessage("goToRoute", { route: "/account" });
			await callAction("setIsAddingAccount", true);
		} catch (error) {
			void track({
				context: Env.CONTENT,
				eventName: EventName.UNABLE_TO_OPEN_SIDE_PANEL,
				params: { error: error as string, location: "broker-content-app" },
			});

			logger.info("Error opening sidepanel");
		}
	};

	return (
		<div className="text-center p-5 px-4 text-gray-500 bg-gray-50 rounded-md border border-dashed border-gray-300">
			<div className="text-lg mb-1">📋</div>
			<p className="m-0 mb-1 font-semibold text-gray-700 text-sm">
				No accounts saved
			</p>
			<p className="m-0 mb-2 text-xs">
				{open
					? "Sidepanel is open - Go to Accounts tab to add"
					: "Open sidepanel to add your account"}
			</p>
			{!open && (
				<Button
					onClick={handleOpenSidepanel}
					size="sm"
					variant="outline"
					className="h-7 text-xs mt-1"
				>
					<ExternalLink className="h-3 w-3 mr-1" />
					Open Sidepanel
				</Button>
			)}
		</div>
	);
});
