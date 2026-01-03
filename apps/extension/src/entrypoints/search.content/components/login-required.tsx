import { LogIn } from "lucide-react";

export default function LoginRequired() {
	return (
		<div className="w-full h-full flex items-center justify-center p-6">
			<div className="w-full max-w-md">
				<div className="flex flex-col items-center text-center space-y-4">
					<div className="p-3 rounded-full">
						<LogIn className="w-10 h-10 text-blue-300" />
					</div>
					<div className="space-y-2">
						<h2 className="text-xl font-bold text-zinc-200">
							Login Required
						</h2>
						<p className="text-sm leading-relaxed text-zinc-200">
							Please login to use the AI search feature. Open the extension
							sidepanel or popup to sign in.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
