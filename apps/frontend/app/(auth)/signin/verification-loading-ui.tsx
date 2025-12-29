"use client";

import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@nepse-dashboard/ui/components/card";

export default function VerificationLoadingUI() {
	return (
		<div className="w-full max-w-md mx-auto">
			<Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl">
				<CardHeader className="text-center space-y-4 pb-6">
					<div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
						<div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-white"></div>
					</div>
					<div className="space-y-2">
						<CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
							Verifying Extension
						</CardTitle>
						<CardDescription className="text-gray-600 dark:text-gray-400">
							Please wait while we verify your extension request
						</CardDescription>
					</div>
				</CardHeader>
			</Card>
		</div>
	);
}
