// export function useBackgroundMessageListener(
// 	handlers: Record<string, (data: any) => void>,
// ) {
// 	const handlersRef = useRef(handlers);

// 	useEffect(() => {
// 		handlersRef.current = handlers;
// 	}, [handlers]);

// 	useEffect(() => {
// 		browser.runtime.sendMessage({ type: "registerTab" });

// 		const listener = (
// 			message: { type: string; msg: any },
// 			_sender: Browser.runtime.MessageSender,
// 			_sendResponse: (response?: any) => void,
// 		) => {
// 			const handler = handlersRef.current[message.type];
// 			if (handler) {
// 				handler(message.msg);
// 			}
// 		};

// 		browser.runtime.onMessage.addListener(listener);

// 		return () => {
// 			browser.runtime.onMessage.removeListener(listener);
// 			browser.runtime.sendMessage({ type: "unregisterTab" });
// 		};
// 	}, []);
// }
