// import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
// import { memo, useMemo } from "react";
// import type { TabsType } from "@/types/odd-types";
// import { tabsTypeValues } from "@/types/odd-types";

// const OrderCardSkeletonBase = memo(() => (
// 	<>
// 		<div className="flex justify-between items-start mb-2">
// 			<div className="grow mr-2">
// 				<div className="flex justify-between items-center">
// 					<div className="flex items-center gap-2">
// 						<Skeleton className="h-4 w-16" />
// 						<Skeleton className="h-5 w-12 rounded-full" />
// 						<Skeleton className="h-5 w-16 rounded-full" />
// 					</div>
// 				</div>
// 				<Skeleton className="h-3 w-3/4 mt-1" />
// 			</div>
// 		</div>
// 		<div className="flex justify-between">
// 			<Skeleton className="h-4 w-20" />
// 			<Skeleton className="h-4 w-24" />
// 			<Skeleton className="h-4 w-16" />
// 		</div>
// 	</>
// ));

// OrderCardSkeletonBase.displayName = "OrderCardSkeletonBase";

// export const OrderCardSkeleton = memo(() => (
// 	<div className="border rounded-lg p-2 mb-2 border-l-4 border-gray-500 space-y-2 bg-card">
// 		<OrderCardSkeletonBase />
// 		<div className="flex space-x-1">
// 			<Skeleton className="h-7 w-7 rounded-full" />
// 			<Skeleton className="h-7 w-7 rounded-full" />
// 		</div>
// 	</div>
// ));

// OrderCardSkeleton.displayName = "OrderCardSkeleton";

// export const MyOrderCardSkeleton = memo(() => (
// 	<div className="border rounded-lg p-2 mb-2 border-l-4 border-gray-500 space-y-2 bg-card">
// 		<OrderCardSkeletonBase />
// 		<div className="flex space-x-1">
// 			<Skeleton className="h-7 w-7 rounded-full" />
// 			<Skeleton className="h-7 w-7 rounded-full" />
// 		</div>
// 		<div className="space-y-2 mt-2">
// 			<div className="border border-gray-700 rounded-md overflow-hidden">
// 				<div className="px-2 py-2 flex items-center justify-between">
// 					<div className="flex items-center">
// 						<Skeleton className="h-4 w-4 mr-2" />
// 						<Skeleton className="h-4 w-32" />
// 						<Skeleton className="h-5 w-6 rounded-full ml-2" />
// 					</div>
// 					<Skeleton className="h-4 w-4" />
// 				</div>
// 			</div>
// 		</div>
// 	</div>
// ));

// MyOrderCardSkeleton.displayName = "MyOrderCardSkeleton";

// export const AllOrderCardSkeleton = memo(() => (
// 	<div className="border rounded-lg p-2 mb-2 border-l-4 border-gray-500 space-y-2 bg-card">
// 		<OrderCardSkeletonBase />
// 		<div className="flex space-x-1">
// 			<Skeleton className="h-7 w-7 rounded-full" />
// 			<Skeleton className="h-7 w-7 rounded-full" />
// 			<Skeleton className="h-7 w-12 rounded-full" />
// 		</div>
// 	</div>
// ));

// AllOrderCardSkeleton.displayName = "AllOrderCardSkeleton";

// export const OrdersListSkeleton = memo(({ type }: { type: TabsType }) => {
// 	const isFullScreen = useIsFullScreen();

// 	const { SkeletonCard, skeletonCount } = useMemo(
// 		() => ({
// 			SkeletonCard:
// 				type === tabsTypeValues.MY ? MyOrderCardSkeleton : AllOrderCardSkeleton,
// 			skeletonCount: isFullScreen ? 10 : 5,
// 		}),
// 		[type, isFullScreen],
// 	);

// 	const skeletonItems = useMemo(
// 		() =>
// 			Array.from({ length: skeletonCount }, (_, index) => (
// 				<SkeletonCard key={index} />
// 			)),
// 		[SkeletonCard, skeletonCount],
// 	);

// 	return (
// 		<div className="p-1.5 space-y-2 overflow-y-auto grow">{skeletonItems}</div>
// 	);
// });

// OrdersListSkeleton.displayName = "OrdersListSkeleton";

// export const OddLotSkeleton = memo(() => (
// 	<div className="flex flex-col w-full h-full space-y-3 p-3">
// 		<div className="flex space-x-2">
// 			<Skeleton className="h-10 w-20" />
// 			<Skeleton className="h-10 w-20" />
// 		</div>
// 		<div className="flex-1 space-y-2">
// 			<Skeleton className="h-full w-full" />
// 		</div>
// 	</div>
// ));

// OddLotSkeleton.displayName = "OddLotSkeleton";
