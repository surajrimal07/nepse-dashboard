"use client";

import { Button } from "@nepse-dashboard/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@nepse-dashboard/ui/components/card";
import { Chrome, Clock, Shield } from "lucide-react";
import { APP_NAME } from "@/constants/constants";

export default function SiteLoginDisabled() {
	return (
		<div className="w-full max-w-md mx-auto">
			<Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl">
				<CardHeader className="text-center space-y-4 pb-6">
					<div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg">
						<Clock className="w-10 h-10 text-white" />
					</div>
					<div className="space-y-2">
						<CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
							Site Login Temporarily Disabled
						</CardTitle>
						<CardDescription className="text-gray-600 dark:text-gray-400 leading-relaxed">
							We&apos;re enhancing our authentication system to provide you with
							a better and more secure experience.
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="space-y-6 px-6">
					<div className="space-y-4">
						<div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
							<div className="flex items-start space-x-3">
								<div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
									<Shield className="w-4 h-4 text-white" />
								</div>
								<div>
									<h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
										Enhanced Security
									</h4>
									<p className="text-sm text-blue-700 dark:text-blue-300">
										We&apos;re implementing additional security measures to keep
										your account safe.
									</p>
								</div>
							</div>
						</div>

						<div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 border border-green-200/50 dark:border-green-800/50">
							<div className="flex items-start space-x-3">
								<div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
									<Chrome className="w-4 h-4 text-white" />
								</div>
								<div>
									<h4 className="font-semibold text-sm text-green-900 dark:text-green-100 mb-1">
										{APP_NAME} Available
									</h4>
									<p className="text-sm text-green-700 dark:text-green-300">
										You can still access your account through our browser
										extension.
									</p>
								</div>
							</div>
						</div>
					</div>

					<div className="text-center space-y-4">
						<div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 px-4 py-3 rounded-full border border-amber-200/50 dark:border-amber-800/50">
							<div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
							<span className="text-sm font-medium text-amber-700 dark:text-amber-300">
								Expected to return soon
							</span>
						</div>

						<p className="text-xs text-gray-500 dark:text-gray-400">
							We appreciate your patience as we work to improve your experience.
						</p>
					</div>

					<Button
						variant="outline"
						className="w-full h-11 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02]"
						onClick={() => window.location.reload()}
					>
						<span className="flex items-center justify-center space-x-2">
							<Clock className="w-4 h-4" />
							<span>Check Again</span>
						</span>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
