// import type { aiErrors } from "@nepse-dashboard/ai/types";
// import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";
// import { useEffect, useState } from "react";

// type SummaryState = {
// 	isLoading: boolean;
// 	error?: aiErrors;
// 	message?: string;
// 	summary: Doc<"news"> | null;
// 	needsParsing: boolean;
// };

// export function useNewsSummary(url: string) {
// 	const { callAction } = useAppState();

// 	const [state, setState] = useState<SummaryState>({
// 		isLoading: true,
// 		error: undefined,
// 		message: undefined,
// 		summary: null,
// 		needsParsing: false,
// 	});

// 	useEffect(() => {
// 		let cancelled = false;

// 		const fetch = async () => {
// 			setState({
// 				isLoading: true,
// 				error: undefined,
// 				message: undefined,
// 				summary: null,
// 				needsParsing: false,
// 			});

// 			// Check cache first
// 			const cacheResult = await callAction("getNewsSummaryCache", url);

// 			if (cancelled) return;

// 			if (cacheResult.success && cacheResult.data) {
// 				// Cache hit - return immediately
// 				setState({
// 					isLoading: false,
// 					error: undefined,
// 					message: undefined,
// 					summary: cacheResult.data,
// 					needsParsing: false,
// 				});
// 			} else {
// 				// Cache miss - need to parse page
// 				setState({
// 					isLoading: false,
// 					error: undefined,
// 					message: undefined,
// 					summary: null,
// 					needsParsing: true,
// 				});
// 			}
// 		};

// 		fetch();

// 		return () => {
// 			cancelled = true;
// 		};
// 	}, [url]);

// 	return state;
// }
