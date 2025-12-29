import { Readability } from "@mozilla/readability";
import { franc } from "franc-min";
import type { DocumentLanguageType, ParsedDocument } from "@/types/news-types";
import {
	cleanText,
	extractStructuredText,
	MAX_TEXT_LENGTH,
	prepareDocument,
	truncateAtParagraph,
} from "./utils";

const emptyResult = (): ParsedDocument => ({
	success: false,
	content: "",
	title: "",
	lang: "und",
});
export function analyzeDocument(): ParsedDocument {
	try {
		const documentClone = document.cloneNode(true) as Document;
		prepareDocument(documentClone);

		const article = new Readability(documentClone).parse();

		if (!article?.content) {
			return emptyResult();
		}

		const container = documentClone.createElement("div");
		container.innerHTML = article.content;

		const structuredText = extractStructuredText(container);
		const cleanedText = cleanText(structuredText, Infinity);
		const finalText = truncateAtParagraph(cleanedText, MAX_TEXT_LENGTH);

		const langSample = cleanText(`${article.title ?? ""} ${finalText}`, 1500);

		return {
			success: true,
			title: document.title || article.title || "Untitled",
			content: finalText,
			lang: franc(langSample) as DocumentLanguageType,
		};
	} catch (err) {
		logger.error("Readability failed:", err);
		return emptyResult();
	}
}
