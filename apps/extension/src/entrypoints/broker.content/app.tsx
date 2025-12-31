import { Badge } from "@nepse-dashboard/ui/components/badge";
import { Button } from "@nepse-dashboard/ui/components/button";
import { Separator } from "@nepse-dashboard/ui/components/separator";
import {
	Tabs,
	TabsList,
	TabsTrigger,
} from "@nepse-dashboard/ui/components/tabs";
import { createCrannStateHook } from "crann-fork";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { Toaster } from "sonner";
import { browser } from "#imports";
import { DraggableCard } from "@/components/content-ui/draggable-card";
import { useDragCardState } from "@/components/content-ui/store";
import { appState } from "@/lib/service/app-service";
import { cn } from "@/lib/utils";
import { AccountType } from "@/types/account-types";
// import iconUrl from "/icon.png";
import AccountsList from "./components/account-list";
import { ErrorDisplay } from "./components/error-display";
import { SettingsPanel } from "./components/SettingsPanel";
import {
	filterAccountsBySite,
	getAccountDetails,
	getFooterMessage,
	isAutofillPausedForSite,
} from "./utils/content-utils";

const BrokerHeader = memo(
	({
		isCollapsed,
		toggleCollapsed,
		isAutofillPaused,
	}: {
		isCollapsed: boolean;
		toggleCollapsed: () => void;
		isAutofillPaused: boolean;
	}) => (
		<div
			className={cn(
				"p-2 bg-white",
				isCollapsed ? "rounded-xl" : "border-b border-gray-200 rounded-t-xl",
			)}
		>
			<div className="flex items-center justify-between">
				<div
					className="flex items-center gap-2 cursor-grab active:cursor-grabbing flex-1"
					data-drag-handle
				>
					<h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
						<img
							src={browser.runtime.getURL("/icons/128.png")}
							alt="Icon"
							className="w-5 h-5"
						/>
						Nepse Dashboard
					</h2>
					{isAutofillPaused && (
						<Badge
							variant="secondary"
							className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300"
						>
							Paused
						</Badge>
					)}
				</div>

				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						onClick={toggleCollapsed}
						className="h-6 w-6 p-0"
					>
						{isCollapsed ? (
							<ChevronDown className="h-3 w-3" />
						) : (
							<ChevronUp className="h-3 w-3" />
						)}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing"
						data-drag-handle
					>
						<GripVertical className="h-3 w-3" />
					</Button>
				</div>
			</div>
		</div>
	),
);

function App() {
	const isCollapsed = useDragCardState((state) => state.isCollapsed);
	const toggleCollapsed = useDragCardState((state) => state.toggleCollapsed);

	const useAppState = createCrannStateHook(appState);
	const { useStateItem } = useAppState();

	const [autofills] = useStateItem("autofills");
	const [accounts] = useStateItem("accounts");

	const [activeTab, setActiveTab] = useState<"current" | "all">("current");

	const currentSiteDetails = useMemo(() => {
		return getAccountDetails();
	}, []);

	// Get accounts based on current site and active tab
	const { currentBrokerAccounts, allTmsAccounts, filteredAccounts } =
		useMemo(() => {
			return filterAccountsBySite(
				accounts || [],
				currentSiteDetails,
				activeTab,
			);
		}, [accounts, currentSiteDetails, activeTab]);

	const isAutofillPaused = useMemo(() => {
		return isAutofillPausedForSite(currentSiteDetails, autofills);
	}, [currentSiteDetails, accounts, autofills]);

	const renderContent = () => {
		if (!currentSiteDetails) {
			return (
				<ErrorDisplay
					title="Unsupported Site"
					message="This extension only works on NEPSE TMS, Meroshare, or NaasaX websites. Please make sure you're on the correct site."
					buttonText="Reload Page"
					onButtonClick={() => window.location.reload()}
					icon="🌐"
					variant="warning"
				/>
			);
		}

		return (
			<>
				<div className="p-1 border-b border-gray-200 bg-white">
					<SettingsPanel />
				</div>

				<div className="p-1 bg-white">
					<div className="flex items-center justify-between mb-2">
						<h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
							💼
							{!currentSiteDetails
								? "Accounts"
								: `${currentSiteDetails.name} Accounts`}
						</h3>
					</div>
					{currentSiteDetails?.type === AccountType.TMS && (
						<div className="mb-1">
							<Tabs
								value={activeTab}
								onValueChange={setActiveTab as (value: string) => void}
							>
								<TabsList className="grid w-full grid-cols-2 h-7 p-0.5 bg-gray-50 border border-gray-200">
									<TabsTrigger
										value="current"
										className="text-xs font-semibold h-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600"
									>
										Current ({currentBrokerAccounts.length})
									</TabsTrigger>
									<TabsTrigger
										value="all"
										className="text-xs font-semibold h-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600"
									>
										All ({allTmsAccounts.length})
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>
					)}
					<AccountsList
						accounts={filteredAccounts}
						currentSiteDetails={
							currentSiteDetails || {
								type: AccountType.TMS,
								broker: null,
								name: "TMS",
							}
						}
						disableLoginButton={
							currentSiteDetails?.type === AccountType.TMS &&
							activeTab === "all"
						}
					/>
				</div>
				<Separator className="bg-gray-200" />
				<div className="p-1 text-center bg-white">
					<p className="text-xs text-gray-600">
						{currentSiteDetails
							? getFooterMessage(currentSiteDetails.type)
							: "Unsupported Site"}
					</p>
				</div>
			</>
		);
	};

	return (
		<DraggableCard variant="default" showDragHandle={false}>
			<div>
				<BrokerHeader
					isCollapsed={isCollapsed}
					toggleCollapsed={toggleCollapsed}
					isAutofillPaused={isAutofillPaused}
				/>

				<div
					className={cn(
						"bg-white overflow-hidden transition-all duration-600 ease-in-out",
						isCollapsed ? "max-h-0 opacity-0" : "max-h-[600px] opacity-100",
					)}
				>
					{renderContent()}
				</div>

				<Toaster
					position="bottom-center"
					theme="dark"
					duration={3000}
					visibleToasts={2}
					style={{ width: "200px" }}
					toastOptions={{
						style: {
							width: "200px",
							fontSize: "12px",
						},
					}}
				/>
			</div>
		</DraggableCard>
	);
}

export default memo(App);
