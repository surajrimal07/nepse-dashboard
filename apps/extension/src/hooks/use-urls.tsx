// import { createCrannStateHook } from "crann-fork";
// import { appState } from "@/lib/service/app-service";

// const useAppState = createCrannStateHook(appState);

// export function useUrlStateItem<K extends keyof typeof appState>(key: K) {
// 	const { useStateItem } = useAppState();
// 	return useStateItem(key);
// }

// // App URLs hooks
// export function useReviewUrl() {
// 	const [url] = useUrlStateItem("review_url");
// 	return url;
// }

// export function usePrivacyUrl() {
// 	const [url] = useUrlStateItem("privacy_url");
// 	return url;
// }

// export function useTermsUrl() {
// 	const [url] = useUrlStateItem("terms_url");
// 	return url;
// }

// export function useChangelogUrl() {
// 	const [url] = useUrlStateItem("changelog_url");
// 	return url;
// }

// export function useTelegramUrl() {
// 	const [url] = useUrlStateItem("telegram_url");
// 	return url;
// }

// export function useWelcomeUrl() {
// 	const [url] = useUrlStateItem("welcome_url");
// 	return url;
// }

// export function useUninstallUrl() {
// 	const [url] = useUrlStateItem("uninstall_url");
// 	return url;
// }

// export function useGithubUrl() {
// 	const [url] = useUrlStateItem("github_url");
// 	return url;
// }

// export function useChartUrl() {
// 	const [url] = useUrlStateItem("chart_url");
// 	return url;
// }

// export function useChatUrl() {
// 	const [url] = useUrlStateItem("chat_url");
// 	return url;
// }

// export function useCommunityChatUrl() {
// 	const [url] = useUrlStateItem("community_chat_url");
// 	return url;
// }

// // Content URLs hooks
// export function useTmsLoginUrlPattern() {
// 	const [pattern] = useUrlStateItem("tms_login_url_pattern");
// 	return new RegExp(pattern);
// }

// export function useMeroshareLoginUrl() {
// 	const [url] = useUrlStateItem("meroshare_login_url");
// 	return url;
// }

// export function useNaasaxLoginUrl() {
// 	const [url] = useUrlStateItem("naasax_login_url");
// 	return url;
// }

// export function useChromeMeroshareUrl() {
// 	const [url] = useUrlStateItem("chrome_meroshare_url");
// 	return url;
// }

// export function useChromeNaasaxUrl() {
// 	const [url] = useUrlStateItem("chrome_naasax_url");
// 	return url;
// }

// export function useTmsWatchUrl() {
// 	const [url] = useUrlStateItem("tms_watch_url");
// 	return url;
// }

// export function useMeroWatchUrl() {
// 	const [url] = useUrlStateItem("mero_watch_url");
// 	return url;
// }

// export function useNaasaWatchUrl() {
// 	const [url] = useUrlStateItem("naasa_watch_url");
// 	return url;
// }

// export function useNaasaDashboardUrl() {
// 	const [url] = useUrlStateItem("naasa_dashboard_url");
// 	return url;
// }

// export function useMerolaganiNews() {
// 	const [url] = useUrlStateItem("merolagani_news");
// 	return url;
// }

// export function useSharesansarNews() {
// 	const [url] = useUrlStateItem("sharesansar_news");
// 	return url;
// }

// export function useMerolaganiNewsBase() {
// 	const [url] = useUrlStateItem("merolagani_news_base");
// 	return url;
// }

// export function useSharesansarNewsBase() {
// 	const [url] = useUrlStateItem("sharesansar_news_base");
// 	return url;
// }

// export function useMerosharePortfolioUrl() {
// 	const [url] = useUrlStateItem("meroshare_portfolio_url");
// 	return url;
// }

// export function useMeroshareIpoUrl() {
// 	const [url] = useUrlStateItem("meroshare_ipo_url");
// 	return url;
// }

// // Update URLs action
// export function useUpdateUrls() {
// 	const { callAction } = useAppState();
// 	return (urls: Record<string, string>) => callAction("updateUrls", urls);
// }
