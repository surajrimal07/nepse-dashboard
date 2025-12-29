import { Button } from "@nepse-dashboard/ui/components/button";
import { Card } from "@nepse-dashboard/ui/components/card";
import { Pin } from "lucide-react";
import { memo, useCallback } from "react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Env, EventName } from "@/types/analytics-types";
import type { dashboardItems } from "./menu-items";

interface MenuItemProps {
	item: (typeof dashboardItems)[number];
	onClick: (alias: string) => void;
	pinnedTab: string | null;
	onPinToggle: (alias: string) => void;
}

export const MenuItem = memo(
	({ item, onClick, pinnedTab, onPinToggle }: MenuItemProps) => {
		const handleClick = useCallback(
			() => onClick(item.alias),
			[onClick, item.alias],
		);

		const handlePinClick = useCallback(
			(e: React.MouseEvent) => {
				e.stopPropagation();
				onPinToggle(item.alias);

				void track({
					context: Env.UNIVERSAL,
					eventName: EventName.ITEM_PIN_IN_DASHBOARD_MENU,
					params: {
						itemAlias: item.alias,
					},
				});
			},
			[onPinToggle, item.alias],
		);

		const isPinned = pinnedTab === item.alias;

		return (
			<Card
				className={cn(
					"group relative overflow-hidden border-none transition-all hover:scale-[1.02] hover:shadow-lg",
					item.color,
				)}
			>
				{item.canPin && (
					<div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
						<Button
							variant="ghost"
							size="icon"
							className="h-5 w-5 p-0 text-blue-600 bg-white/90 shadow-sm"
							onClick={handlePinClick}
							title={isPinned ? "Unpin" : "Pin to menu"}
						>
							<Pin
								className={cn(
									"h-3 w-3 hover:fill-current transition-colors",
									isPinned && "fill-current",
								)}
							/>
						</Button>
					</div>
				)}

				{/** biome-ignore lint/a11y/useButtonType: <yeah> */}
				<button className="w-full p-4 text-left" onClick={handleClick}>
					<div className="flex flex-col gap-2">
						<item.icon className="h-6 w-6" />
						<div>
							<h3 className="font-semibold truncate">{item.name}</h3>
							<p className="text-xs text-muted-foreground truncate">
								{item.description}
							</p>
						</div>
					</div>
				</button>
			</Card>
		);
	},
);

MenuItem.displayName = "MenuItem";
