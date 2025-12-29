export const MAX_TEXT_LENGTH = 3000;
// /**
//  * Clean and truncate article text for post processing
//  */
export function cleanText(
	textContent: string,
	maxLength: number = MAX_TEXT_LENGTH,
): string {
	const cleaned = textContent
		.replace(/[\u200B-\u200D\uFEFF]/g, "")
		.replace(/\s+/g, " ")
		.trim();

	return cleaned.length <= maxLength ? cleaned : cleaned.slice(0, maxLength);
}


export function prepareDocument(doc: Document) {
	const selectors = [
		"script",
		"style",
		"noscript",
		"iframe",
		"canvas",
		"svg",
		"form",
		"nav",
		"footer",
		"aside",
		"[role='navigation']",
		"[aria-hidden='true']",
	];

	selectors.forEach((selector) => {
		doc.querySelectorAll(selector).forEach((el) => {
			el.remove();
		});
	});
}

export function extractStructuredText(root: HTMLElement): string {
	const parts: string[] = [];

	root.querySelectorAll("h1,h2,h3,p,li").forEach((el) => {
		const text = el.textContent?.trim();
		if (!text) return;

		if (el.tagName.startsWith("H")) {
			parts.push(`\n## ${text}\n`);
		} else {
			parts.push(text);
		}
	});

	return parts.join("\n");
}

export function truncateAtParagraph(text: string, maxLength: number) {
	if (text.length <= maxLength) return text;

	const cut = text.slice(0, maxLength);
	const lastBreak = cut.lastIndexOf("\n");

	return lastBreak > 500 ? cut.slice(0, lastBreak) : cut;
}
