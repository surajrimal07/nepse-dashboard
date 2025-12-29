import { createLazyRoute, useRouteContext } from "@tanstack/react-router";
import {
	lazy,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";
import { ServiceUnavailable } from "@/components/chat-tab/unavailable";
import Loading from "@/components/loading";
import { URLS } from "@/constants/app-urls";
import { useAppState } from "@/hooks/use-app";
import { track } from "@/lib/analytics";
import { useAuth } from "@/lib/auth/auth-context";
import { onMessage, sendMessage } from "@/lib/messaging/extension-messaging";
import { aiChatRoute } from "@/routes";
import { Env, EventName } from "@/types/analytics-types";

const RequireBYOK = lazy(() => import("@/components/chat-tab/byok"));

const IFRAME_SANDBOX =
	"allow-same-origin allow-scripts allow-modals allow-forms allow-popups";
const IFRAME_ALLOW = "clipboard-read; clipboard-write;";
const IFRAME_STYLE = { height: "100%" };

type LoadingState = "loading" | "reloading" | "loaded" | "error";

export const Route = createLazyRoute("/ai-chat/{-$chatId}")({
	component: AiChatUI,
});

export default function AiChatUI() {
	const { user: authUser } = useAuth();
	const { useStateItem, callAction } = useAppState();
	const [aiConfig, setAiConfig] = useStateItem("aiSettings");

	const routeContext = useRouteContext({ strict: false });
	const isFullScreen = routeContext.fullscreen;
	const { chatId } = aiChatRoute.useParams();

	const [loadingState, setLoadingState] = useState<LoadingState>("loading");
	const [iframeKey, setIframeKey] = useState(0); // Add key state
	const iframeRef = useRef<HTMLIFrameElement>(null);

	const chatUrl = chatId ? `${URLS.chat_url}/${chatId}` : URLS.chat_url;

	const sendToIframe = useCallback(
		(type: string, payload?: unknown) => {
			const iframe = iframeRef.current;
			if (!iframe?.contentWindow) {
				logger.warn("[Extension] iframe not ready");
				return;
			}

			const message = {
				source: "extension",
				type,
				payload,
			};

			const iframeOrigin = new URL(chatUrl).origin;
			iframe.contentWindow.postMessage(message, iframeOrigin);
		},
		[chatUrl],
	);

	const handleIframeLoad = useCallback(() => {
		setLoadingState("loaded");
		setTimeout(() => {
			sendToIframe("HANDSHAKE", { from: "extension", timestamp: Date.now() });
			sendToIframe("AUTH_USER", authUser);
			sendToIframe("AI_CONFIG", aiConfig);
		}, 100);
	}, [sendToIframe, authUser, aiConfig]);

	const handleError = useCallback(() => {
		logger.error("[Extension] iframe failed to load");
		setLoadingState("error");
	}, []);

	const refreshIframe = useCallback(() => {
		setLoadingState("loading");
		setIframeKey((prev) => prev + 1);
	}, []);

	useEffect(() => {
		const handleMessage = async (event: MessageEvent) => {
			try {
				const iframeOrigin = new URL(chatUrl).origin;
				if (event.origin !== iframeOrigin) return;
			} catch {
				return;
			}

			const msg = event.data;
			if (!msg?.source || msg.source !== "page") return;

			switch (msg.type) {
				case "HANDSHAKE":
					sendToIframe("AUTH_USER", authUser);
					sendToIframe("AI_CONFIG", aiConfig);
					break;

				case "REQUEST_AUTH_USER":
					sendToIframe("AUTH_USER", authUser);
					break;

				case "TAKE_SCREENSHOT": {
					const result = await callAction("takeScreenshot");
					sendToIframe("TAKE_SCREENSHOT", result);
					break;
				}

				case "ADD_WEB_CONTENT": {
					const [tab] = await browser.tabs.query({
						active: true,
						currentWindow: true,
					});

					const tabId = tab?.id;
					if (!tabId) {
						return;
					}

					 sendMessage("getWebsiteContent", undefined, tabId);
					break;
				}

				case "REQUEST_AI_CONFIG":
					sendToIframe("AI_CONFIG", aiConfig);
					break;

				default:
					{
						void track({
							context: Env.UNIVERSAL,
							eventName: EventName.UNKNOWN_MESSAGE_RECEIVED,
							params: {
								error: `Unknown message type received from chat iframe: ${msg.type}`,
							},
						});
					}

					break;
			}
		};

		window.addEventListener("message", handleMessage);

		return () => window.removeEventListener("message", handleMessage);
	}, [chatUrl, sendToIframe, authUser, aiConfig, setAiConfig, callAction]);

	useEffect(() => {
		refreshIframe();
	}, [authUser?.email, aiConfig?.provider, aiConfig?.model, aiConfig?.hasKeys]);

	const sendToIframeRef = useRef(sendToIframe);
	sendToIframeRef.current = sendToIframe;

	useEffect(() => {
		const unsubscribe = onMessage("sendWebsiteContent", ({ data }) => {
			try {
				sendToIframeRef.current("ADD_WEB_CONTENT", data);
			} catch {
				toast.error("Failed to get response from extension");
			}

			return true;
		});

		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	}, []);

	const containerStyle = useMemo(
		() => ({
			height: isFullScreen ? "100%" : "540px",
		}),
		[isFullScreen],
	);
	return (
		<div className="w-full relative" style={containerStyle}>
			{aiConfig == null || aiConfig?.hasKeys === false ? (
				<Suspense fallback={<Loading />}>
					<RequireBYOK />
				</Suspense>
			) : loadingState === "error" ? (
				<ServiceUnavailable chat={true} onRetry={handleIframeLoad} />
			) : (
				<>
					{loadingState === "loading" && (
						<div className="absolute inset-0 z-10">
							<Loading />
						</div>
					)}

					<iframe
						key={iframeKey}
						ref={iframeRef}
						src={chatUrl}
						onLoad={handleIframeLoad}
						onError={handleError}
						sandbox={IFRAME_SANDBOX}
						className="w-full border-none"
						style={IFRAME_STYLE}
						loading="eager"
						title="Nepse ChatBot"
						seamless={true}
						allow={IFRAME_ALLOW}
						referrerPolicy="strict-origin"
					/>
				</>
			)}
		</div>
	);
}
