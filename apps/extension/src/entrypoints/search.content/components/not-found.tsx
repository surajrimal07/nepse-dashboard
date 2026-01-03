import { AlertCircle } from "lucide-react";
import type React from "react";

const NotFound: React.FC = () => {
	return (
		<div className="w-full h-full flex items-center justify-center p-6">
			<div className="w-full max-w-md">
				<div className="flex flex-col items-center text-center space-y-4">
					<div className="p-3 rounded-full">
						<AlertCircle className="w-10 h-10 text-red-400" />
					</div>
					<div className="space-y-2">
						<h2 className="text-xl font-bold text-zinc-200">
							No companies were found for the query
						</h2>
						<p className="text-sm leading-relaxed text-zinc-200">
							Please try again, type a company symbol or name.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NotFound;
