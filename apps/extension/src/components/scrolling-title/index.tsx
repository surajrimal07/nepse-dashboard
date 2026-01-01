import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import { useRouter } from "@tanstack/react-router";
import { memo, useMemo } from "react";
import { TimeBadge } from "@/components/time";
import { CONFIG } from "@/constants/app-config";
import { useCompanyList } from "@/hooks/convex/useCompanyList";
import { useAppState } from "@/hooks/use-app";
import { cn } from "@/lib/utils";

interface CompanyItemProps {
	company: Doc<"company">;
	index: number;
}

// Utility function for stable shuffling with seed
function shuffleArrayWithSeed<T>(array: T[], seed: number): T[] {
	const result = [...array];
	let m = result.length;
	let temp: T;
	let i: number;

	// Use seeded random for consistent shuffling
	const random = () => {
		const x = Math.sin(seed++) * 10000;
		return x - Math.floor(x);
	};

	while (m) {
		i = Math.floor(random() * m--);
		temp = result[m];
		result[m] = result[i];
		result[i] = temp;
	}

	return result;
}

// Memoized company item component with aggressive optimization
const CompanyItem = memo<CompanyItemProps>(
	({ company }) => {
		const { symbol, percentageChange, change, closePrice } = company;

		// Pre-calculate all values and color class
		const isPositive = change >= 0;
		const colorClass = isPositive ? "text-green-500" : "text-red-500";

		// Create single optimized text node to minimize DOM operations
		const content = `${symbol} (Rs ${closePrice.toFixed(2)} / Rs ${change.toFixed(2)} / ${percentageChange.toFixed(2)}%) | `;

		return (
			<span className={cn("whitespace-nowrap", colorClass)}>{content}</span>
		);
	},
	(prevProps, nextProps) => {
		// Custom comparison function for better memoization
		const prev = prevProps.company;
		const next = nextProps.company;

		return (
			prev.symbol === next.symbol &&
			prev.closePrice === next.closePrice &&
			prev.change === next.change &&
			prev.percentageChange === next.percentageChange &&
			prevProps.index === nextProps.index
		);
	},
);

CompanyItem.displayName = "CompanyItem";

// Memoize the static app name element to avoid recreating on every render
const AppNameTitle = memo(() => (
	<div className="flex items-center gap-1 ml-1 shrink-0">
		<TimeBadge />
		<h1 className="text-base font-medium m-0 truncate">{CONFIG.app_name}</h1>
	</div>
));
AppNameTitle.displayName = "AppNameTitle";

function TitleComponent() {
	const router = useRouter();

	const isSidebar = router.options.context.environment === "sidepanel";

	const { useStateItem } = useAppState();
	const [stockScrollingPopup] = useStateItem("stockScrollingPopup");
	const [stockScrollingInSidepanel] = useStateItem("stockScrollingInSidepanel");
	const [config] = useStateItem("showTime");

	// Determine if scrolling is enabled based on environment
	const isScrollingEnabled = isSidebar
		? stockScrollingInSidepanel
		: stockScrollingPopup;

	// Always call hooks in the same order - React Rules of Hooks
	const { data: allCompanies, isPending, isError } = useCompanyList();

	// Process data - always memoize even if not used to maintain hook order
	const processedData = useMemo(() => {
		if (!allCompanies?.length) {
			return [];
		}

		// Limit to first 20 companies for performance (adjust as needed)
		const limitedData = allCompanies.slice(0, 20);

		// Use data length + first symbol as seed for stable shuffling
		const seed =
			limitedData.length + (limitedData[0]?.symbol.charCodeAt(0) || 0);
		const shuffled = shuffleArrayWithSeed(limitedData, seed);

		// Create doubled array for seamless looping
		const doubled = [...shuffled, ...shuffled];

		return doubled;
	}, [allCompanies]);

	// Now handle conditional rendering AFTER all hooks are called
	// Handle sidepanel case: return null if scrolling is disabled
	if (isSidebar && !stockScrollingInSidepanel) {
		return null;
	}

	// Handle popup case: show only app name if scrolling is disabled
	if (!isScrollingEnabled) {
		return <AppNameTitle />;
	}

	// Handle loading state: show app name while fetching companies
	if (isPending) {
		return <AppNameTitle />;
	}

	// Handle error state: fallback to app name on error
	if (isError) {
		return <AppNameTitle />;
	}

	// If no companies available, show app name
	if (!allCompanies?.length || processedData.length === 0) {
		return <AppNameTitle />;
	}

	// Dynamic animation duration based on content length
	const animationDuration = Math.max(30, processedData.length * 3);

	return (
		<div className="flex items-center gap-1 ml-1 min-w-0">
			<TimeBadge />
			<div
				className={cn(
					"overflow-hidden whitespace-nowrap min-w-0",
					isSidebar ? "flex-1" : config.enabled ? "w-[245px]" : "w-[320px]",
				)}
			>
				<div
					className="inline-block animate-ticker will-change-transform text-base font-medium motion-reduce:animate-none"
					style={{
						// Hardware acceleration optimizations
						transform: "translateZ(0)",
						backfaceVisibility: "hidden",
						perspective: "1000px",
						animationDuration: `${animationDuration}s`,
					}}
				>
					{processedData.map((company, index) => (
						<CompanyItem
							key={`${company.symbol}-${index}`}
							company={company}
							index={index}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export const Title = memo(TitleComponent);

Title.displayName = "Title";
