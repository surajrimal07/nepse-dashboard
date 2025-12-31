import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import { Button } from "@nepse-dashboard/ui/components/button";
import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import {
	Tabs,
	TabsList,
	TabsTrigger,
} from "@nepse-dashboard/ui/components/tabs";
import { createLazyRoute, useRouteContext } from "@tanstack/react-router";
import { AlertCircle, MessageCircleMore, Newspaper } from "lucide-react";
import type { FC } from "react";
import { memo, useCallback, useId, useMemo, useState } from "react";
import { LIST_HEIGHT } from "@/constants/app-config";
import {
	getCompanyNews,
	gtExchangeMessages,
} from "@/hooks/convex/use-exchange";
import { TAB_TRIGGER_STYLES } from "@/utils/tab-style";
import BackButton from "../back-button/back-button";

type NewsDoc = Doc<"companyNews">;
type ExchangeDoc = Doc<"exchangeMessages">;

// Constants
const SKELETON_COUNT = 5;
const FILE_BASE_URL =
	"https://www.nepalstock.com/api/nots/security/fetchFiles?fileLocation=";

// Utility function
function openFileInNewTab(filePath: string) {
	window.open(`${FILE_BASE_URL}${filePath}`, "_blank", "noopener,noreferrer");
}

// Reusable Components
const SkeletonRow = memo(() => (
	<li className="bg-accent/20 rounded-md shadow-sm p-2 border border-border/30">
		<div className="flex flex-col gap-0.5">
			<Skeleton className="h-5 w-3/4 mb-1" />
			<Skeleton className="h-3 w-1/3 mb-1" />
			<div className="space-y-1">
				<Skeleton className="h-3 w-full" />
				<Skeleton className="h-3 w-5/6" />
				<Skeleton className="h-3 w-4/6" />
			</div>
			<div className="mt-2 flex gap-2">
				<Skeleton className="h-6 w-20 rounded" />
			</div>
		</div>
	</li>
));
SkeletonRow.displayName = "SkeletonRow";

const LoadingState = memo(() => (
	<ul className="space-y-3 pb-3">
		{Array.from({ length: SKELETON_COUNT }, (_, i) => (
			<SkeletonRow key={`skeleton-${i}`} />
		))}
	</ul>
));
LoadingState.displayName = "LoadingState";

const ErrorState = memo(({ message }: { message: string }) => (
	<div className="flex items-center gap-2 text-destructive py-4">
		<AlertCircle className="w-4 h-4" />
		<span className="text-sm">{message}</span>
	</div>
));
ErrorState.displayName = "ErrorState";

const EmptyState = memo(({ message }: { message: string }) => (
	<div className="text-center text-muted-foreground py-4 text-sm">
		{message}
	</div>
));
EmptyState.displayName = "EmptyState";

const DocumentButton = memo(
	({
		filePath,
		onClick,
	}: {
		filePath: string;
		onClick: (path: string) => void;
	}) => (
		<Button
			variant="link"
			onClick={() => onClick(filePath)}
			className="inline-block px-1 py-0.5 bg-accent text-accent-foreground rounded hover:bg-accent/80 text-xs border border-accent transition-colors hover:underline"
		>
			Open Document
		</Button>
	),
);
DocumentButton.displayName = "DocumentButton";

const NewsItem: FC<{ item: NewsDoc; onOpenFile: (p: string) => void }> = memo(
	({ item, onOpenFile }) => (
		<li className="bg-accent/20 hover:bg-accent/50 transition-colors rounded-md shadow-sm p-2 border border-border/30">
			<div className="flex flex-col gap-0.5">
				<span className="font-medium text-base text-primary mb-0.5 line-clamp-2">
					{item.newsHeadline}
				</span>
				<span className="text-xs text-muted-foreground mb-1">
					{item.newsSource} &bull;{" "}
					{new Date(item.addedDate).toLocaleDateString()}
				</span>
				<p className="text-sm text-foreground whitespace-pre-line line-clamp-4 mb-1">
					{item.newsBody}
				</p>
				{item.applicationDocumentDetailsList?.length > 0 && (
					<div className="mt-1 flex flex-wrap gap-2">
						{item.applicationDocumentDetailsList.map((doc) => (
							<DocumentButton
								key={doc.id}
								filePath={doc.filePath}
								onClick={onOpenFile}
							/>
						))}
					</div>
				)}
			</div>
		</li>
	),
);
NewsItem.displayName = "NewsItem";

