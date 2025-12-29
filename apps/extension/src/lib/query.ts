import { ConvexQueryClient } from "@convex-dev/react-query";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ConvexReactClient } from "convex/react";
import { toast } from "sonner";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
if (!CONVEX_URL) {
	throw new Error("missing VITE_CONVEX_URL envar");
}

export const convex = new ConvexReactClient(CONVEX_URL as string, {
	unsavedChangesWarning: false,
});

export const convexQueryClient = new ConvexQueryClient(convex);

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			queryKeyHashFn: convexQueryClient.hashFn(),
			queryFn: convexQueryClient.queryFn(),
		},
	},
	queryCache: new QueryCache({
		onError: (error, query) => {
			const errorDescription =
				typeof query.meta?.errorDescription === "string"
					? query.meta.errorDescription
					: "Something went wrong";

			toast.error(errorDescription, {
				description: error instanceof Error ? error.message : undefined,
			});
		},
	}),
	mutationCache: new MutationCache({
		onError: (error, _variables, _context, mutation) => {
			const errorDescription =
				typeof mutation.meta?.errorDescription === "string"
					? mutation.meta.errorDescription
					: "Something went wrong";

			toast.error(errorDescription, {
				description: error instanceof Error ? error.message : undefined,
			});
		},
	}),
});

convexQueryClient.connect(queryClient);
