// // ============================================================
// // Shared types for iframe <-> extension communication
// // ============================================================

// export interface AISettings {
// 	hasKeys: boolean;
// 	provider: string | null;
// 	model: string | null;
// 	apiKey: string | null;
// }

// export interface AuthUser {
// 	email?: string | null;
// 	name?: string | null;
// 	image?: string | null;
// 	[key: string]: unknown;
// }

// export interface ScreenshotResult {
// 	success: boolean;
// 	data?: string;
// 	message?: string;
// }

// export interface WebsiteContent {
// 	title: string;
// 	content: string;
// }

// // Unique namespace for iframe communication
// export const IFRAME_NAMESPACE = "nepse-dashboard-iframe";

// // Message types FROM extension TO page
// export type ExtensionToPageMessageType =
// 	| "handshakeAck"
// 	| "authUser"
// 	| "aiConfig"
// 	| "screenshotResult"
// 	| "webContentResult";

// // Message types FROM page TO extension
// export type PageToExtensionMessageType =
// 	| "handshake"
// 	| "requestAuthUser"
// 	| "requestAiConfig"
// 	| "takeScreenshot"
// 	| "addWebContent";

// // Base message structure
// export interface IframeMessage<T = unknown> {
// 	namespace: typeof IFRAME_NAMESPACE;
// 	source: "extension" | "page";
// 	type: string;
// 	data?: T;
// 	timestamp: number;
// }

// /**
//  * Create a message to send from page to extension
//  */
// export function createPageMessage<T>(
// 	type: PageToExtensionMessageType,
// 	data?: T,
// ): IframeMessage<T> {
// 	return {
// 		namespace: IFRAME_NAMESPACE,
// 		source: "page",
// 		type,
// 		data,
// 		timestamp: Date.now(),
// 	};
// }

// /**
//  * Check if a message is a valid extension-to-page message
//  */
// export function isValidExtensionMessage(
// 	event: MessageEvent,
// ): event is MessageEvent<IframeMessage> {
// 	const msg = event.data;
// 	return (
// 		msg &&
// 		typeof msg === "object" &&
// 		msg.namespace === IFRAME_NAMESPACE &&
// 		msg.source === "extension" &&
// 		typeof msg.type === "string"
// 	);
// }

// /**
//  * Send a message to the extension (parent window)
//  */
// export function sendToExtension<T>(
// 	type: PageToExtensionMessageType,
// 	data?: T,
// ): void {
// 	const message = createPageMessage(type, data);
// 	window.parent.postMessage(message, "*");
// }
