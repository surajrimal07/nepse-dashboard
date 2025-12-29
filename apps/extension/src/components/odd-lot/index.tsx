// import type { User } from "@supabase/supabase-js";
// import { memo, useCallback, useEffect, useState } from "react";
// import { toast } from "sonner";
// import { useShallow } from "zustand/react/shallow";

// import NotLoggedInView from "@/components/auth-tab/not-logged";

// import BackButton from "@/components/back-button";
// import MarketClosed from "@/components/market-closed";
// import { OddLotSkeleton } from "@/components/odd-lot/loading";
// import { OrderForm } from "@/components/odd-lot/OrderForm";
// import { OrdersList } from "@/components/odd-lot/OrdersList";
// import { TabNavigation } from "@/components/odd-lot/TabNavigation";
// import { useHandleSignIn } from "@/hooks/handle-action";
// import useScreenView from "@/hooks/usePageView";
// import { supabase } from "@/lib/supabase";
// import { useIndexState } from "@/state/index-state";
// import { EventName } from "@/types/analytics-types";
// import { OpenPanelWeb } from "@/utils/open-panel-web";

// interface OddlotProps {
// 	onBack?: () => void;
// }

// const OddLot = memo(({ onBack }: OddlotProps) => {
// 	useScreenView("/odd-lot");

// 	const [activeTab, setActiveTab] = useState<"all" | "my">("all");
// 	const [loadingState, setLoadingState] = useState<boolean>(true);

// 	const [user, setUser] = useState<User | null>(null);
// 	const [isFormOpen, setIsFormOpen] = useState(false);
// 	const isNepseOpen = useIndexState(
// 		useShallow((state) => state.nepseState.isOpen),
// 	);

// 	const useSignIn = useHandleSignIn();

// 	useEffect(() => {
// 		const checkSession = async () => {
// 			try {
// 				const {
// 					data: { session },
// 				} = await supabase.auth.getSession();

// 				if (session?.user && !session.user.is_anonymous) {
// 					setUser(session.user);
// 				}

// 				setLoadingState(false);
// 			} catch (error) {
// 				OpenPanelWeb.track(EventName.GET_USER_FAILED, {
// 					error: error instanceof Error ? error.message : String(error),
// 					name: "Nepse Chat",
// 				});
// 				toast.error("Failed to check authentication session");
// 				setLoadingState(false);
// 			}
// 		};

// 		checkSession();
// 	}, []);

// 	const handleAddOrder = useCallback(() => {
// 		toast.success("Order added successfully");
// 		setIsFormOpen(false);
// 	}, []);

// 	const handleLogin = useCallback(async () => {
// 		await useSignIn();
// 	}, []);

// 	if (loadingState) {
// 		return <OddLotSkeleton />;
// 	}

// 	if (!user) {
// 		toast.info("Please log in to access Odd Lot");
// 		return <NotLoggedInView />;
// 	}

// 	if (isNepseOpen) {
// 		return <MarketClosed />;
// 	}

// 	return (
// 		<div className="flex flex-col w-full overflow-hidden h-full">
// 			<TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

// 			<main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
// 				<OrdersList type={activeTab} />
// 			</main>
// 			<div className="absolute bottom-2 right-4">
// 				<BackButton onBack={onBack} showAdd={() => setIsFormOpen(true)} />
// 			</div>

// 			{isFormOpen && (
// 				<OrderForm
// 					onsubmit={handleAddOrder}
// 					onClose={() => setIsFormOpen(false)}
// 				/>
// 			)}
// 		</div>
// 	);
// });

// export default OddLot;
// OddLot.displayName = "OddLot";
