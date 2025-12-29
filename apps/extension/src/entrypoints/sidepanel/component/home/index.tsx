import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { Button } from "@nepse-dashboard/ui/components/button";
import { useAction } from "convex/react";
import { toJpeg } from "html-to-image";
import { Plus } from "lucide-react";
import { lazy, memo, Suspense, useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import Loading from "@/components/loading";
import BottomInfo from "@/components/nepse-tab/bottom-info";
import { UniversalErrorBoundry } from "@/components/universal-error-boundary";
import { CONFIG } from "@/constants/app-config";
import { useClipboard } from "@/hooks/use-clipboard";
import { track } from "@/lib/analytics";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import {
	selectMoveWidgetDown,
	selectMoveWidgetUp,
	selectRemoveWidget,
	selectWidgets,
} from "@/selectors/sidepanel-selectors";
import { useSidebarDashboardState } from "@/state/sidepanel-state";
import { Env, EventName } from "@/types/analytics-types";
import type { Widget } from "@/types/sidepanel-type";
import { widgetType } from "@/types/sidepanel-type";
import { MoveButtons, RemoveButton, ScreenshotButtons } from "./buttons";
import { WidgetComponent } from "./widget-wrapper";

const NoWidget = lazy(
	() => import("@/entrypoints/sidepanel/component/home/no-widget"),
);

const WidgetSelector = lazy(
	() => import("@/entrypoints/sidepanel/component/home/select-widget"),
);

interface WidgetProps {
	widget: Widget;
	onRemove: (id: string) => void;
	onMoveUp: (id: string) => void;
	onMoveDown: (id: string) => void;
	canMoveUp: boolean;
	canMoveDown: boolean;
}

const WidgetUI = memo(
	({
		widget,
		onRemove,
		onMoveUp,
		onMoveDown,
		canMoveUp,
		canMoveDown,
	}: WidgetProps) => {
		const widgetRef = useRef<HTMLDivElement>(null);
		const { user, isLoading } = useAuth();

		const generateScreenshot = useAction(api.screenshot.get);
		const clipboard = useClipboard({ timeout: 500, objectName: "Screenshot" });

		const handleScreenshot = useCallback(
			async (shareLink = false) => {
				if (!widgetRef?.current) {
					toast.error("Widget reference not found");

					track({
						context: Env.SIDEPANEL,
						eventName: EventName.SCREENSHOT_FAILED,
						params: {
							error: "Widget reference not found",
						},
					});
					return;
				}

				if (isLoading) {
					toast.error("Authentication is still loading. Please try again.");
					return;
				}

				const screenshotPromise = async () => {
					const imageOptions = {
						cacheBust: true,
						quality: 1.0,
						pixelRatio: window.devicePixelRatio,
						skipAutoScale: false,
						style: {
							backgroundColor:
								// biome-ignore lint/style/noNonNullAssertion: <checked>
								getComputedStyle(widgetRef.current!).backgroundColor ||
								"#ffffff",
						},
					};

					// biome-ignore lint/style/noNonNullAssertion: <checked>
					const dataUrl = await toJpeg(widgetRef.current!, imageOptions);

					const url = await generateScreenshot({
						blob: dataUrl,
						randId: user?.randomId,
					});

					if (url?.error) {
						throw new Error(url.error);
					}

					if (!url || !url.url || !url.image) {
						throw new Error("Failed to process screenshot");
					}

					if (shareLink) {
						clipboard.copy(url.url);
						return { type: "link", url: url.url };
					}

					const blob = await fetch(url.image as string).then((res) =>
						res.blob(),
					);
					clipboard.copyBlob(blob);
					return { type: "image" as const, blob };
				};

				toast.promise(screenshotPromise(), {
					loading: "Processing screenshot...",
					success: (data) => {
						track({
							context: Env.SIDEPANEL,
							eventName: EventName.SCREENSHOT_SUCCESS,
						});

						return data.type === "link"
							? "Screenshot link copied to clipboard!"
							: "Screenshot copied to clipboard!";
					},

					error: (err) => {
						const error = err instanceof Error ? err.message : String(err);

						track({
							context: Env.SIDEPANEL,
							eventName: EventName.SCREENSHOT_FAILED,
							params: {
								error,
							},
						});

						return error || "Screenshot failed";
					},
				});
			},
			[
				widgetRef,
				isLoading,
				toast,
				track,
				EventName,
				toJpeg,
				generateScreenshot,
				user?.randomId,
				clipboard,
				fetch,
			],
		);

		const handleMoveUp = useCallback(() => {
			onMoveUp(widget.id);
		}, [onMoveUp, widget.id]);

		const handleMoveDown = useCallback(() => {
			onMoveDown(widget.id);
		}, [onMoveDown, widget.id]);

		return (
			<div className="rounded-lg border p-1 relative group transition-all">
				<div className="absolute top-1 right-1 flex items-center gap-0.5">
					<MoveButtons
						onMoveUp={handleMoveUp}
						onMoveDown={handleMoveDown}
						canMoveUp={canMoveUp}
						canMoveDown={canMoveDown}
					/>
					<ScreenshotButtons onScreenshot={handleScreenshot} />
					<RemoveButton onRemove={onRemove} widgetId={widget.id} />
				</div>

				<div ref={widgetRef}>
					<WidgetComponent {...widget} />
				</div>
			</div>
		);
	},
);

WidgetUI.displayName = "Widget";

interface AddWidgetButtonProps {
	onClick: () => void;
}

const AddWidgetButton = memo(({ onClick }: AddWidgetButtonProps) => {
	return (
		<Button
			className={cn("h-8 w-8 fixed bottom-30 right-4 rounded-full shadow-lg")}
			size="icon"
			onClick={onClick}
		>
			<Plus className="h-4 w-4" />
		</Button>
	);
});

AddWidgetButton.displayName = "AddWidgetButton";

function SidepanelHome() {
	const { callAction } = useAppState();
	// const handleRemoveStock = useHandleRemoveStockChart();
	// const handleRemoveIndex = useHandleRemoveIndexChart();
	// const handleRemoveDepth = useHandleRemoveMarketDepthStock();

	const [selectorOpen, setSelectorOpen] = useState(false);

	const { widgets, removeWidget, moveWidgetUp, moveWidgetDown } =
		useSidebarDashboardState(
			useShallow((state) => ({
				widgets: selectWidgets(state),
				removeWidget: selectRemoveWidget(state),
				moveWidgetUp: selectMoveWidgetUp(state),
				moveWidgetDown: selectMoveWidgetDown(state),
			})),
		);
	const handleOpenSelector = useCallback(() => {
		if (widgets.length >= CONFIG.max_widgets) {
			toast.error(
				`You've reached the maximum limit of ${CONFIG.max_widgets} widgets.`,
			);

			track({
				context: Env.SIDEPANEL,
				eventName: EventName.WIDGET_LIMIT_REACHED,
			});

			return;
		}
		setSelectorOpen(true);
	}, [widgets.length]);

	const handleCloseSelector = useCallback(() => {
		setSelectorOpen(false);
	}, []);

	const handleRemoveWidget = useCallback(
		async (id: string) => {
			const widgetRemoved = widgets.find((widget) => widget.id === id);

			if (!widgetRemoved) {
				toast.error("Widget not found");
				return;
			}

			if (widgetRemoved.type === widgetType.STOCK && widgetRemoved.symbol) {
				await callAction("removeStockChart", widgetRemoved.symbol).then(
					handleActionResult,
				);
			}

			if (widgetRemoved.type === widgetType.CHART && widgetRemoved.index) {
				await callAction("removeIndexChart", widgetRemoved.index).then(
					handleActionResult,
				);
			}

			if (
				widgetRemoved.type === widgetType.DEPTH &&
				widgetRemoved.depthSymbol
			) {
				await callAction(
					"removeMarketDepthStock",
					widgetRemoved.depthSymbol,
				).then(handleActionResult);
			}

			track({
				context: Env.SIDEPANEL,
				eventName: EventName.WIDGET_REMOVED,
				params: {
					widgetType: widgetRemoved.type,
					index: widgetRemoved.index || widgetRemoved.symbol || "",
				},
			});

			await removeWidget(id);
		},
		[widgets, toast, callAction, track, EventName, removeWidget],
	);
	const handleMoveWidgetUp = useCallback(
		(id: string) => {
			moveWidgetUp(id);
			track({
				context: Env.SIDEPANEL,
				eventName: EventName.WIDGET_REORDERED,
				params: {
					widgetId: id,
					direction: "up",
				},
			});
		},
		[moveWidgetUp],
	);

	const handleMoveWidgetDown = useCallback(
		(id: string) => {
			moveWidgetDown(id);

			track({
				context: Env.SIDEPANEL,
				eventName: EventName.WIDGET_REORDERED,
				params: {
					widgetId: id,
					direction: "down",
				},
			});
		},
		[moveWidgetDown],
	);

	return (
		<div className="space-y-2">
			{widgets.length === 0 && (
				<Suspense fallback={<Loading />}>
					<NoWidget />
				</Suspense>
			)}

			{widgets.map((widget, index) => (
				<UniversalErrorBoundry
					componentName={`${widget.title}`}
					key={widget.id}
				>
					<WidgetUI
						widget={widget}
						onRemove={handleRemoveWidget}
						onMoveUp={handleMoveWidgetUp}
						onMoveDown={handleMoveWidgetDown}
						canMoveUp={index > 0}
						canMoveDown={index < widgets.length - 1}
					/>
				</UniversalErrorBoundry>
			))}

			<AddWidgetButton onClick={handleOpenSelector} />

			{selectorOpen && (
				<Suspense fallback={<Loading />}>
					<WidgetSelector open={selectorOpen} onClose={handleCloseSelector} />
				</Suspense>
			)}

			<BottomInfo isSidpenal={true} />
		</div>
	);
}

export default memo(SidepanelHome);
