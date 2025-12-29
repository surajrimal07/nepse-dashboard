import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";

export const gemini = new GoogleGenAI({
	apiKey: process.env.GOOGLE_AI_STUDIO_TOKEN,
});

export const AI_GENERATION_CONFIG = {
	temperature: 0.3,
	maxOutputTokens: 1000,
	topP: 0.8,
	topK: 40,
} as const;

export const AI_SAFETY_SETTINGS = [
	{
		category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
];

export const geminiSchema = {
	type: "object",
	properties: {
		title: {
			type: "object",
			properties: {
				english: {
					type: "string",
					description: "Article title translated to English",
				},
				nepali: {
					type: "string",
					description: "Article title translated to Nepali (Devanagari script)",
				},
			},
			required: ["english", "nepali"],
		},
		summary: {
			type: "object",
			properties: {
				english: {
					type: "string",
					description:
						"Comprehensive 2-3 sentence summary in English covering key financial points",
				},
				nepali: {
					type: "string",
					description:
						"Comprehensive 2-3 sentence summary in Nepali (Devanagari script) covering key financial points",
				},
			},
			required: ["english", "nepali"],
		},
		themes: {
			type: "array",
			items: {
				type: "string",
			},
			description:
				"2-4 themes relevant to Nepal's financial market (e.g., 'Profit Growth', 'Banking Sector')",
			minItems: 2,
			maxItems: 4,
		},
		bias: {
			type: "object",
			properties: {
				sentiment: {
					type: "string",
					enum: ["Positive", "Negative", "Neutral"],
					description:
						"Overall market sentiment of the article: Positive, Negative, or Neutral",
				},
				score: {
					type: "number",
					minimum: 0,
					maximum: 100,
					description:
						"Numerical sentiment score where 0=very negative, 50=neutral, 100=very positive",
				},
			},
			required: ["sentiment", "score"],
		},
		originalLanguage: {
			type: "string",
			enum: ["eng", "npi"],
			description:
				"Language code of the original article: 'eng' for English or 'npi' for Nepali",
		},
	},
	required: ["title", "summary", "themes", "bias", "originalLanguage"],
};
