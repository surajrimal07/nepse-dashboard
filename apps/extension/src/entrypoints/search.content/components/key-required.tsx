import { KeyRound } from "lucide-react";

export default function KeyRequired() {
	return (
		<div className="w-full h-full flex items-center justify-center p-6">
			<div className="w-full max-w-md">
				<div className="flex flex-col items-center text-center space-y-4">
					<div className="p-3 rounded-full">
						<KeyRound className="w-10 h-10 text-yellow-400" />
					</div>
					<div className="space-y-2">
						<h2 className="text-xl font-bold text-zinc-200">
							API Key Required
						</h2>
						<p className="text-sm leading-relaxed text-zinc-200">
							Please add your API key to use this feature.
							<br />
							Open the extension sidepanel or popup to enter your key.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
