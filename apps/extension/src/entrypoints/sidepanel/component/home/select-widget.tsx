import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@nepse-dashboard/ui/components/dialog";
import { Input } from "@nepse-dashboard/ui/components/input";
import { lazy, memo, useCallback, useMemo, useState } from "react";
import type { ListChildComponentProps } from "react-window";
import { FixedSizeList } from "react-window";
import Loading from "@/components/loading";
import { useCompanyList } from "@/hooks/convex/useCompanyList";
import { track } from "@/lib/analytics";
import { selectAddWidget } from "@/selectors/sidepanel-selectors";
import { useSidebarDashboardState } from "@/state/sidepanel-state";
import { Env, EventName } from "@/types/analytics-types";
import type { Widget } from "@/types/sidepanel-type";
import { widgetType } from "@/types/sidepanel-type";
import {
	chartWidgets,
	generateStockWidgets,
	highestOrders,
	marketDepth,
	marketIndices,
	marketSummary,
	topWidgets,
} from "./widget-list";

const LoadingFailed = lazy(() => import("@/components/loading-failed"));

interface WidgetSelectorProps {
	open: boolean;
	onClose: () => void;
}

const WidgetSelector = memo<WidgetSelectorProps>(({ open, onClose }) => {
	const { callAction } = useAppState();

	const [searchQuery, setSearchQuery] = useState("");
	const addWidget = useSidebarDashboardState(selectAddWidget);

	const { data, isPending, error } = useCompanyList();

	if (isPending) {
		return <Loading />;
	}

	if (error) {
		return (
			<Suspense fallback={<Loading />}>
				<LoadingFailed reason="Failed to load companies." />
			</Suspense>
		);
	}

	const stockWidgets = useMemo(() => generateStockWidgets(data), [data]);

	const availableWidgets = useMemo(
		() => [
			marketDepth(),
			highestOrders(),
			marketSummary(),
			...chartWidgets,
			...topWidgets,
			marketIndices,
			...stockWidgets,
		],
		[stockWidgets],
	);

	const filteredWidgets = useMemo(() => {
		const lowerCaseQuery = searchQuery.toLowerCase();
		return availableWidgets.filter((widget) =>
			widget.title.toLowerCase().includes(lowerCaseQuery),
		);
	}, [availableWidgets, searchQuery]);

	const handleSelectWidget = async (widget: Omit<Widget, "id">) => {
		await addWidget(widget);

		if (widget.type === widgetType.CHART && widget.index) {
			await callAction("addIndexChart", widget.index);
			track({
				context: Env.SIDEPANEL,
				eventName: EventName.WIDGET_ADDED,
				params: {
					widgetType: widget.type,
					symbol: widget.index,
				},
			});
		}
		if (widget.type === widgetType.STOCK && widget.symbol) {
			await callAction("addStockChart", widget.symbol);

			track({
				context: Env.SIDEPANEL,
				eventName: EventName.WIDGET_ADDED,
				params: {
					widgetType: widget.type,
					symbol: widget.symbol,
				},
			});
		}

		if (widget.type === widgetType.DEPTH && widget.depthSymbol) {
			await callAction("addDepthSymbol", widget.depthSymbol);
			track({
				context: Env.SIDEPANEL,
				eventName: EventName.WIDGET_ADDED,
				params: {
					widgetType: widget.type,
					symbol: widget.depthSymbol,
				},
			});
		}

		track({
			context: Env.SIDEPANEL,
			eventName: EventName.WIDGET_ADDED,
			params: {
				widgetType: widget.type,
			},
		});

		setSearchQuery("");
		onClose();
	};

	const renderRow = useCallback(
		({ index, style }: ListChildComponentProps) => {
			const widget = filteredWidgets[index];

			const rowStyle = {
				...style,
				height: (style.height as number) - 2,
				top: (style.top as number) + 1,
				boxSizing: "border-box",
			};

			return (
				<button
					key={widget.title}
					type="button"
					style={rowStyle}
					className="flex items-center w-full p-3 rounded-lg border hover:bg-accent hover:border-accent-foreground/20 transition-colors duration-200"
					onClick={() => handleSelectWidget(widget)}
				>
					<span className="text-sm font-medium">{widget.title}</span>
				</button>
			);
		},
		[filteredWidgets, handleSelectWidget],
	);

	const handleSearchChange = useCallback((value: string) => {
		setSearchQuery(value);
	}, []);

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-[95%] w-full">
				<DialogHeader>
					<DialogTitle>Add Widget</DialogTitle>
					<DialogDescription>
						Select a widget to add to your dashboard.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-2">
					<div className="p-1 relative">
						<Input
							placeholder="Search widgets..."
							value={searchQuery}
							onChange={(e) => handleSearchChange(e.target.value)}
							className="pl-8 border border-white"
						/>
					</div>
					<div className="overflow-y-auto">
						{filteredWidgets.length > 0 ? (
							<FixedSizeList
								height={452}
								width="100%"
								itemCount={filteredWidgets.length}
								itemSize={43}
								className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]"
							>
								{renderRow}
							</FixedSizeList>
						) : (
							<div className="text-center text-sm text-muted-foreground">
								No widgets found
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
});

export default WidgetSelector;

WidgetSelector.displayName = "WidgetSelector";
