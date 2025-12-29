// import { useState } from "react";
// import { toast } from "sonner";
// import { track } from "@/lib/analytics";
// import { Env, EventName } from "@/types/analytics-types";

// export const useLogout = () => {
// 	const { callAction } = useAppState();

// 	const [loading, setLoading] = useState(false);

// 	const handleLogout = async () => {
// 		try {
// 			setLoading(true);
// 			await callAction("setUser", {
// 				email: null,
// 				image: null,
// 			});

// 			toast.success("Successfully logged out");
// 		} catch (error) {
// 			void track({
// 				context: Env.CONTENT,
// 				eventName: EventName.LOGOUT_FAILED,
// 				params: {
// 					error: error instanceof Error ? error.message : String(error),
// 				},
// 			});

// 			toast.error(error instanceof Error ? error.message : String(error));
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	return { handleLogout, loading };
// };
