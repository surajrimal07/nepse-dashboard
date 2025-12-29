// import { useRouter } from "@tanstack/react-router";
// import type { ReactNode } from "react";
// import Loading from "@/components/loading";
// import { useAuth } from "./auth-context";

// interface AuthGuardProps {
// 	children: ReactNode;
// 	fallback?: ReactNode;
// 	requireAuth?: boolean;
// }

// export function AuthGuard({
// 	children,
// 	fallback,
// 	requireAuth = true,
// }: AuthGuardProps) {
// 	const { isAuthenticated, isLoading } = useAuth();
// 	const router = useRouter();

// 	if (isLoading) {
// 		return <>{fallback ?? <Loading />}</>;
// 	}

// 	if (requireAuth && !isAuthenticated) {
// 		router.navigate({
// 			to: "/profile",
// 			search: { fromAuthFlow: true },
// 		});
// 		return null;
// 	}

// 	return <>{children}</>;
// }
