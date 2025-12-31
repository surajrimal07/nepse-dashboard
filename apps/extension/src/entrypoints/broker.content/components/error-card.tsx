// import { Button } from "@nepse-dashboard/ui/components/button";
// import type { Ref } from "react";
// import { DraggableCard } from "@/components/content-ui/draggable-card";

// interface ErrorCardProps {
// 	elementRef: Ref<HTMLDivElement>;
// 	isDragging: boolean;
// 	title: string;
// 	message: string;
// 	buttonText: string;
// 	onButtonClick: () => void;
// 	icon?: string;
// 	variant?: "error" | "warning" | "info";
// }

// export function ErrorCard({
// 	elementRef,
// 	isDragging,
// 	title,
// 	message,
// 	buttonText,
// 	onButtonClick,
// 	icon = "⚠️",
// 	variant = "error",
// }: ErrorCardProps) {
// 	const buttonStyles = {
// 		error: "bg-red-600 hover:bg-red-700 text-white",
// 		warning: "bg-orange-600 hover:bg-orange-700 text-white",
// 		info: "bg-blue-600 hover:bg-blue-700 text-white",
// 	};

// 	return (
// 		<DraggableCard
// 			ref={elementRef}
// 			isDragging={isDragging}
// 			padding="lg"
// 			variant={variant}
// 			borderWidth="thick"
// 			rounded="large"
// 			showDragHandle={true}
// 		>
// 			<div className="text-center space-y-4">
// 				<div className="text-4xl">{icon}</div>
// 				<div>
// 					<h3
// 						className={`text-lg font-bold mb-2 ${variant === "error" ? "text-red-800" : variant === "warning" ? "text-orange-800" : "text-blue-800"}`}
// 					>
// 						{title}
// 					</h3>
// 					<p
// 						className={`text-sm leading-relaxed ${variant === "error" ? "text-red-700" : variant === "warning" ? "text-orange-700" : "text-blue-700"}`}
// 					>
// 						{message}
// 					</p>
// 				</div>
// 				<Button
// 					onClick={onButtonClick}
// 					size="sm"
// 					className={`font-medium transition-colors ${buttonStyles[variant]}`}
// 				>
// 					{buttonText}
// 				</Button>
// 			</div>
// 		</DraggableCard>
// 	);
// }
