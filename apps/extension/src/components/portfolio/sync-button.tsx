import { Button } from "@nepse-dashboard/ui/components/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

interface SyncButtonProps {
	onClick: () => void;
}

export function SyncButton({ onClick }: SyncButtonProps) {
	const [isAnimating, setIsAnimating] = useState(false);

	const handleClick = () => {
		setIsAnimating(true);
		onClick();

		// Reset animation after completion
		setTimeout(() => {
			setIsAnimating(false);
		}, 1000);
	};

	return (
		<Button
			className="flex items-center gap-2 rounded-full shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90"
			onClick={handleClick}
			size="sm"
		>
			<RefreshCw className={`h-4 w-4 ${isAnimating ? "animate-spin" : ""}`} />
			<span>Sync</span>
		</Button>
	);
}
