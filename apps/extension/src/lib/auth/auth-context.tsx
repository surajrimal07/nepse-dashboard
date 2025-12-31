import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { useQuery } from "convex/react";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import { useUser } from "@/hooks/useUser";
import type { User } from "@/types/user-types";

interface AuthContextValue {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: User | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const { user, isLoading: userLoading } = useUser();

	const authResult = useQuery(
		api.users.isUserAuthorized,
		!userLoading && user?.randomId
			? {
					randomId: user.randomId,
					email: user.email ?? undefined,
				}
			: "skip",
	);

	const value = useMemo<AuthContextValue>(() => {
		// Still loading user from storage
		if (userLoading || !user) {
			return {
				isAuthenticated: false,
				isLoading: true,
				user: null,
			};
		}

		if (!user.randomId) {
			return {
				isAuthenticated: false,
				isLoading: false,
				user: null,
			};
		}

		// Query still loading or undefined
		if (authResult === undefined) {
			return {
				isAuthenticated: false,
				isLoading: true,
				user,
			};
		}

		// Handle structured response from isUserAuthorized
		return {
			isAuthenticated: authResult.success,
			isLoading: false,
			user,
		};
	}, [userLoading, user, authResult]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
