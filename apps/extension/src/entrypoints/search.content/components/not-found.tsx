import { AlertCircle } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

interface NotFoundProps {
	isDark: boolean;
}

const NotFound: React.FC<NotFoundProps> = ({ isDark }) => {
	return (
		<div className="w-full h-full flex items-center justify-center p-6">
			<div className="w-full max-w-md">
				<div className="flex flex-col items-center text-center space-y-4">
					<div className="p-3 rounded-full">
						<AlertCircle
							className={cn(
								"w-10 h-10",
								isDark ? "text-red-400" : "text-red-500",
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
							No companies were found for the query
						</h2>
						<p
							className={cn(
								"text-sm leading-relaxed",
								isDark ? "text-zinc-200" : "text-slate-800",
							)}
						>
							Please try again, type a company symbol or name.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NotFound;
