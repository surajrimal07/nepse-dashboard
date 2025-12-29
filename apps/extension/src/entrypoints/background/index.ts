import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { ConvexClient } from "convex/browser";
import { create } from "crann-fork";
import { URLS } from "@/constants/app-urls";
import { autoIdentify } from "@/lib/analytics/identify";
import { updateBadge } from "@/lib/badge";
import { registerBackgroundListeners } from "@/lib/listners/background-rejection";
import { setupPinListener } from "@/lib/listners/pin-listner";
import { onMessage } from "@/lib/messaging/extension-messaging";
import { handleNotification } from "@/lib/notification/handle-notification";
import { appState } from "@/lib/service/app-service";
import { Env, EventName } from "@/types/analytics-types";
import { ConnectionState } from "@/types/connection-type";
import { getVersion } from "@/utils/version";
import { Analytics, IdentifyUser, Track } from "../../lib/analytics/analytics";
import { getUser, setUser } from "../../lib/storage/user-storage";
import { suspensionManager } from "./suspension-manager";
import { urlB64ToUint8Array } from "./urlB64ToUint8Array";
import { userWatcher } from "./user-watcher";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const notificationVapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

const SOCKET_HIGH_LATENCY_THRESHOLD = 10000;
const SOCKET_MEDIUM_LATENCY_THRESHOLD = 5000;
const PING_INTERVAL = 5000;

let appStateInstance: ReturnType<typeof create<typeof appState>> | undefined;
let convexInstance: ConvexClient | undefined;

