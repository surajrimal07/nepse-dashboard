import { cn } from "@nepse-dashboard/ui/lib/utils";

interface LoadingDotsProps {
	className?: string;
}

export default function LoadingDots({ className }: LoadingDotsProps) {
	return (
		<div className="fixed inset-0 z-50 w-full h-full flex items-center justify-center p-2">
			<div className="w-full max-w-md">
				<div className="flex flex-col items-center text-center space-y-4">
					<div
						className={cn(
							"flex items-center justify-center gap-[3px]",
							className,
						)}
					>
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={i}
								className="h-1.5 w-1 animate-bounce rounded-full bg-black dark:bg-white"
								style={{ animationDelay: `${i * 0.2}s` }}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
