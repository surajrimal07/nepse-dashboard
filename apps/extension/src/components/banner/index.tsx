import {
	Banner,
	BannerAction,
	BannerClose,
	BannerIcon,
	BannerTitle,
} from "@nepse-dashboard/ui/components/banner";
import { cn } from "@nepse-dashboard/ui/lib/utils";
import { useRouteContext } from "@tanstack/react-router";
import { Info, OctagonAlert, TriangleAlert } from "lucide-react";
import { useBanner } from "@/hooks/convex/use-banner";
import useScreenView from "@/hooks/usePageView";
import { track } from "@/lib/analytics";
import { useGeneralState } from "@/state/general-state";
import { Env, EventName } from "@/types/analytics-types";

function bannerIconByType(type?: string) {
	switch (type) {
		case "warning":
			return TriangleAlert;
		case "error":
			return OctagonAlert;
		default:
			return Info;
	}
}

function InfoUI() {
	useScreenView("/banners");

	const routeContext = useRouteContext({ strict: false });
	const isSidepanel = routeContext.environment === "sidepanel";
	const { data } = useBanner();

	const dismissedIds = useGeneralState((s) => s.dismissedIds);
	const dismiss = useGeneralState((s) => s.dismiss);
	const hasBanner = useGeneralState((s) => s.hasBanner);
	const setHasBanner = useGeneralState((s) => s.setHasBanner);

	const handleLearnMore = (link: string, bannerId: number) => {
		dismiss(bannerId);

		window.open(link, "_blank");

		void track({
			context: Env.UNIVERSAL,
			eventName: EventName.BANNER_LEARN_MORE_CLICKED,
			params: {
				bannerId,
			},
		});
	};

	const handleDismiss = (bannerId: number) => {
		dismiss(bannerId);

		void track({
			context: Env.UNIVERSAL,
			eventName: EventName.BANNER_DISMISSED,
			params: {
				bannerId,
			},
		});
	};

	const activeBanners =
		data?.filter((banner) => !dismissedIds.includes(banner.id)) || [];

	const visible = activeBanners.length > 0;

	if (visible !== hasBanner) {
		setHasBanner(visible);
	}

	if (!visible) return null;

	return (
		<div
			className={cn(
				"fixed right-4 left-4 z-9999 flex flex-col gap-2 pointer-events-auto",
				isSidepanel ? "bottom-16" : "bottom-6",
			)}
		>
			{activeBanners.map((banner) => (
				<Banner
					key={banner.id}
					className="bg-neutral-100  dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
					inset={true}
				>
					<BannerIcon
						// biome-ignore lint/style/noNonNullAssertion: <iknow>
						icon={bannerIconByType(banner.messageType!)}
						className="border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
					/>
					<BannerTitle className="text-neutral-900 dark:text-neutral-100">
						{banner.messageTitle}
					</BannerTitle>

					{banner.link && (
						<BannerAction
							// biome-ignore lint/style/noNonNullAssertion: <iknow>
							onClick={() => handleLearnMore(banner.link!, banner.id)}
							className="text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100"
						>
							Learn more
						</BannerAction>
					)}

					<BannerClose
						onClick={() => handleDismiss(banner.id)}
						className="text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100"
					/>
				</Banner>
			))}
		</div>
	);
}

export default InfoUI;
