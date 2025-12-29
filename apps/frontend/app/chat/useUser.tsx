// import { useEffect, useState } from "react";
// import { verifyUser } from "./actions";
// import type { AuthUser } from "./types";

// export function useAuthorization(user: AuthUser | null) {
// 	const [isAuthorized, setIsAuthorized] = useState(false);
// 	const [isVerifying, setIsVerifying] = useState(false);

// 	useEffect(() => {
// 		if (!user || !user.email || !user.randomId) {
// 			setIsAuthorized(false);
// 			setIsVerifying(false);
// 			return;
// 		}

// 		setIsVerifying(true);

// 		verifyUser(user)
// 			.then((result) => {
// 				setIsAuthorized(Boolean(result));
// 			})
// 			.catch(() => {
// 				setIsAuthorized(false);
// 			})
// 			.finally(() => {
// 				setIsVerifying(false);
// 			});
// 	}, [user]);

// 	return { isAuthorized, isVerifying };
// }
