/**
 * @deprecated Use useAuth from @/lib/auth instead
 * This hook is kept for backward compatibility but will be removed in future versions
 */
// export const isAuthorized = () => {
// 	const { isAuthenticated } = useAuthContext();
// 	return isAuthenticated;
// };

// export function getLocalUser() {
// 	const { useStateItem } = useAppState();
// 	const [user] = useStateItem("User");
// 	return user;
// }

// export async function setLocalUser(email: string) {
// 	const { callAction } = useAppState();

// 	return await callAction("setUser", {
// 		email,
// 		image: null,
// 	});
// }
