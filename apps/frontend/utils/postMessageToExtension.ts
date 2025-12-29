// /** biome-ignore-all lint/suspicious/noExplicitAny: <ikow> */
// import type { Message } from "@/app/chat/types";

// export function postToExtension(type: string, payload?: any) {
// 	const msg: Message = {
// 		source: "page",
// 		type,
// 		payload,
// 	};
// 	window.parent.postMessage(msg, "*");
// }

// export function requestFromExtension<T = any>(type: string, payload?: any) {
// 	return new Promise<T>((resolve) => {
// 		function handler(event: MessageEvent) {
// 			const msg = event.data as Message;

// 			if (msg?.source !== "extension") return;
// 			if (msg.type !== type) return;

// 			window.removeEventListener("message", handler);
// 			resolve(msg.payload);
// 		}

// 		window.addEventListener("message", handler);

// 		postToExtension(type, payload);
// 	});
// }
