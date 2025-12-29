// import { URLS } from "@/constants/app-urls";
// import { EventName } from "@/types/analytics-types";
// import { ServerUrlSchema } from "@/types/socket-type";
// import { OpenPanelSDK } from "@/utils/open-panel-sdk";

// export async function getURLs(): Promise<void> {
// 	try {
// 		const apiKey = import.meta.env.VITE_API_KEY;

// 		if (!apiKey) {
// 			OpenPanelSDK.track(EventName.EXCEPTION, {
// 				error: "Missing API_KEY or API_URL environment variables",
// 				name: "getURLs",
// 			});
// 			return;
// 		}

// 		const response = await fetch(`${URLS.edge_url}/server-urls`, {
// 			headers: { Authorization: apiKey },
// 		});

// 		if (!response.ok) {
// 			OpenPanelSDK.track(EventName.EXCEPTION, {
// 				error: `Response not ok: ${response.statusText}`,
// 				name: "getURLs",
// 			});
// 			return;
// 		}

// 		const data = await response.json();

// 		const validatedData = ServerUrlSchema.safeParse(data);

// 		if (!validatedData.success) {
// 			OpenPanelSDK.track(EventName.SCHEMA_EXCEPTION, {
// 				error: `Validation failed: ${validatedData.error}`,
// 				name: "getURLs",
// 			});
// 			return;
// 		}

// 		const urls = validatedData.data;
// 		// to do later

// 		// updateURLs({
// 		//   CHART_URL: urls.chart_url,
// 		//   LOGIN_URL: urls.login_url,
// 		//   LOGIN_ANONYMOUS_URL: urls.login_anonymous_url,
// 		//   CHAT_URL: urls.chat_url,
// 		//   WS_URL: urls.ws_url,
// 		//   EDGE_URL: urls.edge_url,
// 		//   REVIEW_URL: urls.review_url,
// 		//   PRIVACY_URL: urls.privacy_url,
// 		//   TERMS_URL: urls.terms_url,
// 		//   CHANGELOG_URL: urls.changelog_url,
// 		//   TELEGRAM_URL: urls.telegram_url,
// 		//   WELCOME_URL: urls.welcome_url,
// 		//   UNINSTALL_URL: urls.uninstall_url,
// 		//   GITHUB_URL: urls.github_url,
// 		// })
// 	} catch (error) {
// 		OpenPanelSDK.track(EventName.EXCEPTION, {
// 			error: error instanceof Error ? error.message : String(error),
// 			name: "getURLs",
// 		});
// 	}
// }
