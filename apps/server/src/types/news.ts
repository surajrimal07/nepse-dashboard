import z from "@nepse-dashboard/zod";

export interface NewsItem {
	title: string;
	link?: string;
	description?: string;
	img_url?: string;
	pubDate: string | Date;
	source?: string;
	unique_key: string;
	views?: number;
}

//new news AI content schema
export const NewsSummaryResponseSchema = z.object({
	type: z.literal("summary"),
	data: z.object({
		summaryId: z.string(),
		title: z.object({
			english: z.string(),
			nepali: z.string(),
		}),
		summary: z.object({
			english: z.string(),
			nepali: z.string(),
		}),
		themes: z.array(z.string()),
		bias: z.object({
			sentiment: z.enum(["Positive", "Negative", "Neutral"]),
			score: z.number().min(0).max(100),
			description: z.string(),
		}),
		originalLanguage: z.string(),
		tokenUsed: z.number().optional(),
		error: z.string().optional(),
	}),
});

export type NewsSummaryResponseType = z.infer<typeof NewsSummaryResponseSchema>;

export const NewsSummaryFeedbackResponseSchema = z.object({
	type: z.literal("feedback"),
	data: z.object({
		success: z.boolean(),
		message: z.string().optional(),
		error: z.string().optional(),
	}),
});

export type NewsSummaryFeedback = z.infer<
	typeof NewsSummaryFeedbackResponseSchema
>;

//incoming news content schema
export const newsSummaryIncomingSchema = z.object({
	site: z.string().min(2, "Site name must be at least 2 characters long"), // News site name
	title: z.string().min(2, "Title must be at least 2 characters long"), // News title
	content: z.string().min(10, "Content must be at least 10 characters long"), // News content
	url: z.string().min(2, "URL must be at least 2 characters long"), // URL of the news article
	lang: z.string().optional().default("english"), // Language of the news content, default to English
});

export const newsSummaryFeedbackIncomingSchema = z.object({
	summaryId: z.string().min(1, "Summary ID is required"),
	vote: z.enum(["up", "down"]), // or use z.boolean() if you prefer true/false
	feedback: z.string().max(500).optional(), // Optional user comment
});

export type NewsSummaryFeedbackIncomingType = z.infer<
	typeof newsSummaryFeedbackIncomingSchema
>;

export type NewsSummaryIncomingType = z.infer<typeof newsSummaryIncomingSchema>;

// export const NewsSchema = z.discriminatedUnion("type", [
//   z.object({
//     type: z.literal("summary"),
//     data: newsContentIncomingSchema,
//   }),
//   z.object({
//     type: z.literal("feedback"),
//     data: newsSummaryFeedbackSchema,
//   }),
// ]);

// export type NewsType = z.infer<typeof NewsSchema>;
