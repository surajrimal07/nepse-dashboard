import { Badge } from "@nepse-dashboard/ui/components/badge";
import { Button } from "@nepse-dashboard/ui/components/button";
import { AlertCircle, Edit, LogIn, Star, Trash2 } from "lucide-react";
import type { FC } from "react";
import { memo } from "react";
import TimeAgo from "react-timeago";
import { sendMessage as webMessage } from "@/lib/messaging//window-messaging";
import { sendMessage } from "@/lib/messaging/extension-messaging";
import { cn } from "@/lib/utils";
import type { Account } from "@/types/account-types";
import { AccountType } from "@/types/account-types";
import type { SiteDetails } from "../utils/content-utils";

interface AccountCardProps {
	account: Account;
	index: number;
	isLast: boolean;
	currentSiteDetails: SiteDetails | null;
	canDelete: boolean;
	disableLoginButton?: boolean;
}

const AccountCard: FC<AccountCardProps> = memo(
	({
		account,
		index: _index,
		isLast,
		currentSiteDetails,
		disableLoginButton = false,
		canDelete,
	}) => {
		const { callAction } = useAppState();

		// Compute validation states locally
		const canMakePrimary = !account.isPrimary;

		const showLoginButton =
			!disableLoginButton &&
			!!currentSiteDetails &&
			(currentSiteDetails.type === AccountType.TMS
				? account.broker === currentSiteDetails.broker
				: account.type === currentSiteDetails.type);

		// Action handlers
		const handleEdit = async () => {
			await callAction(
				"showNotification",
				`Opening Sidpenal to edit account ${account.alias}`,
				"info",
			);
			await sendMessage("openSidePanel");
			// pause for 2 seconds to allow route change to complete
			await new Promise((resolve) => setTimeout(resolve, 1500));
			await sendMessage("goToRoute", { route: "/account" });
			await callAction("setEditingAccount", account.alias);
		};

		const handleLogin = async () => {
			const typeMap = {
				[AccountType.TMS]: { msg: "manualLoginTMS" },
				[AccountType.MEROSHARE]: { msg: "manualLoginMero" },
				[AccountType.NAASAX]: { msg: "manualLoginNaasax" },
			} as const;

			const config = typeMap[currentSiteDetails?.type as keyof typeof typeMap];
			if (config) {
				await webMessage(config.msg, account);
			}
		};

		const handleDelete = async () => {
			await callAction("deleteAccount", account.alias);
		};

		const handlePrimaryChange = async () => {
			if (canMakePrimary) {
				await callAction("makePrimary", account.alias);
			}
		};
		return (
			<div
				className={cn(
					"p-2 bg-white flex items-center justify-between gap-3",
					!isLast && "border-b border-gray-100",
					account.isPrimary && "bg-blue-50 border-l-4 border-l-blue-500",
				)}
			>
				<div className={cn("flex-1 min-w-0")}>
					<div className={cn("flex items-caenter gap-1 mb-1")}>
						<span
							className={cn("font-semibold text-sm text-gray-900 truncate")}
						>
							{account.alias}
						</span>
						{account.broker != null && account.broker > 0 && (
							<span
								title={`Broker ID: ${account.broker}`}
								className="inline-flex min-w-3 h-3.5 px-1 items-center justify-center rounded-full border border-gray-400 text-[9px] font-medium text-gray-700 leading-none shrink-0"
							>
								{account.broker}
							</span>
						)}
						{account.error && (
							<span title={`This account has error: ${account.error}`}>
								<AlertCircle className="h-3 w-3 text-red-500 shrink-0" />
							</span>
						)}
						{account.disabled && (
							<Badge
								variant="secondary"
								className={cn("text-xs bg-yellow-500 text-white px-1 py-0")}
							>
								Disabled
							</Badge>
						)}
					</div>{" "}
					<div className={cn("text-xs text-gray-600")}>
						<span className={cn("font-medium")}>Last login:</span>{" "}
						{account.lastLoggedIn ? (
							<TimeAgo date={account.lastLoggedIn} />
						) : (
							"Never"
						)}
					</div>
				</div>

				<div className={cn("flex items-center gap-1")}>
					<Button
						variant="ghost"
						size="sm"
						onClick={handlePrimaryChange}
						disabled={account.isPrimary || !canMakePrimary}
						className={cn(
							"h-6 w-6 p-0",
							account.isPrimary
								? "text-yellow-500 fill-yellow-500 cursor-default"
								: canMakePrimary
									? "hover:bg-yellow-100 text-yellow-600"
									: "text-gray-400 cursor-not-allowed",
						)}
						title={
							account.isPrimary
								? "This is the primary account"
								: canMakePrimary
									? "Set as primary"
									: "Cannot set as primary"
						}
					>
						<Star
							className={cn("h-3 w-3", account.isPrimary && "fill-yellow-500")}
						/>
					</Button>

					<Button
						variant="ghost"
						size="sm"
						onClick={handleEdit}
						className={cn("h-6 w-6 p-0 hover:bg-green-100 text-green-600")}
						title="Edit account"
					>
						<Edit className="h-3 w-3" />
					</Button>

					{showLoginButton && (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleLogin}
							className={cn("h-6 w-6 p-0 hover:bg-blue-100 text-blue-600")}
							title={`Login to ${account.alias}`}
						>
							<LogIn className="h-3 w-3" />
						</Button>
					)}

					<Button
						variant="ghost"
						size="sm"
						onClick={handleDelete}
						disabled={!canDelete}
						className={cn(
							"h-6 w-6 p-0",
							canDelete
								? "hover:bg-red-100 text-red-600"
								: "text-gray-400 cursor-not-allowed",
						)}
						title={canDelete ? "Delete account" : "Cannot delete this account"}
					>
						<Trash2 className="h-3 w-3" />
					</Button>
				</div>
			</div>
		);
	},
);

AccountCard.displayName = "AccountCard";

export default AccountCard;
