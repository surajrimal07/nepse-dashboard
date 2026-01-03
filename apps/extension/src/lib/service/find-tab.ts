import { browser } from "#imports";

export async function findTMSTab(url: string) {
	const tabs = await browser.tabs.query({
		url,
	});

	return tabs[0] ?? null;
}
