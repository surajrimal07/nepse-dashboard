import {isProduction } from "@/utils/is-production";

const frontend_url_prod = "https://www.nepsechatbot.com";
const frontend_url_dev = "http://localhost:3005";

export const URLS = {
	review_url: "https://link.nepsechatbot.com/review",
	privacy_url: "https://link.nepsechatbot.com/privacy",
	terms_url: "https://link.nepsechatbot.com/terms",
	changelog_url: "https://link.nepsechatbot.com/changelog",
	telegram_url: "https://link.nepsechatbot.com/telegram",
	welcome_url: "https://link.nepsechatbot.com/welcome",
	uninstall_url: "https://link.nepsechatbot.com/uninstall",
	github_url: "https://link.nepsechatbot.com/github",
	chart_url: "https://nepsealpha.com/nepse-chart?symbol=",
	chat_url: `${isProduction ? frontend_url_prod : frontend_url_dev}/chat`,
	community_chat_url: `${isProduction ? frontend_url_prod : frontend_url_dev}/community`,
	inference_url: `${isProduction ? frontend_url_prod : frontend_url_dev}`,
	cdn_url: "https://cdn.nepsechatbot.com",
};
