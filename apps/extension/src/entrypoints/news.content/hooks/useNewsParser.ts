// import { isProbablyReaderable, Readability } from "@mozilla/readability";
// import { AI_CODES, type aiErrors } from "@nepse-dashboard/ai/types";
// import { franc } from "franc-min";
// import { useCallback, useEffect, useState } from "react";
// import type { DocumentLanguageType } from "@/types/news-types";
// import { cleanText } from "@/utils/content/utils";

// const READABILITY_CONFIG = { minContentLength: 100 };

// type ParsedNews = {
// 	content: string;
// 	title: string;
// 	lang: DocumentLanguageType;
// };

// type NewsParserState = {
// 	isLoading: boolean;
// 	message: string | null;
// 	data: ParsedNews | null;
// };

// function isLanguageSupported(lang: string | null): boolean {
// 	if (!lang) return false;
// 	const normalized = lang.toLowerCase().trim();
// 	return normalized === "eng" || normalized === "npi";
// }

// function parseNewsContent():
// 	| { success: true; data: ParsedNews }
// 	| { success: false; message: aiErrors } {
// 	try {
// 		if (!isProbablyReaderable(document, READABILITY_CONFIG)) {
// 			return {
// 				success: false,
// 				message: AI_CODES.UNABLE_TO_EXTRACT,
// 			};
// 		}

// 		const documentClone = document.cloneNode(true) as Document;
// 		const article = new Readability(documentClone, {
// 			serializer: (el) => el,
// 		}).parse();

// 		if (!article?.textContent) {
// 			return {
// 				success: false,
// 				message: AI_CODES.UNABLE_TO_EXTRACT,
// 			};
// 		}
// 		const francInput = cleanText(
// 			`${article?.title || ""} ${article?.textContent || ""}`,
// 			Infinity,
// 		);

// 		const detectedLang = franc(francInput) || "eng";

// 		if (!isLanguageSupported(detectedLang)) {
// 			return {
// 				success: false,
// 				message: AI_CODES.UNSUPPORTED_LANGUAGE,
// 			};
// 		}

// 		return {
// 			success: true,
// 			data: {
// 				content: article.textContent,
// 				title: document.title || article.title || "Untitled",
// 				lang: detectedLang as DocumentLanguageType,
// 			},
// 		};
// 	} catch {
// 		return {
// 			success: false,
// 			message: AI_CODES.UNKNOWN_ERROR,
// 		};
// 	}
// }

// export function useNewsParser(url: string) {
// 	const [state, setState] = useState<NewsParserState>({
// 		isLoading: false,
// 		message: null,
// 		data: null,
// 	});

// 	const retry = useCallback(() => {
// 		if (!url) return;
// 		setState({
// 			isLoading: true,
// 			message: null,
// 			data: null,
// 		});
// 	}, [url]);

// 	useEffect(() => {
// 		if (!url) {
// 			setState({
// 				isLoading: false,
// 				message: null,
// 				data: null,
// 			});
// 			return;
// 		}

// 		let cancelled = false;

// 		const parse = async () => {
// 			setState({
// 				isLoading: true,
// 				message: null,
// 				data: null,
// 			});

// 			const result = parseNewsContent();

// 			if (cancelled) return;

// 			setState({
// 				isLoading: false,
// 				message: result.success ? null : result.message,
// 				data: result.success ? result.data : null,
// 			});
// 		};

// 		parse();

// 		return () => {
// 			cancelled = true;
// 		};
// 	}, [url]);

// 	return {
// 		isLoading: url && !state.data && !state.message ? true : state.isLoading,
// 		message: state.message,
// 		data: state.data,
// 		retry,
// 	};
// }
