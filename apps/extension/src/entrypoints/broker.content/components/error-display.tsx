import { Button } from "@nepse-dashboard/ui/components/button";

interface ErrorDisplayProps {
	title: string;
	message: string;
	buttonText: string;
	onButtonClick: () => void;
	icon?: string;
	variant?: "error" | "warning" | "info";
}

export function ErrorDisplay({
	title,
	message,
	buttonText,
	onButtonClick,
	icon = "⚠️",
	variant = "error",
}: ErrorDisplayProps) {
	const buttonStyles = {
		error: "bg-red-600 hover:bg-red-700 text-white",
		warning: "bg-orange-600 hover:bg-orange-700 text-white",
		info: "bg-blue-600 hover:bg-blue-700 text-white",
	};

	return (
		<div className="p-4 bg-white rounded-b-xl">
			<div className="text-center space-y-4">
				<div className="text-4xl">{icon}</div>
				<div>
					<h3
						className={`text-lg font-bold mb-2 ${variant === "error" ? "text-red-800" : variant === "warning" ? "text-orange-800" : "text-blue-800"}`}
					>
						{title}
					</h3>
					<p
						className={`text-sm leading-relaxed ${variant === "error" ? "text-red-700" : variant === "warning" ? "text-orange-700" : "text-blue-700"}`}
					>
						{message}
					</p>
				</div>
				<Button
					onClick={onButtonClick}
					size="sm"
					className={`font-medium transition-colors ${buttonStyles[variant]}`}
				>
					{buttonText}
				</Button>
			</div>
		</div>
	);
}
