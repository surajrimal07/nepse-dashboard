import { CONFIG } from "@/constants/app-config";

export function isRestrictedUrl(url: string): boolean {
	return CONFIG.restricted_urls.some((restrictedUrl) => {
		return url.startsWith(restrictedUrl);
	});
}
