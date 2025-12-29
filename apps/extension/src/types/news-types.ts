import z from "@nepse-dashboard/zod";

export const NewsSites = {
	MEROLAGANI: "merolagani",
	SHARESANSAR: "sharesansar",
	ARTHASANSAR: "arthasansar",
	ARTHASAROKAR: "arthasarokar",
} as const;

export type NewsSiteType = (typeof NewsSites)[keyof typeof NewsSites];

const lang = z.union([z.literal("eng"), z.literal("npi"), z.literal("und")]);
export type DocumentLanguageType = z.infer<typeof lang>;

export type newsDatatype = {
	title: string;
	content: string;
	url: string;
	lang: DocumentLanguageType;
};

export type ParsedNews = {
	content: string;
	title: string;
	lang: DocumentLanguageType;
};

export type ParsedDocument = {
	success: boolean;
	content: string;
	title: string;
	lang: DocumentLanguageType;
};
