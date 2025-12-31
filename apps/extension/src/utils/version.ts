import { browser } from "#imports";

export function getVersion() {
	if (browser?.runtime?.getManifest) {
		try {
			const { version } = browser.runtime.getManifest();
			return version;
		} catch {
			return "Inside Content Script";
		}
	}
	return "unknown";
}