const ExchangeItem: FC<{ item: ExchangeDoc; onOpenFile: (p: string) => void }> =
	memo(({ item, onOpenFile }) => (
		<li className="bg-accent/20 hover:bg-accent/50 transition-colors rounded-md shadow-sm p-2 border border-border/30">
			<div className="flex flex-col gap-0.5">
				<span className="font-medium text-base text-primary mb-0.5 line-clamp-2">
					{item.messageTitle}
				</span>
				<span className="text-xs text-muted-foreground mb-1">
					{item.addedDate
						? new Date(item.addedDate).toLocaleDateString()
						: "N/A"}
				</span>
				<p className="text-sm text-foreground whitespace-pre-line line-clamp-4 mb-1">
					{item.messageBody}
				</p>
				{item.filePath && (
					<div className="mt-1">
						<DocumentButton filePath={item.filePath} onClick={onOpenFile} />
					</div>
				)}
			</div>
		</li>
	));
ExchangeItem.displayName = "ExchangeItem";

export const Route = createLazyRoute("/disclosures")({
	component: Disclosures,
});

export default function Disclosures() {
	const routeContext = useRouteContext({ strict: false });

	const [tab, setTab] = useState("news");
	const newsIdPrefix = useId();
	const exchangeIdPrefix = useId();

	const {
		data: newsData,
		error: newsError,
		isPending: newsIsPending,
	} = getCompanyNews();

	const {
		data: exchangeData,
		error: exchangeError,
		isPending: exchangeIsPending,
	} = gtExchangeMessages();

	const listHeight = useMemo(
		() =>
			routeContext.fullscreen ? LIST_HEIGHT.FULLSCREEN : LIST_HEIGHT.NORMAL,
		[routeContext.fullscreen],
	);

	const handleOpenFile = useCallback((filePath: string) => {
		openFileInNewTab(filePath);
	}, []);

	const renderNewsItems = useCallback(
		() => (
			<>
				{newsData?.map((news: NewsDoc, index: number) => (
					<NewsItem
						key={`${newsIdPrefix}-${news.id}-${index}`}
						item={news}
						onOpenFile={handleOpenFile}
					/>
				))}
			</>
		),
		[newsData, handleOpenFile, newsIdPrefix],
	);

	const renderExchangeItems = useCallback(
		() => (
			<>
				{exchangeData?.map((msg: ExchangeDoc, index: number) => (
					<ExchangeItem
						key={`${exchangeIdPrefix}-${msg.id}-${index}`}
						item={msg}
						onOpenFile={handleOpenFile}
					/>
				))}
			</>
		),
		[exchangeData, handleOpenFile, exchangeIdPrefix],
	);

	const content = useMemo(() => {
		if (tab === "news") {
			if (newsIsPending) return <LoadingState />;
			if (newsError)
				return <ErrorState message="Failed to load company news." />;
			if (!newsData || newsData.length === 0)
				return <EmptyState message="No company news available." />;
			return (
				<div className="space-y-3 pb-3">
					<ul className="space-y-3">{renderNewsItems()}</ul>
				</div>
			);
		}
		if (tab === "exchange") {
			if (exchangeIsPending) return <LoadingState />;
			if (exchangeError)
				return <ErrorState message="Failed to load exchange messages." />;
			if (!exchangeData || exchangeData.length === 0)
				return <EmptyState message="No exchange messages available." />;
			return (
				<div className="space-y-3 pb-3">
					<ul className="space-y-3">{renderExchangeItems()}</ul>
				</div>
			);
		}
		return null;
	}, [
		tab,
		newsIsPending,
		newsError,
		newsData,
		renderNewsItems,
		exchangeIsPending,
		exchangeError,
		exchangeData,
		renderExchangeItems,
	]);

	return (
		<div className="w-full h-full flex flex-col">
			<div className="sticky top-0 z-10 bg-background p-1">
				<Tabs value={tab} onValueChange={setTab} className="w-full">
					<TabsList className="w-full grid grid-cols-2 gap-1">
						<TabsTrigger value="news" className={TAB_TRIGGER_STYLES}>
							<Newspaper className="w-4 h-4 shrink-0" />
							Company News
						</TabsTrigger>
						<TabsTrigger value="exchange" className={TAB_TRIGGER_STYLES}>
							<MessageCircleMore className="w-4 h-4 shrink-0" />
							Exchange Messages
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>
			<div
				style={{
					height: listHeight,
					scrollbarWidth: "none",
					msOverflowStyle: "none",
				}}
				className="overflow-y-auto overflow-x-hidden px-1"
			>
				{content}
			</div>
			<BackButton showBack={true} />
		</div>
	);
}
