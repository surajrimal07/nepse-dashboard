import { useEffect, useState } from "react";
import { setUser, userItem } from "@/lib/storage/user-storage";
import type { User, UserFields } from "@/types/user-types";

export function useUser() {
	const [user, setLocalUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let mounted = true;

		userItem.getValue().then((value) => {
			if (mounted) {
				setLocalUser(value);
				setIsLoading(false);
			}
		});

		const unwatch = userItem.watch((newUser) => {
			if (mounted) {
				setLocalUser(newUser);
			}
		});

		return () => {
			mounted = false;
			unwatch();
		};
	}, []);

	const updateUser = (patch: UserFields) => setUser(patch);

	return {
		user,
		isLoading,
		setUser: updateUser,
		logout: () => setUser({ email: null, image: null }),
	};
}
