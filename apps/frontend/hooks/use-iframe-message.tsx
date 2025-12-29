import { useEffect, useState } from "react";

/**
 * Hook that listens to postMessage from iframe and provides reactive state
 * Automatically updates when the message type is received
 *
 * @example
 * const settings = usePostMessage<UserSettings>("userSettings");
 *
 * // Use directly - automatically updates when extension sends new data
 * console.log(settings);
 * if (settings?.theme) { ... }
 */
export function usePostMessage<T = unknown>(
	messageType: string,
	options: { source?: string; initialValue?: T | null } = {},
): T | null {
	const { source = "nepse-dashboard", initialValue = null } = options;

	const [data, setData] = useState<T | null>(initialValue);

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			// Verify source
			if (!event.data?.source || event.data.source !== source) {
				return;
			}

			const message = event.data;

			// Update data when message type matches - internal reactivity
			if (message.type === messageType && message.payload !== undefined) {
				setData(message.payload);
			}
		};

		window.addEventListener("message", handleMessage);

		return () => {
			window.removeEventListener("message", handleMessage);
		};
	}, [messageType, source]);

	return data;
}

/**
 * Hook to track extension connection status
 * Use once at app level
 *
 * @example
 * const isConnected = usePostMessageConnection();
 *
 * if (isConnected) {
 *   // Extension is connected
 * }
 */
export function usePostMessageConnection(
	source: string = "nepse-dashboard",
): boolean {
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			// Verify source
			if (!event.data?.source || event.data.source !== source) {
				return;
			}

			const message = event.data;

			// Track connection status
			if (message.type === "EXTENSION_CONNECTED") {
				setIsConnected(true);
			}
		};

		window.addEventListener("message", handleMessage);

		return () => {
			window.removeEventListener("message", handleMessage);
		};
	}, [source]);

	return isConnected;
}
