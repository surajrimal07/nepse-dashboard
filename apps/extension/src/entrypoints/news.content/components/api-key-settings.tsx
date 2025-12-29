import { Button } from "@nepse-dashboard/ui/components/button";
import { Key, KeyRound } from "lucide-react";
import { useNewsState } from "../store";

export function ApiKeySettings({ showIcon = true }: { showIcon?: boolean }) {
	const { callAction, useStateItem } = useAppState();
	const [aiSettings] = useStateItem("aiSettings");
	const goToKeyPage = useNewsState((state) => state.goToKeyPage);

	const KeyIcon = aiSettings?.hasKeys ? KeyRound : Key;

	const handleClick = async () => {
		await callAction(
			"showNotification",
			`Opening Sidpenal to edit keys`,
			"info",
		);
		goToKeyPage();
	};

	if (!showIcon) return null;

	return (
		<Button
			size="sm"
			variant="ghost"
			className="h-7 w-7 p-0"
			title={aiSettings?.hasKeys ? "Edit your API Key" : "Add API Key"}
			onClick={handleClick}
		>
			<KeyIcon
				className={`h-3.5 w-3.5 ${aiSettings?.hasKeys ? "text-green-600" : "text-gray-600"}`}
			/>
		</Button>
	);
}
