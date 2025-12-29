interface ChatDisabledProps {
	type: "ai-chat" | "community-chat";
}

export default function ChatDisabled({ type }: ChatDisabledProps) {
	const isAiChat = type === "ai-chat";
	const chatName = isAiChat ? "AI Chat" : "Community Chat";
	const toggleName = isAiChat ? "AI Chat" : "Community Chat";

	return (
		<div className="w-full mt-2 h-full flex items-center justify-center p-6 rounded-lg ">
			<div className="text-center">
				<h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
					{chatName} feature is Disabled
				</h3>
				<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
					You can enable {chatName} feature from the menu by toggling{" "}
					<span className="font-semibold text-red-600 dark:text-red-400">
						&quot;
						{toggleName}
						&quot;
					</span>
					.
				</p>
			</div>
		</div>
	);
}
