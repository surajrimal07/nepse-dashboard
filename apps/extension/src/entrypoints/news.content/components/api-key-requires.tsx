import { Button } from "@nepse-dashboard/ui/components/button";
import { KeyRound } from "lucide-react";
import { useAppState } from "@/hooks/use-app";
import useScreenView from "@/hooks/usePageView";
import { useNewsState } from "../store";

export default function ApiKeyRequired() {
	useScreenView("/api-key-required", "API Key Required");

	const { callAction } = useAppState();
	const goToKeyPage = useNewsState((state) => state.goToKeyPage);

	const handleClick = async () => {
		await callAction(
			"showNotification",
			`Opening Sidpenal to add API key`,
			"info",
		);
		goToKeyPage();
	};

	return (
		<div className="flex items-start gap-2.5 p-3 bg-amber-50 rounded-lg border border-amber-200">
			<div className="shrink-0 mt-0.5">
				<KeyRound size={18} className="text-amber-600" />
			</div>
			<div className="flex-1 min-w-0">
				<h3 className="text-xs font-medium text-gray-900 mb-0.5">
					API Key Required
				</h3>
				<p className="text-xs text-gray-600 leading-snug mb-2">
					This feature requires an LLM API key to work.
				</p>
				<Button
					variant="outline"
					size="sm"
					onClick={handleClick}
					className="h-6 text-xs px-2 py-0 bg-white hover:bg-amber-100 border-amber-300 text-amber-700"
				>
					<KeyRound size={12} className="mr-1" />
					Add Key
				</Button>
			</div>
		</div>
	);
}
