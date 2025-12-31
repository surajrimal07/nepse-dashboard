import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";

export function AuthGate() {
	const router = useRouter();
	const { isAuthenticated, isLoading } = useAuth();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.navigate({
				to: "/profile",
				search: { fromAuthFlow: true },
			});
		}
	}, [isLoading, isAuthenticated, router]);

	return null;
}
