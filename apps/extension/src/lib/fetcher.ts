// import { URLS } from "@/constants/app-urls";
// import { getAppState } from "@/entrypoints/background";
// import type { AllBrokers } from "@/types/account-types";
// import { AllBrokersSchema } from "@/types/account-types";
// import { EventName } from "@/types/analytics-types";
// import type { Version } from "@/types/socket-type";
// import { VersionSchema } from "@/types/socket-type";
// import type { UserProfile } from "@/types/user-types";
// import { identifyUserSW } from "@/utils/identify-user-sw";
// import { OpenPanelSDK } from "@/utils/open-panel-sdk";

// switch to convex to fetch latest version
// export async function getUpdate(): Promise<Version | null> {
// 	try {
// 		const response = await fetch(`${URLS.edge_url}/app-version`, {
// 			headers: {
// 				Authorization: `${import.meta.env.VITE_API_KEY}`,
// 			},
// 		});

// 		if (!response.ok) {
// 			OpenPanelSDK.track(EventName.EXCEPTION, {
// 				error: `Response not ok: ${response.statusText}`,
// 				name: "getUpdate",
// 			});
// 			return null;
// 		}

// 		const data = await response.json();

// 		const validatedData = VersionSchema.safeParse(data);

// 		if (!validatedData.success) {
// 			OpenPanelSDK.track(EventName.EXCEPTION, {
// 				error: `Validation failed: ${validatedData.error}`,
// 				name: "getUpdate",
// 			});

// 			return null;
// 		}

// 		return validatedData.data;
// 	} catch (error) {
// 		OpenPanelSDK.track(EventName.EXCEPTION, {
// 			error: error instanceof Error ? error.message : String(error),
// 			name: "getUpdate",
// 		});

// 		return null;
// 	}
// }

// export async function signInAnonymously(): Promise<boolean> {
// 	try {
// 		const appState = getAppState();

// 		const response = await fetch(
// 			`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/signup`,
// 			{
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json",
// 					apikey: `${import.meta.env.VITE_SUPABASE_KEY}`,
// 				},
// 				body: JSON.stringify({
// 					data: {},
// 				}),
// 			},
// 		);

// 		if (!response.ok) {
// 			OpenPanelSDK.track(EventName.EXCEPTION, {
// 				error: `Response not ok: ${response.statusText}`,
// 				name: "signInAnonymously",
// 			});

// 			return false;
// 		}

// 		const data = await response.json();

// 		if (data && data.user) {
// 			const userProfile: UserProfile = {
// 				firstName: data.user.user_metadata.first_name ?? null,
// 				lastName: data.user.user_metadata.last_name ?? null,
// 				email: data.user.email ?? null,
// 				profilePicture: data.user.user_metadata.avatar_url ?? null,
// 				supabaseId: data.user.id,
// 				supabaseAccessToken: data.access_token,
// 				is_anonymous: data.user.is_anonymous ?? true,
// 			};

// 			OpenPanelSDK.clear(); // clear previous user session and identity

// 			appState.set({ userProfile });
// 			appState.set({ anonPending: false });
// 			appState.set({ loginPending: true });

// 			identifyUserSW(userProfile);
// 		}

// 		return true;
// 	} catch (error) {
// 		OpenPanelSDK.track(EventName.EXCEPTION, {
// 			error: error instanceof Error ? error.message : String(error),
// 			name: "signInAnonymously",
// 		});

// 		return false;
// 	}
// }

// // @@ modify it to include configs too
// switch to convex to fetch brokers list
// export async function getConfigs(): Promise<AllBrokers | null> {
// 	try {
// 		if (!import.meta.env.VITE_API_KEY) {
// 			OpenPanelSDK.track(EventName.EXCEPTION, {
// 				error: "Missing API_KEY or API_URL environment variables",
// 				name: "getConfigs",
// 			});
// 			return null;
// 		}

// 		const response = await fetch(`${URLS.edge_url}/brokers`, {
// 			headers: { Authorization: import.meta.env.VITE_API_KEY },
// 		});

// 		if (!response.ok) {
// 			OpenPanelSDK.track(EventName.EXCEPTION, {
// 				error: `Response not ok: ${response.statusText}`,
// 				name: "getConfigs",
// 			});
// 			return null;
// 		}

// 		const data = await response.json();

// 		const validatedData = AllBrokersSchema.safeParse(data);

// 		if (!validatedData.success) {
// 			console.error("getConfigs validation failed", validatedData.error);

// 			OpenPanelSDK.track(EventName.SCHEMA_EXCEPTION, {
// 				error: `Validation failed: ${validatedData.error}`,
// 				name: "getConfigs",
// 			});
// 			return null;
// 		}

// 		return validatedData.data;
// 	} catch (error) {
// 		OpenPanelSDK.track(EventName.EXCEPTION, {
// 			error: error instanceof Error ? error.message : String(error),
// 			name: "getConfigs",
// 		});

// 		return null;
// 	}
// }
