import z from "@nepse-dashboard/zod";

const stripHtml = (html: string) =>
	html
		.replace(/<[^>]*>/g, "")
		.replace(/\s+/g, " ")
		.trim();

export const ExchangeMessageSchema = z.object({
	id: z.number(),
	messageTitle: z.string(),
	messageBody: z.string().transform(stripHtml),
	encryptedId: z.string().nullable(),
	filePath: z.string().nullable(),
	addedDate: z.string().nullable(),
	modifiedDate: z.string().nullable(),
});

export const CompanyNewsDocumentSchema = z.object({
	id: z.number(),
	activeStatus: z.string(),
	submittedDate: z.string(),
	filePath: z.string(),
	encryptedId: z.string(),
});

export const CompanyNewsItemSchema = z.object({
	id: z.number(),
	newsHeadline: z.string(),
	newsBody: z.string().transform(stripHtml),
	newsSource: z.string(), //company
	addedDate: z.string(),
	modifiedDate: z.string(),
	applicationDocumentDetailsList: z.array(CompanyNewsDocumentSchema),
});

export const MarketApiResponseSchema = z.object({
	exchangeMessages: z.array(ExchangeMessageSchema),
	companyNews: z.array(CompanyNewsItemSchema),
});
