// import type { aiErrors } from "@nepse-dashboard/ai/types";
// import { AI_CODES } from "@nepse-dashboard/ai/types";
// import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";
// import { useEffect, useRef, useState } from "react";
// import type { newsDatatype } from "@/types/news-types";

// type GenerateState = {
// 	isLoading: boolean;
// 	message: aiErrors | null;
// 	summary: Doc<"news"> | null;
// };

// export function useGenerateSummary(
// 	shouldGenerate: boolean,
// 	newsData: newsDatatype,
// ) {
// 	const { callAction } = useAppState();

// 	// UseRef avoids re-triggering effects due to object identity
// 	const dataRef = useRef(newsData);
// 	dataRef.current = newsData;

// 	const [state, setState] = useState<GenerateState>({
// 		isLoading: false,
// 		message: null,
// 		summary: null,
// 	});

// 	useEffect(() => {
// 		if (!shouldGenerate) return;

// 		// Already have summary? No need to call again.
// 		if (state.summary) return;

// 		let cancelled = false;
// 		const { content, url, lang } = dataRef.current;

// 		// Validation first (cheap)
// 		if (!content || !url || (lang !== "eng" && lang !== "npi")) {
// 			if (!cancelled) {
// 				setState({
// 					isLoading: false,
// 					message: AI_CODES.UNABLE_TO_EXTRACT,
// 					summary: null,
// 				});
// 			}
// 			return;
// 		}

// 		setState((prev) =>
// 			prev.isLoading
// 				? prev // avoid re-setting state if already loading
// 				: { isLoading: true, message: null, summary: null },
// 		);

// 		const run = async () => {
// 			try {
// 				const response = await callAction("getNewsSummary", dataRef.current);
// 				if (cancelled) return;

// 				if (!response?.success || !response.data) {
// 					setState({
// 						isLoading: false,
// 						message: (response?.message as aiErrors) || AI_CODES.UNKNOWN_ERROR,
// 						summary: null,
// 					});
// 					return;
// 				}

// 				setState({
// 					isLoading: false,
// 					message: null,
// 					summary: response.data,
// 				});
// 			} catch {
// 				if (!cancelled) {
// 					setState({
// 						isLoading: false,
// 						message: AI_CODES.NETWORK_ERROR,
// 						summary: null,
// 					});
// 				}
// 			}
// 		};

// 		run();

// 		return () => {
// 			cancelled = true;
// 		};
// 	}, [shouldGenerate]);

// 	return state;
// }
