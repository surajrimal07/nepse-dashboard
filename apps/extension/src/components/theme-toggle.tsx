import { Button } from "@nepse-dashboard/ui/components/button";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { forwardRef, useCallback } from "react";
import { track } from "@/lib/analytics";
import { Env, EventName } from "@/types/analytics-types";

function getIcon(theme: string) {
	if (theme === "dark") return <Moon className="h-4 w-4" />;
	if (theme === "system") return <Monitor className="h-4 w-4" />;
	return <Sun className="h-4 w-4" />;
}

export const ThemeToggle = forwardRef<
	HTMLButtonElement,
	React.ComponentProps<typeof Button>
>(({ onClick, ...props }, ref) => {
	const { theme, setTheme } = useTheme();

	const handleThemeChange = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			if (theme === "light") {
				setTheme("dark");
				void track({
					context: Env.UNIVERSAL,
					eventName: EventName.THEME_CHANGED_DARK,
				});
			} else if (theme === "dark") {
				setTheme("system");
				void track({
					context: Env.UNIVERSAL,
					eventName: EventName.THEME_CHANGED_SYSTEM,
				});
			} else {
				setTheme("light");
				void track({
					context: Env.UNIVERSAL,
					eventName: EventName.THEME_CHANGED_LIGHT,
				});
			}

			// Call the original onClick if it exists
			onClick?.(e);
		},
		[theme, setTheme, onClick],
	);

	return (
		<Button
			ref={ref}
			onClick={handleThemeChange}
			className="h-7 w-7 rounded-lg border-none transition-colors p-0"
			variant="ghost"
			size="icon"
			{...props}
		>
			{getIcon(theme || "dark")}
		</Button>
	);
});

ThemeToggle.displayName = "ThemeToggle";
