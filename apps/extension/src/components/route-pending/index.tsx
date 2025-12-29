import { Loader2 } from "lucide-react";
import type React from "react";

const RoutePending: React.FC = () => {
	return (
		<div className="min-h-screen bg-black flex items-center justify-center">
			<div className="max-w-md w-full text-center">
				<div className="mb-8 flex justify-center">
					<Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
				</div>
				<div className="mb-8">
					<h2 className="text-2xl font-semibold text-white mb-4">Loading...</h2>
					<p className="text-gray-300 leading-relaxed">
						Please wait while we load the content.
					</p>
				</div>
			</div>
		</div>
	);
};

export default RoutePending;
