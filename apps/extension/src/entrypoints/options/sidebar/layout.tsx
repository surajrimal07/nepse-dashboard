// import { Separator } from "@nepse-dashboard/ui/components/separator";

// import type { ReactNode } from "react";
// import Container from "@/entrypoints/options/sidebar/container";
// import { cn } from "@/lib/utils";

// export function OptionsLayout({
// 	title,
// 	children,
// 	className,
// 	innerClassName,
// }: {
// 	title: string;
// 	children: ReactNode;
// 	className?: string;
// 	innerClassName?: string;
// }) {
// 	return (
// 		<div className={cn("w-full pb-8", className)}>
// 			<div className="border-b">
// 				<Container>
// 					<header className="flex h-14 -ml-1.5 shrink-0 items-center gap-2">
// 						<Separator orientation="vertical" className="mr-1.5 h-4!" />
// 						<h1>{title}</h1>
// 					</header>
// 				</Container>
// 			</div>
// 			<Container className={innerClassName}>{children}</Container>
// 		</div>
// 	);
// }
