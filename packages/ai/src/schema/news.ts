import z from "@nepse-dashboard/zod";

export const summarySchema = z.object({
	title: z
		.object({
			english: z
				.string()
				.min(1)
				.describe("Article title translated to English"),
			nepali: z
				.string()
				.min(1)
				.describe("Article title translated to Nepali (Devanagari script)"),
		})
		.describe("Title in both English and Nepali"),
	summary: z
		.object({
			english: z
				.string()
				.min(1)
				.describe(
					"Comprehensive 2-3 sentence summary in English covering key financial points",
				),
			nepali: z
				.string()
				.min(1)
				.describe(
					"Comprehensive 2-3 sentence summary in Nepali (Devanagari script) covering key financial points",
				),
		})
		.describe("Summary in both English and Nepali"),
	themes: z
		.array(z.string().min(1))
		.min(2)
		.max(4)
		.describe(
			"2-4 themes relevant to Nepal's financial market (e.g., 'Profit Growth', 'Banking Sector')",
		),
	bias: z
		.object({
			sentiment: z
				.enum(["Positive", "Negative", "Neutral"])
				.describe(
					"Overall market sentiment of the article: Positive, Negative, or Neutral",
				),
			score: z
				.number()
				.min(0)
				.max(100)
				.describe(
					"Numerical sentiment score where 0=very negative, 50=neutral, 100=very positive",
				),
		})
		.describe("Bias and sentiment analysis"),
	originalLanguage: z
		.enum(["eng", "npi"])
		.describe(
			"Language code of the original article: 'eng' for English or 'npi' for Nepali",
		),
});

export type newsSummaryType = z.infer<typeof summarySchema>;
