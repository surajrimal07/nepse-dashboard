// import { useStore } from "zustand/react";
// import { createStore } from "zustand/vanilla";
// import { mutative } from "zustand-mutative";
// import type { RateLimit } from "@/types/rate-limit-types";

// export interface RateLimitState {
// 	rateLimit: RateLimit;
// 	setRateLimit: (rateLimit: RateLimit) => void;
// }

// export const rateLimitState = createStore<RateLimitState>()(
// 	mutative((set) => ({
// 		rateLimit: {
// 			success: true,
// 			limit: 0,
// 			windowInSeconds: 0,
// 			remaining: 0,
// 			ttl: 0,
// 		},

// 		setRateLimit: (rateLimit: RateLimit) => {
// 			set((state) => {
// 				state.rateLimit = rateLimit;
// 			});
// 		},
// 	})),
// );

// export function useRateLimitState<T>(selector: (state: RateLimitState) => T) {
// 	return useStore(rateLimitState, selector);
// }
