import { LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginProps {
	isDark: boolean;
}

export default function LoginRequired({ isDark }: LoginProps) {
	return (
		<div className="w-full h-full flex items-center justify-center p-6">
			<div className="w-full max-w-md">
				<div className="flex flex-col items-center text-center space-y-4">
					<div className="p-3 rounded-full">
						<LogIn
							className={cn(
								"w-10 h-10",
								isDark ? "text-blue-300" : "text-blue-600",
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
							Login Required
						</h2>
						<p
							className={cn(
								"text-sm leading-relaxed",
								isDark ? "text-zinc-200" : "text-slate-800",
							)}
						>
							Please login to use the AI search feature. Open the extension
							sidepanel or popup to sign in.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
