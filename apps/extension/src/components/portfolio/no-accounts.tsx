import { Plus, UserPlus, Wallet } from "lucide-react";
import { memo, useCallback } from "react";

function NoAccountsComponent() {
	const handleAddAccount = useCallback(() => {
		// TODO: Navigate to add account page
	}, []);

	return (
		<div className="flex flex-col h-full w-full bg-background overflow-hidden">
			<div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
				<div className="relative mb-6">
					<div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
						<Wallet className="w-10 h-10 text-primary" />
					</div>
					<div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center">
						<UserPlus className="w-4 h-4 text-primary" />
					</div>
				</div>
				<h2 className="text-xl font-bold text-foreground mb-2">
					No Accounts Added
				</h2>
				<p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
					Add a Meroshare account to view your portfolio holdings, track
					performance, and get insights.
				</p>

				<button
					onClick={handleAddAccount}
					className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium text-sm transition-colors"
				>
					<Plus className="w-4 h-4" />
					Add Meroshare Account
				</button>

				<p className="text-xs text-muted-foreground mt-4">
					Your credentials are stored locally and never sent to external
					servers.
				</p>
			</div>
		</div>
	);
}

const NoAccounts = memo(NoAccountsComponent);
NoAccounts.displayName = "NoAccounts";

export default NoAccounts;