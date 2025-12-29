import type { aiProvidersType } from "@nepse-dashboard/ai/types";
import { usePromptInputAttachments } from "@nepse-dashboard/ui/components/ai-elements/prompt-input";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { base64ToFile } from "./base64";
import { parsedNewsToPdf } from "./text-to-pdf";
import type { websiteContent } from "./type";

export interface AISettings {
	hasKeys: boolean;
	provider: aiProvidersType | null;
	model: string | null;
	apiKey: string | null;
}

const ALLOWED_EXTENSION_ID = process.env.NEXT_PUBLIC_EXTENSION_ID;

const validProtocols = [
	"chrome-extension:",
	"moz-extension:",
	"safari-web-extension:",
	"extension:",
];

function isValidExtensionOrigin(origin: string): boolean {
	try {
		const url = new URL(origin);
		if (!validProtocols.includes(url.protocol)) {
			return false;
		}
		const extensionId = url.hostname || url.pathname.split("/")[0];
		return extensionId === ALLOWED_EXTENSION_ID;
	} catch {
		return false;
	}
}

export function sendToExtension(type: string, payload?: unknown) {
	const message = { source: "page", type, payload };
	window.parent.postMessage(message, "*");
}

export function useExtensionInitialization() {
	const attachments = usePromptInputAttachments();
	const [isConnected, setIsConnected] = useState(false);
	const userRef = useRef(null);
	const aiConfigRef = useRef<AISettings | null>(null);
	const [isInitializing, setIsInitializing] = useState(true);

	// -----------------------------
	// 1) Listen for window messages
	// -----------------------------
	useEffect(() => {
		if (window.self === window.top) {
			setIsInitializing(false);
			return;
		}

		const handleMessage = (event: MessageEvent) => {
			if (!isValidExtensionOrigin(event.origin)) {
				console.warn(
					"[Security] Message from unauthorized origin:",
					event.origin,
				);

				setIsInitializing(false);
				return;
			}

			const msg = event.data;
			if (msg?.source !== "extension") return;

			setIsConnected(true);
			setIsInitializing(false);

			switch (msg.type) {
				case "AUTH_USER":
					userRef.current = msg.payload;
					break;

				case "AI_CONFIG":
					aiConfigRef.current = msg.payload;
					break;

				case "ADD_WEB_CONTENT": {
					const result = msg?.payload as websiteContent | null;

					if (!result) {
						toast.error("Failed to add webpage content.");
						return;
					}
					const contentFile: File = parsedNewsToPdf(result);
					attachments.add([contentFile]);
					toast.success("Webpage content added as attachment, ask AI now!");
					break;
				}

				case "TAKE_SCREENSHOT": {
					const result = msg.payload;
					if (result?.success) {
						const file = base64ToFile(result.data, "screenshot.png");
						attachments.add([file]);

						toast.success("Screenshot added as attachment, ask AI now!");
					} else
						toast.error(
							result?.message ??
								"Screenshot failed, Make sure you are on a valid website not a browser page.",
						);

					break;
				}
			}
		};

		window.addEventListener("message", handleMessage);

		// If no handshake after 5 seconds, stop initializing
		const timeout = setTimeout(() => {
			if (!isConnected) {
				setIsInitializing(false);
			}
		}, 10000);

		// Retry handshake every 3 seconds if not connected
		const retryInterval = setInterval(() => {
			if (!isConnected) {
				sendToExtension("HANDSHAKE");
			}
		}, 2000);

		// send initial handshake
		sendToExtension("HANDSHAKE");

		return () => {
			window.removeEventListener("message", handleMessage);
			clearTimeout(timeout);
			clearInterval(retryInterval);
		};
	}, [isConnected, attachments.add]);

	return {
		isConnected,
		user: userRef,
		aiConfig: aiConfigRef,
		isInitializing,
	};
}
