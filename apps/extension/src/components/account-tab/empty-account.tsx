import type { LucideIcon } from "lucide-react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { accountType } from "@/types/account-types";
import { AccountType } from "@/types/account-types";

interface EmptyAccountsStateProps {
	accountType: accountType;
	icon?: LucideIcon;
}

export function EmptyAccounts({
	accountType,
	icon: Icon = FolderOpen,
}: EmptyAccountsStateProps) {
	return (
		<div className="flex flex-col items-center justify-center text-center p-4">
			<Icon className="w-12 h-12  mb-4" />
			<h3 className="text-lg font-semibold mb-2">
				No {accountType} Accounts Found
			</h3>
			<p className={cn("mb-4")}>
				{accountType === AccountType.TMS
					? "Looks like your Nepse account list is as empty as a broker's office on a holiday!"
					: accountType === AccountType.NAASAX
						? "Looks like your NaasaX account list is as empty as a broker's office on a holiday!"
						: "Your Meroshare account list is as bare as a bear market!"}
			</p>
			<p className="text-sm ">
				Add an account by clicking the{" "}
				<span className="inline-block px-1 py-0.5 bg-zinc-800 rounded-full">
					+
				</span>{" "}
				button on the bottom right.
			</p>
		</div>
	);
}
