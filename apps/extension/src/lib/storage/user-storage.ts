import type { User, UserFields } from "@/types/user-types";
import { generateId } from "@/utils/utils";

export const userItem = storage.defineItem<User>("local:sync", {
	init: () => ({
		randomId: generateId(),
		email: null,
		image: null,
	}),
	fallback: {
		randomId: generateId(),
		email: null,
		image: null,
	},
});

export const getUser = () => userItem.getValue();

export async function setUser(patch: UserFields) {
	const prev = await userItem.getValue();
	await userItem.setValue({
		...prev,
		...patch,
		randomId: prev.randomId, // ensure randomId is unchanged
	});
}

export const watchUser = (
	callback: (newUser: User, oldUser: User | null) => void,
) => {
	return userItem.watch(callback);
};
