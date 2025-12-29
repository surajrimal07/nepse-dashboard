// import type { CSSProperties, FC } from "react";
// import { memo, useCallback, useMemo, useRef, useState } from "react";
// import { FixedSizeList } from "react-window";
// import { useShallow } from "zustand/react/shallow";
// import { AllOrderCard } from "@/components/odd-lot/AllOrderCard";
// import { EmptyOrdersState } from "@/components/odd-lot/empty-order";
// import { OrdersListSkeleton } from "@/components/odd-lot/loading";
// import { MyOrderCard } from "@/components/odd-lot/MyOrderCard";
// import { OrderSearch } from "@/components/odd-lot/OrderSearch";
// import {
// 	selectCompletions,
// 	selectFetchMyCompletions,
// } from "@/selectors/completion-selector";
// import {
// 	selectGetAllOddlot,
// 	selectGetMyOddlot,
// 	selectIsOddlotLoading,
// 	selectMyOddLot,
// 	selectOddLot,
// } from "@/selectors/odd-selector";
// import { useCompletionsState } from "@/state/completions-state";
// import { useOddlotState } from "@/state/odd-state";
// import type { TabsType } from "@/types/odd-types";
// import { OddLotOrderStatusConst, tabsTypeValues } from "@/types/odd-types";

// interface OrdersListProps {
// 	type: TabsType;
// }

// const ITEM_HEIGHT = 100;
// const LIST_HEIGHT = 455;

// const OrdersListComponent: FC<OrdersListProps> = ({ type }) => {
// 	const { oddLot, myOddLot, isOddlotLoading, getAllOddlot, getMyOddlot } =
// 		useOddlotState(
// 			useShallow((s) => ({
// 				oddLot: selectOddLot(s),
// 				myOddLot: selectMyOddLot(s),
// 				isOddlotLoading: selectIsOddlotLoading(s),
// 				getAllOddlot: selectGetAllOddlot(s),
// 				getMyOddlot: selectGetMyOddlot(s),
// 			})),
// 		);

// 	const { fetchMyCompletions, completions } = useCompletionsState(
// 		useShallow((s) => ({
// 			fetchMyCompletions: selectFetchMyCompletions(s),
// 			completions: selectCompletions(s),
// 		})),
// 	);

// 	const [searchTerm, setSearchTerm] = useState("");
// 	const initialFetch = useRef({ fetched: false });

// 	const filteredOrders = useMemo(() => {
// 		const ordersSource = type === tabsTypeValues.ALL ? oddLot : myOddLot || [];

// 		let orders = ordersSource.filter(
// 			(order) => order.status !== OddLotOrderStatusConst.DELETED,
// 		);

// 		if (searchTerm && type === tabsTypeValues.ALL) {
// 			orders = orders.filter((order) =>
// 				order.stock_symbol.toUpperCase().includes(searchTerm.toUpperCase()),
// 			);
// 		}
// 		return orders;
// 	}, [type, oddLot, myOddLot, searchTerm]);

// 	const isFullScreen = useIsFullScreen();

// 	const handleReload = useCallback(() => {
// 		getAllOddlot();
// 		getMyOddlot();
// 		fetchMyCompletions();
// 	}, [getAllOddlot, getMyOddlot, fetchMyCompletions]);

// 	// always fetch both complete data on first load
// 	if (!initialFetch.current.fetched) {
// 		handleReload();
// 		initialFetch.current.fetched = true;
// 	}

// 	const handleSearchChange = useCallback(
// 		(term: string) => {
// 			if (isOddlotLoading) {
// 				return;
// 			}
// 			setSearchTerm(term);
// 		},
// 		[isOddlotLoading],
// 	);

// 	const ItemRenderer = useCallback(
// 		({ index, style }: { index: number; style: CSSProperties }) => {
// 			const order = filteredOrders[index];

// 			return type === tabsTypeValues.MY ? (
// 				<MyOrderCard
// 					key={order.id}
// 					order={order}
// 					completions={completions[order.id] || []}
// 					style={style}
// 				/>
// 			) : (
// 				<AllOrderCard
// 					key={order.id}
// 					order={order}
// 					completions={
// 						completions[order.id] && completions[order.id].length > 0
// 							? completions[order.id][0]
// 							: undefined
// 					}
// 					style={style}
// 				/>
// 			);
// 		},
// 		[filteredOrders, type, completions],
// 	);

// 	const renderContent = useMemo(() => {
// 		if (isOddlotLoading) {
// 			return <OrdersListSkeleton type={type} />;
// 		}

// 		if (!filteredOrders || filteredOrders.length === 0) {
// 			return <EmptyOrdersState type={type} />;
// 		}

// 		return (
// 			<FixedSizeList
// 				height={isFullScreen ? 800 : LIST_HEIGHT}
// 				width="100%"
// 				itemCount={filteredOrders.length}
// 				itemSize={ITEM_HEIGHT}
// 				overscanCount={5}
// 				className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]"
// 			>
// 				{ItemRenderer}
// 			</FixedSizeList>
// 		);
// 	}, [isOddlotLoading, filteredOrders, type, ItemRenderer, isFullScreen]);

// 	return (
// 		<div className="flex flex-col h-full">
// 			{type === tabsTypeValues.ALL && (
// 				<OrderSearch
// 					searchTerm={searchTerm}
// 					onSearchChange={handleSearchChange}
// 				/>
// 			)}
// 			<div className="space-y-0 grow min-h-0">{renderContent}</div>
// 		</div>
// 	);
// };

// export const OrdersList = memo(OrdersListComponent);
// OrdersList.displayName = "OrdersList";
