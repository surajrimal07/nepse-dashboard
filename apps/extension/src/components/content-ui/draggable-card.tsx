import { Card } from "@nepse-dashboard/ui/components/card";
import type { ReactElement } from "react";
import { ContentErrorBoundary } from "@/components/content-error-boundary";
import { ContentSuspense } from "@/components/content-suspense";
import { cn } from "@/lib/utils";
import { initDragManager } from "./drag-manager";
import { useDragCardState } from "./store";

interface DraggableCardProps {
	children: ReactElement;
	className?: string;
	padding?: "sm" | "md" | "lg";
	variant?: "default" | "error" | "warning" | "info";
	borderWidth?: "normal" | "thick";
	rounded?: "default" | "large";
	showDragHandle?: boolean;
}

const paddingVariants = {
	sm: "p-1",
	md: "p-4",
	lg: "p-6",
};

const variantStyles = {
	default: "bg-white border-gray-300",
	error: "bg-red-50 border-red-200",
	warning: "bg-orange-50 border-orange-200",
	info: "bg-blue-50 border-blue-200",
};

const borderWidthVariants = {
	normal: "border",
	thick: "border-2",
};

const roundedVariants = {
	default: "rounded-xl",
	large: "rounded-2xl",
};

export function DraggableCard({
	children,
	className,
	padding = "sm",
	variant = "default",
	borderWidth = "normal",
	rounded = "default",
	showDragHandle = true,
}: DraggableCardProps) {
	const cleanupRef = useRef<(() => void) | null>(null);
	const isDragging = useDragCardState((state) => state.isDragging);

	const elementRef = (element: HTMLDivElement | null) => {
		cleanupRef.current?.();
		cleanupRef.current = element ? initDragManager(element) : null;
	};

	const scale = isDragging ? 1.02 : 1;

	return (
		<Card
			ref={elementRef}
			className={cn(
				"w-80 max-w-sm shadow-xl",
				"fixed transition-transform duration-200 ease-out",
				paddingVariants[padding],
				variantStyles[variant],
				borderWidthVariants[borderWidth],
				roundedVariants[rounded],
				isDragging ? "select-none" : "",
				className,
			)}
			style={{
				zIndex: 10000,
				transform: `scale(${scale})`,
				transition: isDragging ? "none" : "transform 200ms ease-out",
			}}
		>
			{showDragHandle && (
				<div
					className={cn(
						"absolute top-0 left-0 right-0 h-8 cursor-grab active:cursor-grabbing",
						rounded === "large" ? "rounded-t-2xl" : "rounded-t-xl",
					)}
					data-drag-handle
				/>
			)}
			<ContentErrorBoundary>
				<ContentSuspense>{children}</ContentSuspense>
			</ContentErrorBoundary>
		</Card>
	);
}
