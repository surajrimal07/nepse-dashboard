export function getVersion() {
	if (
		typeof browser !== "undefined" &&
		browser.runtime &&
		browser.runtime.getManifest
	) {
		try {
			const { version } = browser.runtime.getManifest();
			return version;
		} catch {
			return "Inside Content Script";
		}
	}
	return "unknown";
}
