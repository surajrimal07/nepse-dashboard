import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { ConvexClient } from "convex/browser";
import { create } from "crann-fork";
import { browser, defineBackground } from "#imports";
import { autoIdentify } from "@/lib/analytics/identify";
import { updateBadge } from "@/lib/badge";
import { registerBackgroundListeners } from "@/lib/listners/background-rejection";
import { setupPinListener } from "@/lib/listners/pin-listner";
import { appState } from "@/lib/service/app-service";
import { Env, EventName } from "@/types/analytics-types";
import { ConnectionState } from "@/types/connection-type";
import { getLocation } from "@/utils/fetch-location";
import { Track } from "../../lib/analytics/analytics";
import { getUser, setUser } from "../../lib/storage/user-storage";
import { checkCommandShortcuts } from "./checkCommandShortcuts";
import { ExternalCommunication } from "./externalCommunication";
import { handleWebPushSubscription, setupNotification } from "./notification";
import { ExtensionConnection } from "./onCommunication";
import { onInstall } from "./onInstall";
import { setupContextMenu } from "./setupContextMenu";
import { setupShortcutListeners } from "./setupShortcutListeners";
import { suspensionManager } from "./suspension-manager";
import { userWatcher } from "./user-watcher";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

const SOCKET_HIGH_LATENCY_THRESHOLD = 10000;
const SOCKET_MEDIUM_LATENCY_THRESHOLD = 5000;
const PING_INTERVAL = 5000;

let appStateInstance: ReturnType<typeof create<typeof appState>> | undefined;
let convexInstance: ConvexClient | undefined;

if (!convexUrl) {
	void Track({
		context: Env.BACKGROUND,
		eventName: EventName.EXCEPTION,
		params: {
			error: "Missing CONVEX_URL environment variable",
			name: "getConvexClient",
		},
	});

	throw new Error("Missing environment variables, please contact support.");
}

export function getAppState(): ReturnType<typeof create<typeof appState>> {
	if (!appStateInstance) {
		appStateInstance = create(appState);
	}
	return appStateInstance;
}

export function getConvexClient(): ConvexClient {
	if (convexInstance) {
		return convexInstance;
	}

	convexInstance = new ConvexClient(convexUrl);
	return convexInstance;
}

