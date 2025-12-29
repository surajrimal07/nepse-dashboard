"use client";

import { Button } from "@nepse-dashboard/ui/components/button";
import { Chrome, Download, RefreshCw } from "lucide-react";

function RequiresExtension() {
	const handleRetry = () => {
		const message = { source: "page", type: "REQUEST_HANDSHAKE" };
		window.parent.postMessage(message, "*");
	};

	return (
		<div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
			<div className="max-w-md w-full">
				<div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl">
					<div className="flex justify-center mb-6">
						<div className="relative">
							<div className="absolute inset-0 bg-neutral-700/20 blur-2xl rounded-full" />
							<div className="relative bg-neutral-800 p-4 rounded-2xl">
								<Chrome className="w-12 h-12 text-neutral-200" />
							</div>
						</div>
					</div>

					<h2 className="text-2xl font-bold text-center mb-3 text-neutral-100">
						Extension Required
					</h2>
					<p className="text-neutral-400 text-center mb-6 leading-relaxed">
						This AI chat feature is designed to work seamlessly with the Nepse
						Dashboard browser extension. Please install the extension to get
						started.
					</p>
					<a
						href="https://link.nepsechatbot.com/review"
						target="_blank"
						rel="noopener noreferrer"
						className="
							block w-full
							bg-neutral-800
							hover:bg-neutral-700
							text-neutral-100 font-medium
							py-1.5 px-6
							rounded-xl
							transition-all duration-200
							border border-neutral-700
							hover:border-neutral-600
							hover:scale-[1.01]
							active:scale-[0.99]
							flex items-center justify-center gap-2
							text-center
						"
					>
						<Download className="w-4 h-4 text-neutral-300" />
						Install Extension
					</a>

					<Button
						type="button"
						onClick={handleRetry}
						className="
							mt-3 w-full
							bg-neutral-800
							hover:bg-neutral-700
							text-neutral-100
							font-medium
							py-2.5 px-6
							rounded-xl
							transition-all duration-200
							border border-neutral-700
							hover:border-neutral-600
							hover:scale-[1.01]
							active:scale-[0.99]
							flex items-center justify-center gap-2
						"
					>
						<RefreshCw className="w-4 h-4 text-neutral-300" />
						Retry Connection
					</Button>
				</div>

				<p className="text-center text-neutral-600 text-xs mt-4">
					After installing, please refresh this page
				</p>
			</div>
		</div>
	);
}
export default RequiresExtension;
