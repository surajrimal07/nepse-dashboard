"use client";

import { Lock, ShieldCheck, UserCheck } from "lucide-react";

function RequiresLogin() {
	return (
		<div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
			<div className="max-w-lg w-full">
				<div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl">
					<div className="flex justify-center mb-6">
						<div className="relative">
							<div className="absolute inset-0 bg-neutral-700/20 blur-2xl rounded-full" />
							<div className="relative bg-neutral-800 p-4 rounded-2xl">
								<ShieldCheck className="w-12 h-12 text-neutral-200" />
							</div>
						</div>
					</div>
					<h2 className="text-2xl font-bold text-center mb-3 text-neutral-100">
						Authentication Required
					</h2>

					<div className="space-y-4 mb-6">
						<p className="text-neutral-400 text-center leading-relaxed">
							Please log in to the Nepse Dashboard extension to access the AI
							chat feature.
						</p>

						<div className="bg-neutral-800/70 border border-neutral-700 rounded-xl p-4">
							<div className="flex items-start gap-3">
								<Lock className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
								<div className="space-y-1">
									<p className="text-sm font-medium text-neutral-300">
										Why do we need authentication?
									</p>
									<ul className="text-xs text-neutral-400 space-y-1 list-disc list-inside">
										<li>Prevent platform abuse & exploitation</li>
										<li>Ensure fair usage for all users</li>
										<li>Protect your data & conversations</li>
										<li>Enable personalized features</li>
									</ul>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-4">
						<div className="flex items-center gap-3">
							<div className="bg-neutral-700/30 p-2 rounded-lg">
								<UserCheck className="w-5 h-5 text-neutral-400" />
							</div>
							<div className="flex-1">
								<p className="text-sm font-medium text-neutral-300">
									How to log in?
								</p>
								<p className="text-xs text-neutral-400 mt-1">
									Open the Nepse Dashboard extension and sign in with your
									account
								</p>
							</div>
						</div>
					</div>

					<div className="mt-6 flex items-center justify-center gap-2 text-sm text-neutral-500">
						<div className="relative flex h-2 w-2">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
							<span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
						</div>
						Waiting for authentication...
					</div>
				</div>

				<p className="text-center text-neutral-600 text-xs mt-4">
					Don't have an account?{" "}
					<span className="text-neutral-400">Sign up in the extension</span>
				</p>
			</div>
		</div>
	);
}

export default RequiresLogin;
