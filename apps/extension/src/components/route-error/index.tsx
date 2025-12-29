import { Button } from "@nepse-dashboard/ui/components/button";
import { useRouter } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react";
import type React from "react";
import useScreenView from "@/hooks/usePageView";

interface RouteErrorProps {
	error?: Error;
	reset?: () => void;
}

const RouteError: React.FC<RouteErrorProps> = ({ error, reset }) => {
	useScreenView("/error");
	const router = useRouter();

	const handleGoHome = () => {
		router.navigate({ to: "/" });
	};

	const handleGoBack = () => {
		router.history.back();
	};

	const handleRetry = () => {
		if (reset) {
			reset();
		} else {
			window.location.reload();
		}
	};

	return (
		<div className="min-h-screen bg-black flex items-center justify-center">
			<div className="max-w-md w-full text-center">
				<div className="relative mb-8">
					<div className="flex items-center justify-center">
						<AlertTriangle className="w-20 h-20 text-red-500" />
					</div>
				</div>
				<div className="mb-8">
					<h2 className="text-2xl font-semibold text-white mb-4">
						Something Went Wrong
					</h2>
					<p className="text-gray-300 leading-relaxed mb-4">
						We encountered an error while loading this page.
					</p>
					{error && (
						<div className="text-sm text-gray-400 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 font-mono break-all text-left max-h-32 overflow-y-auto">
							<p className="text-red-400 font-semibold mb-1">Error:</p>
							<p>{error.message}</p>
						</div>
					)}
				</div>
				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<Button
						onClick={handleGoBack}
						className="inline-flex items-center justify-center gap-2 px-5 py-3 text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 font-medium"
					>
						<ArrowLeft className="w-4 h-4" />
						Go Back
					</Button>

					<Button
						onClick={handleRetry}
						className="inline-flex items-center justify-center gap-2 px-5 py-3 text-white bg-orange-600 rounded-lg hover:bg-orange-500 transition-all duration-200 font-medium"
					>
						<RefreshCw className="w-4 h-4" />
						Retry
					</Button>

					<Button
						onClick={handleGoHome}
						className="inline-flex items-center justify-center gap-2 px-5 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
					>
						<Home className="w-4 h-4" />
						Go Home
					</Button>
				</div>
			</div>
		</div>
	);
};

export default RouteError;
