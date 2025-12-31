import { Badge } from "@nepse-dashboard/ui/components/badge";
import { Input } from "@nepse-dashboard/ui/components/input";
import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import { X } from "lucide-react";
import type { ChangeEvent, CSSProperties } from "react";
import {
	lazy,
	memo,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { FixedSizeList } from "react-window"; // comeon man
import { toast } from "sonner";
import BackButton from "@/components/back-button/back-button";
import { NoCompaniesFound } from "@/components/stock-tab/no-companies";
import { useCompanyList } from "@/hooks/convex/useCompanyList";
import type { Company } from "@/types/company-types";
import Loading from "../loading";
import { getBadgeClassName } from "./utils";

const LoadingFailed = lazy(() => import("@/components/loading-failed"));

interface SelectCompanyProps {
	onSelectCompany: (company: Company) => void;
}

export default function SelectCompany({ onSelectCompany }: SelectCompanyProps) {
	const notificationShownRef = useRef(false);

	const { data, isPending, error } = useCompanyList();
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		if (!notificationShownRef.current) {
			toast.info("Please select a company to add in Market Depth");
			notificationShownRef.current = true;
		}
	}, []);

	const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value.toLowerCase());
	}, []);

	const handleClearSearch = useCallback(() => {
		setSearchTerm("");
	}, []);

	// const handleRefresh = useCallback(() => {
	// 	fetchAllCompanies();
	// }, [fetchAllCompanies]);

	const filteredCompanies = useMemo(() => {
		if (!searchTerm) return data;
		return data?.filter(
			(company) =>
				company.symbol.toLowerCase().includes(searchTerm) ||
				company.securityName.toLowerCase().includes(searchTerm),
		);
	}, [searchTerm, data]);

	const Row = memo(
		({ index, style }: { index: number; style: CSSProperties }) => {
			const company = filteredCompanies?.[index];
			if (!company) return null;

			return (
				<button
					type="button"
					style={style}
					className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors duration-200 ease-in-out"
					onClick={() => onSelectCompany(company)}
				>
					<div className="flex justify-between items-center">
						<div className="font-medium">{company.symbol}</div>
						<Badge
							variant="secondary"
							className={getBadgeClassName(company.percentageChange)}
						>
							{company.percentageChange}%
						</Badge>
					</div>
					<div className="text-sm text-muted-foreground">
						{company.securityName}
					</div>
				</button>
			);
		},
	);

	Row.displayName = "Row";

	const companyListContent = useMemo(() => {
		if (isPending) {
			return Array.from({ length: 10 }).map((_, index) => (
				<div key={index} className="px-4 py-2">
					<Skeleton className="h-6 w-20 mb-1" />
					<Skeleton className="h-4 w-40" />
				</div>
			));
		}

		if (data?.length === 0 || error) {
			return (
				<Suspense fallback={<Loading />}>
					<LoadingFailed />
				</Suspense>
			);
		}

		if (!filteredCompanies || filteredCompanies.length === 0) {
			return <NoCompaniesFound />;
		}

		return (
			<FixedSizeList
				height={452}
				width="100%"
				itemCount={filteredCompanies?.length || 0}
				itemSize={70}
				className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]"
			>
				{Row}
			</FixedSizeList>
		);
	}, [isPending, data?.length, filteredCompanies?.length, Row]);

	return (
		<div className="w-full flex flex-col">
			<div className="p-1 relative">
				<Input
					type="text"
					placeholder="Search companies..."
					value={searchTerm}
					onChange={handleSearchChange}
					className="w-full border border-white pr-10"
				/>
				{searchTerm && (
					<button
						type="button"
						onClick={handleClearSearch}
						className="absolute right-6 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>

			<div className="grow overflow-y-auto max-h-[452px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
				{companyListContent}
			</div>

			<BackButton showBack={true} />
		</div>
	);
}
