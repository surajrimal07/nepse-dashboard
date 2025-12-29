import { Button } from "@nepse-dashboard/ui/components/button";
import { LogIn } from "lucide-react";
import { useSidepanel } from "@/hooks/open-sidepanel";
import useScreenView from "@/hooks/usePageView";

export default function LoginRequired() {
	const { open, openSidepanel } = useSidepanel();

	useScreenView("/news-login-required", "News Login Required");

	return (
		<div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
			<div className="flex flex-col items-center text-center space-y-4">
				<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
					<LogIn className="w-8 h-8 text-blue-600" />
				</div>

				<div className="space-y-2">
					<h3 className="text-lg font-semibold text-gray-900">
						Login Required
					</h3>
					<p className="text-sm text-gray-600 max-w-md">
						Please login to use the news analysis feature. Open the sidepanel or
						popup to sign in.
					</p>
				</div>

				<Button
					variant="default"
					size="sm"
					onClick={openSidepanel}
					className="mt-2"
					disabled={open}
				>
					<LogIn className="w-4 h-4 mr-2" />
					{open ? "Sidepanel Opened" : "Open Sidepanel to Login"}
				</Button>

				<p className="text-xs text-gray-500">
					{open
						? "Sidepanel opened—finish login inside the extension."
						: "Click the button above or use the extension icon to access login"}
				</p>
			</div>
		</div>
	);
}
