import { Badge } from "@nepse-dashboard/ui/components/badge";
import { Input } from "@nepse-dashboard/ui/components/input";
import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import {
	createLazyRoute,
	useRouteContext,
	useRouter,
} from "@tanstack/react-router";
import { X } from "lucide-react";
import type { ChangeEvent } from "react";
import {
	lazy,
	Suspense,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { FixedSizeList } from "react-window";
import BackButton from "@/components/back-button/back-button";
import { NoCompaniesFound } from "@/components/stock-tab/no-companies";
import { useCompanyList } from "@/hooks/convex/useCompanyList";
import type { Company } from "@/types/company-types";
import Loading from "../loading";
import { getBadgeClassName } from "../market-depth/utils";

const LoadingFailed = lazy(() => import("@/components/loading-failed"));

const ITEM_HEIGHT = 70;
const LIST_HEIGHT = 470;
const LIST_HEIGHT_FULLSCREEN = 880;
const SKELETON_COUNT = 10;

export const Route = createLazyRoute("/company-list")({
	component: CompanyList,
});

export default function CompanyList() {
	const router = useRouter();

	const { data, isPending, error } = useCompanyList();
	const baseId = useId();

	const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const searchInputRef = useRef<HTMLInputElement>(null);

	const routeContext = useRouteContext({ strict: false });

	useEffect(() => {
		// Auto-focus the search input when component mounts and companies data exists
		if (searchInputRef.current && data) {
			searchInputRef.current.focus();
		}
	}, [data]);

	const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value.toLowerCase());
	}, []);

	const handleClearSearch = useCallback(() => {
		setSearchTerm("");
	}, []);

	const handleCompanySelect = useCallback((company: Company) => {
		setSelectedCompany(company);
	}, []);

	const filteredCompanies = useMemo(() => {
		if (!searchTerm) return data;
		return data?.filter(
			(company) =>
				company.symbol.toLowerCase().includes(searchTerm) ||
				company.securityName.toLowerCase().includes(searchTerm),
		);
	}, [searchTerm, data]);

	const listHeight = useMemo(
		() => (routeContext.fullscreen ? LIST_HEIGHT_FULLSCREEN : LIST_HEIGHT),
		[routeContext.fullscreen],
	);

	const skeletonItems = useMemo(
		() =>
			Array.from({ length: SKELETON_COUNT }, (_) => (
				<div key={baseId} className="px-4 py-2">
					<Skeleton className="h-6 w-20 mb-1" />
					<Skeleton className="h-4 w-40" />
				</div>
			)),
		[baseId],
	);

	const Row = useCallback(
		({ index, style }: { index: number; style: React.CSSProperties }) => {
			const company = filteredCompanies?.[index];
			if (!company) return null;

			return (
				<button
					type="button"
					style={style}
					className="w-full text-left px-4 py-2 hover:bg-muted/40 transition-colors duration-200 ease-in-out"
					onClick={() => handleCompanySelect(company)}
				>
					<div className="flex justify-between items-center">
						<div className="font-medium">{company.symbol}</div>
						<div className="flex gap-2">
							<Badge
								variant="secondary"
								className={getBadgeClassName(company.percentageChange)}
							>
								{company.percentageChange}%
							</Badge>
							<Badge variant="secondary" className="text-muted-foreground">
								{"Rs "}
								{company.closePrice}
							</Badge>
						</div>
					</div>
					<div className="text-sm text-muted-foreground">
						{company.securityName}
					</div>
				</button>
			);
		},
		[filteredCompanies, handleCompanySelect],
	);

	function renderCompanyList() {
		if (isPending) {
			return skeletonItems;
		}

		if ((data?.length === 0 && !isPending) || error) {
			return (
				<Suspense fallback={<Loading />}>
					<LoadingFailed />
				</Suspense>
			);
		}

		if (!filteredCompanies || filteredCompanies?.length === 0) {
			return <NoCompaniesFound />;
		}

		return (
			<FixedSizeList
				height={listHeight}
				width="100%"
				itemCount={filteredCompanies?.length || 0}
				itemSize={ITEM_HEIGHT}
				className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]"
			>
				{Row}
			</FixedSizeList>
		);
	}

	if (selectedCompany) {
		router.navigate({
			to: "/company-details",
			search: { symbol: selectedCompany.symbol },
		});
	}

	return (
		<div className="w-full flex flex-col">
			<div className="p-2 relative">
				<Input
					ref={searchInputRef}
					type="text"
					placeholder={`Search all ${data?.length || 0} companies...`}
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

			<div>{renderCompanyList()}</div>

			<BackButton showBack={true} />
		</div>
	);
}
