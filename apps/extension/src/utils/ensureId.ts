// import { getAppState } from "@/entrypoints/background";

// export async function ensureRandomId() {
// 	const appInstance = getAppState();

// 	// Wait a tick to let Crann's storage hydration complete
// 	await new Promise((resolve) => setTimeout(resolve, 0));

// 	const user = appInstance.get().User;

// 	// If still sentinel or empty, we need to initialize
// 	if (!user.randomId || user.randomId === "__UNINITIALIZED__") {
// 		const newId = generateId();
// 		await appInstance.set({
// 			User: {
// 				...user,
// 				randomId: newId,
// 			},
// 		});
// 		return newId;
// 	}

// 	return user.randomId;
// }
