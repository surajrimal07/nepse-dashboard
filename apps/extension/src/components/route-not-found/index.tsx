import { Button } from "@nepse-dashboard/ui/components/button";
import { useRouter } from "@tanstack/react-router";
import { ArrowLeft, Home, Search } from "lucide-react";
import type React from "react";
import useScreenView from "@/hooks/usePageView";
import { track } from "@/lib/analytics";
import { Env, EventName } from "@/types/analytics-types";

interface NotFoundProps {
	route?: string;
}

const RouteNotFound: React.FC<NotFoundProps> = ({ route }) => {
	const router = useRouter();

	useScreenView("/404");

	const handleGoHome = () => {
		router.navigate({ to: "/" });
	};

	const handleGoBack = () => {
		router.history.back();
	};

	void track({
		context: Env.UNIVERSAL,
		eventName: EventName.LANDED_IN_NOT_FOUND_PAGE,
	});

	return (
		<div className=" bg-black flex items-center justify-center">
			<div className="max-w-md w-full text-center">
				<div className="relative mb-8">
					<h1 className="text-9xl font-bold text-gray-800 select-none">404</h1>
					<div className="absolute inset-0 flex items-center justify-center">
						<Search className="w-16 h-16 text-gray-600" />
					</div>
				</div>
				<div className="mb-8">
					<h2 className="text-2xl font-semibold text-white mb-4">
						Page Not Found
					</h2>
					<p className="text-gray-300 leading-relaxed mb-2">
						Sorry, we couldn't find the page you're looking for.
					</p>
					{route && (
						<p className="text-sm text-gray-400 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 font-mono break-all">
							"{route}" does not exist
						</p>
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

export default RouteNotFound;
