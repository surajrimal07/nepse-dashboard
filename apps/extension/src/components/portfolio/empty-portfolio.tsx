import { Briefcase } from "lucide-react";

interface EmptyPortfolioProps {
	accountName?: string;
	hasOtherAccounts?: boolean;
}

/**
 * Component shown when a synced account has no stocks in portfolio
 */
export default function EmptyPortfolio({
	accountName,
	hasOtherAccounts = false,
}: EmptyPortfolioProps) {
	return (
		<div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
			<div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
				<Briefcase className="w-8 h-8 text-muted-foreground" />
			</div>
			<h3 className="text-lg font-semibold text-foreground mb-2">
				No Holdings Found
			</h3>
			<p className="text-sm text-muted-foreground max-w-xs">
				{accountName ? (
					<>
						<span className="font-medium text-foreground">{accountName}</span>'s
						portfolio is empty. No stocks are currently held in this account.
					</>
				) : (
					"This portfolio is empty. No stocks are currently held in this account."
				)}
			</p>
			{hasOtherAccounts && (
				<p className="text-xs text-muted-foreground mt-3">
					Try selecting a different account from the dropdown above.
				</p>
			)}
		</div>
	);
}
