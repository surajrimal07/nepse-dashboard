import { Button } from "@nepse-dashboard/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import AccountCard from "@/entrypoints/broker.content/components/account-card";
import { EmptyAccountsState } from "@/entrypoints/broker.content/components/empty";
import type { Account } from "@/types/account-types";
import type { SiteDetails } from "../utils/content-utils";

const itemsPerPage = 4;

interface AccountsListProps {
	accounts: Account[];
	currentSiteDetails: SiteDetails;
	disableLoginButton?: boolean;
	isLoading?: boolean;
}

function AccountsList({
	accounts,
	currentSiteDetails,
	disableLoginButton = false,
}: AccountsListProps) {
	const [currentPage, setCurrentPage] = useState(1);

	const totalPages = useMemo(
		() => Math.ceil(accounts.length / itemsPerPage),
		[accounts.length, itemsPerPage],
	);

	const displayedAccounts = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return accounts.slice(startIndex, endIndex);
	}, [accounts, currentPage, itemsPerPage]);

	const needsPagination = useMemo(
		() => accounts.length > itemsPerPage,
		[accounts.length, itemsPerPage],
	);

	const handlePrevPage = () => {
		setCurrentPage((prev) => Math.max(1, prev - 1));
	};

	const handleNextPage = () => {
		setCurrentPage((prev) => Math.min(totalPages, prev + 1));
	};

	if (accounts.length === 0) {
		return <EmptyAccountsState />;
	}

	return (
		<div>
			<div className="border border-gray-200 rounded-md overflow-hidden bg-white">
				{displayedAccounts.map((account, index) => (
					<AccountCard
						key={account.alias}
						account={account}
						index={index}
						isLast={index === displayedAccounts.length - 1}
						currentSiteDetails={currentSiteDetails}
						disableLoginButton={disableLoginButton}
						canDelete={accounts.length > 1}
					/>
				))}
			</div>

			{needsPagination && totalPages > 1 && (
				<div className="flex items-center justify-center gap-0 mt-1 py-1">
					<Button
						onClick={handlePrevPage}
						disabled={currentPage === 1}
						className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>

					<span className="text-sm text-gray-600 font-medium min-w-[60px] text-center">
						{currentPage} of {totalPages}
					</span>

					<Button
						onClick={handleNextPage}
						disabled={currentPage === totalPages}
						className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	);
}

AccountsList.displayName = "AccountsList";
export default AccountsList;