if (!convexUrl || !notificationVapidPublicKey) {
	void Track({
		context: Env.BACKGROUND,
		eventName: EventName.EXCEPTION,
		params: {
			error: "Missing CONVEX_URL or VAPID_PUBLIC_KEY environment variable",
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
		let pushSubscription: PushSubscription | null = null;
		// let shouldExtract = true;

		notificationListener();
		registerBackgroundListeners();

		const initializeConvex = async () => {
			if (isConvexSetup) return;
			isConvexSetup = true;
			await setupConvex();
		};

		globalThis.addEventListener("activate", initializeConvex);

		// Extension startup
		browser.runtime.onStartup.addListener(initializeConvex);

		(async () => {
			await getUser();
			onInstall();
			setupContextMenu();
			setupShortcutListeners();

			await Promise.all([
				// cleaupContextScripts(),
				initializeConvex(),
				Connection(),
				listenNotificationPermissions(),
			]);

			autoIdentify(); // start auto identify
			setupPinListener(); // not awaited
		})();

		// Helper function to handle Web Push subscription
		async function handleWebPushSubscription() {
			// don;t run if notifications are disabled
			const enabled = appInstance.get().notification;
			if (!enabled) {
				return;
			}

			const permission = await browser.notifications.getPermissionLevel();
			if (permission !== "granted") {
				logger.info("Notifications permission not granted");
				return;
			}

			const applicationServerKey = urlB64ToUint8Array(
				notificationVapidPublicKey,
			);

			pushSubscription = await self.registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey,
			});

			if (!pushSubscription) {
				return;
			}

			const json = pushSubscription.toJSON();

			if (!json.endpoint || !json.keys) {
				void Track({
					context: Env.BACKGROUND,
					eventName: EventName.EXCEPTION,
					params: {
						error: "Invalid push subscription",
						name: "Web Push Subscription",
					},
				});
				return;
			}

			// send the subscription to convex
			await convex.mutation(api.notification.subscribe, {
				userId: (await getUser()).randomId,
				subscription: {
					endpoint: json.endpoint,
					keys: json.keys as { p256dh: string; auth: string },
					userAgent: navigator.userAgent,
				},
			});
		}

		// ----- NOTIFICATION LISTENER -----
		async function notificationListener() {
			self.addEventListener("push", async (event) => {
				const notificationData = JSON.parse(event?.data?.text());

				const title = notificationData?.title;
				const body = notificationData?.body;
				const variant = notificationData?.variant || "info";
				const icon = notificationData?.icon || undefined;

				if (!title || !body) {
					void Track({
						context: Env.BACKGROUND,
						eventName: EventName.NOTIFICATION_ERROR,
						params: {
							error: "Invalid notification data",
							name: "Push Event",
							data: notificationData,
						},
					});

					return;
				}

				await handleNotification(title, body, variant, icon);
			});
		}

		async function listenNotificationPermissions() {
			appInstance.subscribe(async (_state, changes) => {
				if ("notification" in changes) {
					const enabled = changes.notification;

					const permission = await browser.notifications.getPermissionLevel();

					if (enabled && permission === "granted") {
						// Run your notification setup if enabled
						await handleWebPushSubscription();

						// remove data from convex if disabled
						await convex.mutation(api.notification.unsubscribe, {
							userId: (await getUser()).randomId,
						});
					} else if (!enabled && pushSubscription) {
						try {
							await pushSubscription.unsubscribe();
							logger.info(
								"Push subscription disabled due to revoked permissions",
							);
							pushSubscription = null;
						} catch (error) {
							void Track({
								context: Env.BACKGROUND,
								eventName: EventName.NOTIFICATION_ERROR,
								params: {
									error: `Failed to unsubscribe push subscription: ${String(error)}`,
									name: "Push Unsubscribe",
								},
							});
						}
					}
				}
			});
		}

		function onInstall() {
			browser.runtime.onInstalled.addListener(async (details) => {
				if (details.reason === "install") {
					IdentifyUser();

					// Create context menu immediately on install
					browser.contextMenus.create({
						id: "toggleSidebar",
						type: "normal",
						title: "Nepse Dashboard",
						contexts: ["all"],
					});

					await browser.tabs.create({
						url: `${URLS.welcome_url}`,
					});
				}

				if (details.reason === "update") {
					void Track({
						context: Env.BACKGROUND,
						eventName: EventName.UPDATED,
						params: {
							from_version: details.previousVersion,
							to_version: getVersion(),
						},
					});

					checkCommandShortcuts();
				}

				browser.runtime.setUninstallURL(URLS.uninstall_url);
			});
		}

		// ----- UI INTERACTIONS -----
		function setupContextMenu() {
			// Setup click listener
			browser.contextMenus?.onClicked.addListener((info, tab) => {
				if (tab?.id && info.menuItemId === "toggleSidebar") {
					void Track({
						context: Env.BACKGROUND,
						eventName: EventName.BACKGROUND_METRICS,
						params: {
							metric: "toggleSidebar",
						},
					});

					browser.sidePanel.open({ tabId: tab.id }).catch((error) => {
						void Track({
							context: Env.BACKGROUND,
							eventName: EventName.BACKGROUND_EXCEPTION,
							params: {
								error: String(error),
								name: "Context Menu Click",
							},
						});
					});
				}
			});
		}

		// ----- COMMAND CHECKERS -----
		function checkCommandShortcuts() {
			browser.commands.getAll((commands) => {
				const missingShortcuts = [];

				for (const { name, shortcut } of commands) {
					if (shortcut === "") {
						missingShortcuts.push(name);
					}
				}

				if (missingShortcuts.length > 0) {
					void Track({
						context: Env.BACKGROUND,
						eventName: EventName.BACKGROUND_INFO,
						params: {
							info: "Missing command shortcuts",
							missingCommands: missingShortcuts,
						},
					});

					// Update the extension UI to inform the user that one or more
					// commands are currently unassigned.
				}
			});
		}

		// ------ SHORTCUT KEY LISTENERS ------
		function setupShortcutListeners() {
			browser.commands.onCommand.addListener((command) => {
				if (command === "open-popup") {
					browser.action.openPopup();

					void Track({
						context: Env.BACKGROUND,
						eventName: EventName.BACKGROUND_METRICS,
						params: {
							metric: "openPopup",
						},
					});
				}

				if (command === "open-sidebar") {
					browser.windows.getCurrent(async (win) => {
						if (win.id != null) {
							browser.sidePanel.open({ windowId: win.id });
						}

						void Track({
							context: Env.BACKGROUND,
							eventName: EventName.BACKGROUND_METRICS,
							params: {
								metric: "openSidebar",
							},
						});
					});
				}

				if (command === "open-options") {
					browser.runtime.openOptionsPage();
					void Track({
						context: Env.BACKGROUND,
						eventName: EventName.BACKGROUND_METRICS,
						params: {
							metric: "openOptions",
						},
					});
				}
			});
		}

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
						randomId: randomId,
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
							await handleWebPushSubscription();
						}
					},
				);

				// ----- CLEANUP ON SUSPEND -----
				suspensionManager.register(() => {
					unsubscribeNepse();
					unsubscribeCompanies();
					unsubscribeSubscription();
					// unsubscribeDataAvailable();
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
				await Promise.all([
					convexListner(),
					setupPingToConvex(),
					handleWebPushSubscription(),
				]);
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

			const activate = () => {
				convex.mutation(api.count.setActivationCount, {
					randomId: currentUser.randomId,
				});
			};

			// Initial setup if authorized
			if (authResult.success) {
				await Promise.all([executeConvexSetup(), addRoom()]);
				activate();
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

		// // ----- SUSPENSION CLEANUP -----
		// async function cleaupContextScripts() {
		// 	suspensionManager.register(async () => {
		// 		try {
		// 			const scripts = await browser.scripting.getRegisteredContentScripts();
		// 			if (scripts.length) {
		// 				await browser.scripting.unregisterContentScripts({
		// 					ids: scripts.map((s) => s.id),
		// 				});
		// 			}
		// 		} catch (error) {
		// 			void Track({
		// 				context: Env.BACKGROUND,
		// 				eventName: EventName.BACKGROUND_EXCEPTION,
		// 				params: {
		// 					error: String(error),
		// 					name: "Suspension Cleanup",
		// 				},
		// 			});
		// 		}
		// 	});
		// }

		function Connection() {
			onMessage("analytics", ({ data }) => {
				return Analytics(data);
			});

			onMessage("companiesList", () => {
				return appInstance.get().companiesList;
			});

			onMessage("openSidePanel", () => {
				browser.windows.getCurrent((win) => {
					if (win?.id != null) {
						browser.sidePanel.open({ windowId: win.id });
					}
				});
			});

			// onMessage("shouldExtract", () => {
			// 	if (shouldExtract) {
			// 		sendMessage("startExtraction");
			// 	}
			// });

			// onMessage("sendExtractionData", async ({ data }) => {
			// 	const randomId = await getUser();

			// 	convex.mutation(api.IndexData.consumeNepseIndexData, {
			// 		randomId: randomId?.randomId,
			// 		...data.extractedData,
			// 	});
			// });

			// browser.runtime.onMessage.addListener(
			// 	(message, _sender, sendResponse) => {
			// 		if (message?.type !== "opensidepanel") {
			// 			// Not handled here → allow next listener to handle it
			// 			return false;
			// 		}

			// 		// MUST remain completely synchronous
			// 		try {
			// 			browser.windows.getCurrent((win) => {
			// 				if (browser.runtime.lastError) {
			// 					sendResponse({
			// 						success: false,
			// 						message: browser.runtime.lastError.message,
			// 					});
			// 					return;
			// 				}

			// 				if (win?.id != null) {
			// 					browser.sidePanel.open({ windowId: win.id }, () => {
			// 						if (browser.runtime.lastError) {
			// 							sendResponse({
			// 								success: false,
			// 								message: browser.runtime.lastError.message,
			// 							});
			// 							return;
			// 						}

			// 						sendResponse({
			// 							success: true,
			// 							message: "Sidepanel opened",
			// 						});
			// 					});
			// 				} else {
			// 					sendResponse({
			// 						success: false,
			// 						message: "Window ID not available",
			// 					});
			// 				}
			// 			});
			// 		} catch (err) {
			// 			sendResponse({ success: false, message: String(err) });
			// 		}

			// 		// We are async via callback, so return true
			// 		return true;
			// 	},
			// );

			// ------------------------------
			// EXTERNAL MESSAGE HANDLER FIXED
			// ------------------------------
			browser.runtime.onMessageExternal.addListener(
				(message, _sender, sendResponse) => {
					if (message?.type === "ping") {
						sendResponse({ success: true, type: "pong" });
						return true;
					}

					if (message?.type === "openpanel") {
						browser.windows.getCurrent((win) => {
							if (win?.id != null) {
								browser.sidePanel.open({ windowId: win.id }, () => {
									if (browser.runtime.lastError) {
										sendResponse({
											success: false,
											message: browser.runtime.lastError.message,
										});
										return;
									}

									sendResponse({
										success: true,
										message: "Sidepanel opened",
									});
								});
							} else {
								sendResponse({
									success: false,
									message: "Window ID not available",
								});
							}
						});
						return true;
					}
					sendResponse({ success: false, error: "Unknown external message" });
					return true;
				},
			);
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