export default defineBackground({
	type: "module",
	persistent: true,
	main() {
		const appInstance = getAppState();
		const convex = getConvexClient();

		let isConvexSetup = false;
		// let shouldExtract = true;

		registerBackgroundListeners();

		const initializeConvex = async () => {
			if (isConvexSetup) return;
			isConvexSetup = true;
			await setupConvex();
		};

		globalThis.addEventListener("activate", initializeConvex);

		// Extension startup
		browser.runtime.onStartup.addListener(initializeConvex);

		onInstall();

		setupContextMenu();
		setupShortcutListeners();

		checkCommandShortcuts();

		ExtensionConnection();
		ExternalCommunication();

		autoIdentify(); // start auto identify
		setupPinListener();

		(async () => {
			await getUser();
			await Promise.all([initializeConvex(), setupNotification()]);
		})();

		// ----- SETUP PING TO CONVEX -----
		async function setupPingToConvex() {
			const location = await getLocation();
			if (!location?.city_name) return;

			const user = await getUser();

			let isWebSocketConnected = true;
			const randomId = user.randomId;

			// Subscribe to Convex connection state
			const unsubscribe = convex.subscribeToConnectionState((state) => {
				isWebSocketConnected = state.isWebSocketConnected;

				// Update userLatency state immediately when connection status changes
				if (!state.isWebSocketConnected) {
					const startTime = Date.now();
					appInstance.set({
						userLatency: {
							lastPing: startTime,
							latency: 0,
							message: "WebSocket disconnected.",
							isConnected: ConnectionState.NO_CONNECTION,
						},
					});

					void Track({
						context: Env.BACKGROUND,
						eventName: EventName.CONVEX_EVENTS,
						params: {
							event: "disconnected",
						},
					});
				}
			});

			const ping = async () => {
				if (!isWebSocketConnected) {
					const now = Date.now();
					appInstance.set({
						userLatency: {
							lastPing: now,
							latency: 0,
							message: "No internet connection.",
							isConnected: ConnectionState.NO_CONNECTION,
						},
					});
					return;
				}

				try {
					const startTime = Date.now();
					const { latency } = await convex.mutation(api.userLatency.get, {
						time: startTime,
						location: location.city_name,
						randomId,
					});

					if (!latency) return;

					let isConnected: ConnectionState;
					let message: string;

					if (latency > SOCKET_HIGH_LATENCY_THRESHOLD) {
						isConnected = "high_latency";
						message = "High latency.";

						void Track({
							context: Env.BACKGROUND,
							eventName: EventName.CONVEX_EVENTS,
							params: {
								event: "high_latency",
								latency,
								location: location.city_name,
							},
						});
					} else if (latency > SOCKET_MEDIUM_LATENCY_THRESHOLD) {
						isConnected = "medium_latency";
						message = "Medium latency.";
					} else {
						isConnected = "connected";
						message = "Connected";
					}

					appInstance.set({
						userLatency: {
							lastPing: startTime,
							latency,
							message,
							isConnected,
						},
					});
				} catch (error) {
					// No internet or Convex not reachable
					const now = Date.now();
					appInstance.set({
						userLatency: {
							lastPing: now,
							latency: 0,
							message: "Server unreachable.",
							isConnected: ConnectionState.NO_CONNECTION,
						},
					});

					void Track({
						context: Env.BACKGROUND,
						eventName: EventName.CONVEX_EVENTS,
						params: {
							event: "ping_failed",
							error: String(error),
							location: location.city_name,
						},
					});
				}
			};

			// Ping immediately and then at intervals
			await ping();
			const intervalId = setInterval(ping, PING_INTERVAL);

			// Optional: return a cleanup function
			return () => {
				clearInterval(intervalId);
				unsubscribe();
			};
		}

		// ----- Convex change listener -----
		async function convexListner() {
			try {
				// ----- NEPSE CHANGE -----
				const nepseChange = await convex.query(
					api.IndexData.getNepseChange,
					{},
				);
				if (nepseChange) {
					updateBadge(nepseChange);
				}

				const unsubscribeNepse = convex.onUpdate(
					api.IndexData.getNepseChange,
					{},
					async (change) => {
						updateBadge(change);
					},
				);

				const isOpen = await convex.query(api.marketStatus.isOpen, {});

				if (isOpen !== undefined) {
					appInstance.set({ marketOpen: isOpen });
				}

				const unsubscribeMarketStatus = convex.onUpdate(
					api.marketStatus.isOpen,
					{},
					async (change) => {
						appInstance.set({ marketOpen: change });
					},
				);

				// ----- COMPANY LIST -----
				const companies = await convex.query(api.company.getAllCompanies, {});
				if (companies) {
					appInstance.set({ companiesList: companies });
				}

				const unsubscribeCompanies = convex.onUpdate(
					api.company.getAllCompanies,
					{},
					async (change) => {
						appInstance.set({ companiesList: change });
					},
				);

				// ----- DATA EXTRACTION STATUS -----
				// shouldExtract = await convex.query(api.users.isDataSendingAvailable, {
				// 	randomId: (await getUser()).randomId,
				// });

				// if (shouldExtract) {
				// 	sendMessage("startExtraction").catch((error) => {
				// 		// not mounted yet its fine
				// 	});
				// }

				// const unsubscribeDataAvailable = convex.onUpdate(
				// 	api.users.isDataSendingAvailable,
				// 	{ randomId: (await getUser()).randomId },
				// 	async (isAvailable) => {
				// 		if (isAvailable) {
				// 			sendMessage("startExtraction").catch((error) => {
				// 				// not mounted yet its fine
				// 			});
				// 		} else {
				// 			sendMessage("stopExtraction").catch((error) => {
				// 				// not mounted yet its fine
				// 			});
				// 		}
				// 	},
				// );

				// ----- WEB PUSH SUBSCRIPTION STATUS -----
				// On initial bg load, it always upload the new subscription
				const unsubscribeSubscription = convex.onUpdate(
					api.notification.doIHaveSubscription,
					{ userId: (await getUser()).randomId },
					async (hasSubscription) => {
						if (!hasSubscription) {
							await handleWebPushSubscription(true);
						}
					},
				);

				// ----- CLEANUP ON SUSPEND -----
				suspensionManager.register(() => {
					unsubscribeNepse();
					unsubscribeCompanies();
					unsubscribeSubscription();
					// unsubscribeDataAvailable();
					unsubscribeMarketStatus();
				});
			} catch (error) {
				void Track({
					context: Env.BACKGROUND,
					eventName: EventName.BACKGROUND_EXCEPTION,
					params: {
						error: String(error),
						name: "Convex Listener Setup",
					},
				});
			}
		}

		async function setupConvex() {
			let currentUser = await getUser();
			let currentConfig = appInstance.get().subscribeConfig;

			// Check authorization
			let authResult = await convex.query(api.users.isUserAuthorized, {
				randomId: currentUser.randomId,
				email: currentUser.email ?? undefined,
			});

			const executeConvexSetup = async () => {
				await Promise.all([convexListner(), setupPingToConvex()]);
			};

			const addRoom = async () => {
				try {
					await convex.mutation(api.rooms.add, {
						...currentConfig,
						email: currentUser.email ?? undefined,
					});
				} catch (error) {
					void Track({
						context: Env.BACKGROUND,
						eventName: EventName.BACKGROUND_EXCEPTION,
						params: {
							error: String(error),
							name: "Subscribe Function",
						},
					});
				}
			};

			// Initial setup if authorized
			if (authResult.success) {
				await Promise.all([executeConvexSetup(), addRoom()]);
			} else {
				updateBadge("---");
			}

			// Watch for user changes from storage
			const unsubscribeUser = userWatcher.subscribe(async (newUser) => {
				if (!newUser) return;

				const emailChanged = currentUser?.email !== newUser?.email;
				if (!emailChanged) return;

				currentUser = newUser;

				// Re-check authorization
				authResult = await convex.query(api.users.isUserAuthorized, {
					randomId: currentUser.randomId,
					email: currentUser.email ?? undefined,
				});

				// Handle setup/teardown based on new auth status
				if (authResult.success) {
					await executeConvexSetup();
					await addRoom();
				} else {
					updateBadge("---");
				}
			});

			// Watch for config changes from Crann
			appInstance.subscribe(async (_state, changes) => {
				// Handle config changes
				if ("subscribeConfig" in changes && changes.subscribeConfig) {
					const newConfig = changes.subscribeConfig;
					if (authResult.success && newConfig !== currentConfig) {
						currentConfig = newConfig;
						// Only update room if authorized
						await addRoom();
					}
				}
			});

			// Subscribe to remote user changes from Convex
			const unsubscribeConvexUser = convex.onUpdate(
				api.users.getUserByRand,
				{ randomId: currentUser.randomId },
				async (remoteUser) => {
					const hasChanges =
						currentUser.email !== remoteUser?.email ||
						currentUser.image !== remoteUser?.picture;

					if (!hasChanges) return;

					await setUser({
						email: remoteUser?.email || null,
						image: remoteUser?.picture || null,
					});
				},
			);

			suspensionManager.register(() => {
				unsubscribeUser();
			});
			suspensionManager.register(unsubscribeConvexUser);
		}
	},
});

// // https://developer.chrome.com/docs/extensions/reference/api/management#method-getSelf
// chrome.management.getSelf((extension) => {
//     const id = extension.id;
//     const enabled = extension.enabled
//     const description = extension.description
//     const version = extension.version;
//     const name = extension.name;
// });
