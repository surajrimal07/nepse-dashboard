import { KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

export default function KeyRequired({ isDark }: { isDark: boolean }) {
	return (
		<div className="w-full h-full flex items-center justify-center p-6">
			<div className="w-full max-w-md">
				<div className="flex flex-col items-center text-center space-y-4">
					<div className="p-3 rounded-full">
						<KeyRound
							className={cn(
								"w-10 h-10",
								isDark ? "text-yellow-400" : "text-yellow-500",
							)}
						/>
					</div>
					<div className="space-y-2">
						<h2
							className={cn(
								"text-xl font-bold",
								isDark ? "text-zinc-200" : "text-slate-800",
							)}
						>
							API Key Required
						</h2>
						<p
							className={cn(
								"text-sm leading-relaxed",
								isDark ? "text-zinc-200" : "text-slate-800",
							)}
						>
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
