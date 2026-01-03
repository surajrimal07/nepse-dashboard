import { browser } from "#imports";

export function getExtensionOrigin() {
	if (browser?.runtime?.getURL) {
		return new URL(browser.runtime.getURL("")).origin;
	}

	return "extension://unknown";
}
