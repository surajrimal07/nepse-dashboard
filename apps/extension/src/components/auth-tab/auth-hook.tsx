import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/auth-context";

export const AuthGate = () => {
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
};
