import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@nepse-dashboard/ui/components/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@nepse-dashboard/ui/components/dropdown-menu";
import { Switch } from "@nepse-dashboard/ui/components/switch";
import {
	Tabs,
	TabsList,
	TabsTrigger,
} from "@nepse-dashboard/ui/components/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@nepse-dashboard/ui/components/tooltip";
import { useRouter } from "@tanstack/react-router";
import { ChartLine, LayoutDashboard, UserRound } from "lucide-react";
import { memo, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { browser } from "#imports";
import { dashboardItems } from "@/components/dashboard-tab/menu-items";
import ReloadExtension from "@/components/reload-extension";
import { Title } from "@/components/scrolling-title";
import { ThemeToggle } from "@/components/theme-toggle";
import { UniversalErrorBoundry } from "@/components/universal-error-boundary";
import { handleActionResult } from "@/hooks/handle-action";
import { useAppState } from "@/hooks/use-app";
import { useAuth } from "@/lib/auth/auth-context";
import { getPopupTabRoute } from "@/routes/getTabRoute";
import {
	SelectDynamicTab,
	selectActiveTab,
	selectSetActiveTab,
} from "@/selectors/general-selector";
import { useGeneralState } from "@/state/general-state";
import { TabStateEnum } from "@/types/general-types";
import { TAB_TRIGGER_STYLES } from "@/utils/tab-style";

const MenuItemWithSwitch = memo(
	({
		label,
		checked,
		onCheckedChange,
	}: {
		label: string;
		checked: boolean;
		onCheckedChange: (checked: boolean) => void;
	}) => (
		<DropdownMenuItem
			className="flex items-center justify-between px-4 py-2"
			onSelect={(e: Event) => e.preventDefault()}
		>
			<span className="text-sm font-normal">{label}</span>
			<Switch
				checked={checked}
				onCheckedChange={onCheckedChange}
				className="data-[state=checked]:bg-[#22c55e] h-5 w-9"
			/>
		</DropdownMenuItem>
	),
);

MenuItemWithSwitch.displayName = "MenuItemWithSwitch";

function Header() {
	const { useStateItem, callAction } = useAppState();

	const [isNotificationEnabled] = useStateItem("notification");

	const router = useRouter();
	const { user: authUser } = useAuth();

	const { dynamicTab, activeTab, setActiveTab } = useGeneralState(
		useShallow((state) => ({
			dynamicTab: SelectDynamicTab(state),
			activeTab: selectActiveTab(state),
			setActiveTab: selectSetActiveTab(state),
		})),
	);
	// // Action handlers
	const handleNotificationToggle = useCallback(
		(enabled: boolean) => {
			callAction("setNotification", enabled).then(handleActionResult);
		},
		[callAction],
	);
	const handleTelegram = useCallback(() => {
		callAction("handleJoinTelegram").then(handleActionResult);
	}, []);
	const handlePrivacy = useCallback(() => {
		callAction("handlePrivacyPolicy").then(handleActionResult);
	}, []);
	const handleTerms = useCallback(() => {
		callAction("handleTermsOfService").then(handleActionResult);
	}, []);
	const review = useCallback(() => {
		callAction("handleReview").then(handleActionResult);
	}, []);

	const handleOpenOptions = useCallback(() => {
		if (browser.runtime.openOptionsPage) {
			void browser.runtime.openOptionsPage();
		}
	}, []);

	const handleProfileClick = useCallback(() => {
		router.navigate({
			to: "/profile",
			search: { fromAuthFlow: false },
		});
	}, [router]);

	const handleBackupClick = useCallback(() => {
		router.navigate({
			to: "/backup",
		});
	}, [router]);

	// Tab navigation handler
	const handleTabChange = useCallback(
		(value: string) => {
			setActiveTab(value);
			router.navigate(getPopupTabRoute(value));
		},
		[setActiveTab, router],
	);

	// biome-ignore lint/style/noNonNullAssertion: <iknow>
	const thirdTab = dashboardItems.find((item) => item.alias === dynamicTab)!;
	const featureMenuItems = [
		{
			label: "Notification",
			checked: isNotificationEnabled,
			onChange: handleNotificationToggle,
		},
	];

	const helpMenuItems = [
		{ label: "Join Telegram", handler: handleTelegram },
		{ label: "Privacy Policy", handler: handlePrivacy },
		{ label: "Terms of Service", handler: handleTerms },
		{ label: "Review Us", handler: review },
	];

	return (
		<div className="w-full">
			<div className="flex justify-between items-center mb-0 w-full">
				<div className="shrink-0">
					<UniversalErrorBoundry componentName="Title Header">
						<Title />
					</UniversalErrorBoundry>
				</div>

				<div className="flex items-center gap-0">
					<Tooltip delayDuration={300}>
						<TooltipTrigger asChild>
							<ReloadExtension />
						</TooltipTrigger>
						<TooltipContent side="bottom">
							<p>Reload extension</p>
						</TooltipContent>
					</Tooltip>
					<Tooltip delayDuration={300}>
						<TooltipTrigger asChild>
							<ThemeToggle />
						</TooltipTrigger>
						<TooltipContent side="bottom">
							<p>Toggle theme</p>
						</TooltipContent>
					</Tooltip>

					<DropdownMenu>
						<Tooltip>
							<TooltipTrigger asChild>
								<DropdownMenuTrigger asChild>
									<Avatar className="h-5 w-5 mr-3">
										{authUser?.image && <AvatarImage src={authUser.image} />}
										<AvatarFallback className="bg-background">
											<UserRound strokeWidth={1.3} />
										</AvatarFallback>
									</Avatar>
								</DropdownMenuTrigger>
							</TooltipTrigger>
							<TooltipContent side="bottom">
								<p>Account menu</p>
							</TooltipContent>
						</Tooltip>

						<DropdownMenuContent align="end" className="w-48">
							<DropdownMenuLabel className="px-4 py-2 text-xs font-semibold text-gray-400">
								Menu
							</DropdownMenuLabel>
							<DropdownMenuItem
								className="px-4 py-2"
								onSelect={handleProfileClick}
							>
								Profile
							</DropdownMenuItem>
							<DropdownMenuItem
								className="px-4 py-2"
								onSelect={handleOpenOptions}
							>
								Options
							</DropdownMenuItem>
							<DropdownMenuItem
								className="px-4 py-2"
								onSelect={handleBackupClick}
							>
								Backup & Restore
							</DropdownMenuItem>

							<DropdownMenuSeparator className="bg-gray-800" />
							<DropdownMenuLabel className="px-4 py-2 text-xs font-semibold text-gray-400">
								FEATURES
							</DropdownMenuLabel>

							{featureMenuItems.map((item) => (
								<MenuItemWithSwitch
									key={item.label}
									label={item.label}
									checked={item.checked}
									onCheckedChange={item.onChange}
								/>
							))}

							<DropdownMenuSeparator className="bg-gray-800" />
							<DropdownMenuLabel className="px-4 py-2 text-xs font-semibold text-gray-400">
								HELP
							</DropdownMenuLabel>

							{helpMenuItems.map((item) => (
								<DropdownMenuItem
									key={item.label}
									className="px-4 py-2"
									onSelect={item.handler}
								>
									{item.label}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			<Tabs
				defaultValue={TabStateEnum.HOME}
				value={activeTab}
				onValueChange={handleTabChange}
				className="w-full"
			>
				<TabsList className="w-full grid grid-cols-3 gap-1 px-1">
					<TabsTrigger value={TabStateEnum.HOME} className={TAB_TRIGGER_STYLES}>
						<ChartLine className="w-4 h-4 shrink-0" />
						<span className="truncate">NEPSE</span>
					</TabsTrigger>
					<TabsTrigger
						value={TabStateEnum.DASHBOARD}
						className={TAB_TRIGGER_STYLES}
					>
						<LayoutDashboard className="w-4 h-4 shrink-0" />
						<span className="truncate">Dashboard</span>
					</TabsTrigger>
					<TabsTrigger value={thirdTab?.alias} className={TAB_TRIGGER_STYLES}>
						{thirdTab?.icon && <thirdTab.icon className="w-4 h-4 shrink-0" />}
						<span className="truncate">{thirdTab?.name}</span>
					</TabsTrigger>
				</TabsList>
			</Tabs>
		</div>
	);
}

Header.displayName = "Header";

export default Header;
