import { browser } from "#imports";

// biome-ignore lint/suspicious/noExplicitAny: <i don't know the type of tab>
export async function activateTab(tab: any) {
	if (tab.id == null) return;

	await browser.tabs.update(tab.id, {
		active: true,
	});
}
