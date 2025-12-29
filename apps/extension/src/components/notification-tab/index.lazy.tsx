import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import { Badge } from "@nepse-dashboard/ui/components/badge";
import { Separator } from "@nepse-dashboard/ui/components/separator";
import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@nepse-dashboard/ui/components/tabs";
import { createLazyRoute, useRouteContext } from "@tanstack/react-router";
import {
	AlertCircle,
	AlertTriangle,
	Bell,
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Globe,
	Info,
	User,
} from "lucide-react";
import { memo, useState } from "react";
import TimeAgo from "react-timeago";
import BackButton from "@/components/back-button/back-button";
import { useQueryWithStatus } from "@/hooks/useQueryWithStatus";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createLazyRoute("/notifications")({
	component: Notifications,
});

const LIST_HEIGHT = 530;

const VARIANT_CONFIGS = {
	success: {
		color: "bg-green-500/10 text-green-500 border-green-500/20",
		icon: CheckCircle,
	},
	warning: {
		color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
		icon: AlertTriangle,
	},
	error: {
		color: "bg-red-500/10 text-red-500 border-red-500/20",
		icon: AlertCircle,
	},
	info: {
		color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
		icon: Info,
	},
} as const;

const NotificationSkeleton = memo(() => (
	<div className="mb-2 border border-border/40 rounded-lg p-2">
		<div className="flex items-start gap-3">
			<Skeleton className="h-10 w-10 rounded-full shrink-0" />
			<div className="flex-1 space-y-2">
				<div className="flex items-center justify-between">
					<Skeleton className="h-5 w-32" />
					<Skeleton className="h-4 w-20" />
				</div>
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-3/4" />
			</div>
		</div>
	</div>
));

NotificationSkeleton.displayName = "NotificationSkeleton";

const NotificationItem = memo<{
	notification: Doc<"notification">;
}>(({ notification }) => {
	const config = VARIANT_CONFIGS[notification.variant];
	const IconComponent = config.icon;
	const [expanded, setExpanded] = useState(false);
	const TRUNCATE_LENGTH = 80;
	const isTruncatable =
		notification.body && notification.body.length > TRUNCATE_LENGTH;

	return (
		<div
			className={`mb-2 border border-border/30 rounded-md p-2 flex items-start gap-3 bg-card transition-colors hover:bg-accent/60`}
		>
			<div className={`rounded-full ${config.color}`}>
				{notification.icon ? (
					<span className="text-xl">{notification.icon}</span>
				) : (
					<IconComponent className="h-5 w-5" />
				)}
			</div>
			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between mb-1">
					<span className="font-medium text-sm truncate">
						{notification.title}
					</span>
					<Badge
						variant="outline"
						className={`ml-2 px-1.5 py-0.5 text-xs ${config.color}`}
					>
						{notification.variant}
					</Badge>
				</div>
				<div className="flex items-center">
					<p
						className={`text-sm text-muted-foreground flex-1 ${isTruncatable && !expanded ? "truncate" : "whitespace-pre-line"}`}
						style={{ marginBottom: 0 }}
					>
						{notification.body}
					</p>
					{isTruncatable && (
						<button
							type="button"
							aria-label={
								expanded ? "Collapse notification" : "Expand notification"
							}
							onClick={() => setExpanded((v) => !v)}
							className="ml-2 focus:outline-none"
							style={{ minWidth: 24 }}
						>
							{expanded ? (
								<ChevronUp className="h-5 w-5 text-muted-foreground" />
							) : (
								<ChevronDown className="h-5 w-5 text-muted-foreground" />
							)}
						</button>
					)}
				</div>
				<span className="text-[11px] text-muted-foreground/70">
					<TimeAgo date={notification._creationTime} live={true} />
				</span>
			</div>
		</div>
	);
});

NotificationItem.displayName = "NotificationItem";

const EmptyState = memo<{ type: "global" | "personal" }>(({ type }) => (
	<div className="flex flex-col items-center justify-center py-12 px-4">
		<div className="p-4 rounded-full bg-muted/30 mb-4">
			<Bell className="h-8 w-8 text-muted-foreground" />
		</div>
		<h3 className="font-semibold text-lg mb-2">No notifications yet</h3>
		<p className="text-sm text-muted-foreground text-center">
			{type === "global"
				? "You'll see important updates and announcements here"
				: "Your personal notifications will appear here"}
		</p>
	</div>
));

EmptyState.displayName = "EmptyState";

export default function Notifications() {
	const routeContext = useRouteContext({ strict: false });
	const { user, isLoading } = useAuth();

	const global = useQueryWithStatus(api.notification.getGlobal, {});
	const my = useQueryWithStatus(api.notification.getByUserId, {
		userId: user?.randomId,
	});

	const isLoadingData =
		isLoading || global.status === "pending" || my.status === "pending";

	return (
		<div
			className={`flex flex-col ${routeContext.fullscreen ? "h-full" : ""}`}
			style={
				!routeContext.fullscreen ? { height: `${LIST_HEIGHT}px` } : undefined
			}
		>
			<div className="sticky top-0 z-10 bg-background">
				<div className="p-2">
					<div className="flex items-center gap-2 mb-1">
						<Bell className="h-5 w-5" />
						<h2 className="text-lg font-semibold">Notifications</h2>
					</div>
					<p className="text-sm text-muted-foreground">
						Stay updated with latest news and personal alerts
					</p>
				</div>
				<Separator />
			</div>

			<Tabs
				defaultValue="global"
				className="flex-1 flex flex-col px-2 pt-2 overflow-hidden"
			>
				<TabsList className="grid w-full grid-cols-2 mb-1 shrink-0">
					<TabsTrigger value="global" className="flex items-center gap-1">
						<Globe className="h-4 w-4" />
						<span>Global</span>
						{!!global.data?.length && (
							<Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
								{global.data.length}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="personal" className="flex items-center gap-1">
						<User className="h-4 w-4" />
						<span>Personal</span>
						{!!my.data?.length && (
							<Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
								{my.data.length}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent
					value="global"
					className="flex-1 overflow-y-auto mt-0 pr-2 scrollbar-hide"
				>
					{isLoadingData ? (
						<div className="space-y-3">
							<NotificationSkeleton />
							<NotificationSkeleton />
							<NotificationSkeleton />
							<NotificationSkeleton />
							<NotificationSkeleton />
							<NotificationSkeleton />
						</div>
					) : global.data?.length ? (
						global.data.map((notification) => (
							<NotificationItem
								key={notification._id}
								notification={notification}
							/>
						))
					) : (
						<EmptyState type="global" />
					)}
				</TabsContent>

				<TabsContent
					value="personal"
					className="flex-1 overflow-y-auto mt-0 pr-2 scrollbar-hide"
				>
					{isLoadingData ? (
						<div className="space-y-3">
							<NotificationSkeleton />
							<NotificationSkeleton />
							<NotificationSkeleton />
						</div>
					) : my.data?.length ? (
						my.data.map((notification) => (
							<NotificationItem
								key={notification._id}
								notification={notification}
							/>
						))
					) : (
						<EmptyState type="personal" />
					)}
				</TabsContent>
			</Tabs>

			<div className="shrink-0">
				<BackButton showBack={true} />
			</div>
		</div>
	);
}
