// /** biome-ignore-all lint/suspicious/noExplicitAny: <iknow> */
// "use client";

// import { useEffect, useState } from "react";
// import type { Message } from "./types";

// export function useExtensionChannel<T = any>(type: string) {
// 	const [value, setValue] = useState<T | null>(null);

// 	useEffect(() => {
// 		function handler(event: MessageEvent) {
// 			console.log("Received message event:", event);

// 			const msg = event.data as Message;

// 			if (msg?.source !== "extension") return;
// 			if (msg.type !== type) return;

// 			setValue(msg.payload as T);
// 		}

// 		window.addEventListener("message", handler);
// 		return () => window.removeEventListener("message", handler);
// 	}, [type]);

// 	return value;
// }
