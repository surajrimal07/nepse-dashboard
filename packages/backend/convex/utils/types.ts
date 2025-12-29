import { type Infer, v } from "convex/values";

export const marketStates = v.union(
	v.literal("Open"),
	v.literal("Close"),
	v.literal("Pre Open"),
	v.literal("Pre Close"),
);

export const indexKeys = v.union(
	v.literal("Banking SubIndex"),
	v.literal("Development Bank Ind."),
	v.literal("Finance Index"),
	v.literal("Hotels And Tourism"),
	v.literal("HydroPower Index"),
	v.literal("Investment"),
	v.literal("Life Insurance"),
	v.literal("Manufacturing And Pr."),
	v.literal("Microfinance Index"),
	v.literal("Mutual Fund"),
	v.literal("NEPSE Index"),
	v.literal("Non Life Insurance"),
	v.literal("Others Index"),
	v.literal("Trading Index"),
);

export type indexKeys = Infer<typeof indexKeys>;

export const predictions = v.union(
	v.literal("Market likely to increase significantly"),
	v.literal("Market may increase"),
	v.literal("Market likely to decrease significantly"),
	v.literal("Market may decrease"),
	v.literal("Market may remain stable"),
);

// export enum NotificationCategory {
// 	SYSTEM = "system",
// 	MARKET = "market",
// 	PRICE_ALERT = "price_alert",
// 	NEWS = "news",
// 	MAINTENANCE = "maintenance",
// }

// export enum NotificationPriority {
// 	LOW = "low",
// 	MEDIUM = "medium",
// 	HIGH = "high",
// }

// export const notificationCategory = v.union(
// 	v.literal(NotificationCategory.SYSTEM),
// 	v.literal(NotificationCategory.MARKET),
// 	v.literal(NotificationCategory.PRICE_ALERT),
// 	v.literal(NotificationCategory.NEWS),
// 	v.literal(NotificationCategory.MAINTENANCE),
// );

// export const notificationPriority = v.union(
// 	v.literal(NotificationPriority.LOW),
// 	v.literal(NotificationPriority.MEDIUM),
// 	v.literal(NotificationPriority.HIGH),
// );

export const tiers = v.union(
	v.literal("free"),
	v.literal("pro"),
	v.literal("elite"),
);
export type Tier = Infer<typeof tiers>;

export const newsSentiment = v.union(
	v.literal("Positive"),
	v.literal("Negative"),
	v.literal("Neutral"),
);

export const newsSites = v.union(
	v.literal("merolagani"),
	v.literal("sharesansar"),
	v.literal("arthasarokar"),
	v.literal("arthasansar"),
);

export const modelTypes = v.union(
	v.literal("News"),
	v.literal("Chat"),
	v.literal("General"),
	v.literal("Title"),
);

export type ModelType = Infer<typeof modelTypes>;

export const newsLanguages = v.union(v.literal("eng"), v.literal("npi"));

export const aiProviders = v.union(
	v.literal("gemini"),
	v.literal("openai"),
	v.literal("anthropic"),
	v.literal("deepseek"),
	v.literal("grok"),
	v.literal("deepinfra"),
	v.literal("fireworks"),
	v.literal("perplexity"),
	v.literal("mistral"),
	v.literal("openrouter"),
);

export const instrumentType = v.union(
	v.literal("Equity"),
	v.literal("Mutual Funds"),
	v.literal("Non-Convertible Debentures"),
	v.literal("Preference Shares"),
);

export const securityStatus = v.union(
	v.literal("D"),
	v.literal("A"),
	v.literal("S"),
);

export const countType = v.union(
	v.literal("meroshare"),
	v.literal("tms"),
	v.literal("naasax"),
);

// "Commercial Banks",
// 	"Hotels And Tourism",
// 	"Others",
// 	"Hydro Power",
// 	"Tradings",
// 	"Development Banks",
// 	"Microfinance",
// 	"Non Life Insurance",
// 	"Life Insurance",
// 	"Manufacturing And Processing",
// 	"Finance",
// 	"Investment",
// 	"Mutual Fund",
// export const internalsSector = v.union(
// 	v.literal("Banking SubIndex"),
// 	v.literal("Development Bank Ind."),
// 	v.literal("Finance Index"),
// 	v.literal("Hotels And Tourism"),
// 	v.literal("HydroPower Index"),
// 	v.literal("Investment"),
// 	v.literal("Life Insurance"),
// 	v.literal("Manufacturing And Pr."),
// 	v.literal("Microfinance Index"),
// 	v.literal("Mutual Fund"),
// 	v.literal("NEPSE Index"),
// 	v.literal("Non Life Insurance"),
// 	v.literal("Others Index"),
// 	v.literal("Trading Index"),
// );

export const internalSector = v.union(
	v.literal("Banking SubIndex"),
	v.literal("Investment"),
	v.literal("Mutual Fund"),
	v.literal("Others Index"),
	v.literal("Manufacturing And Pr."),
	v.literal("Life Insurance"),
	v.literal("Non Life Insurance"),
	v.literal("Finance Index"),
	v.literal("Development Bank Ind."),
	v.literal("Hotels And Tourism"),
	v.literal("Microfinance Index"),
	v.literal("Trading Index"),
	v.literal("HydroPower Index"),
	v.literal("Promoter Share"),
);

export const ModelUsagePurpose = v.union(v.literal("News"), v.literal("Other"));

export const notificationVariant = v.union(
	v.literal("success"),
	v.literal("info"),
	v.literal("error"),
	v.literal("warning"),
);

export type NotificationVariant = Infer<typeof notificationVariant>;

export const ohlcTimeframe = v.union(v.literal("60"), v.literal("1D"));

export const exchangeMessages = v.array(
	v.object({
		id: v.number(),
		messageTitle: v.string(),
		messageBody: v.string(), // plain text
		encryptedId: v.union(v.string(), v.null()),
		filePath: v.union(v.string(), v.null()),
		addedDate: v.union(v.string(), v.null()),
		modifiedDate: v.union(v.string(), v.null()),
	}),
);

export const companyNews = v.array(
	v.object({
		id: v.number(),
		newsHeadline: v.string(),
		newsBody: v.string(), // plain text
		newsSource: v.string(),
		addedDate: v.string(),
		modifiedDate: v.string(),
		applicationDocumentDetailsList: v.array(
			v.object({
				id: v.number(),
				activeStatus: v.string(),
				submittedDate: v.string(),
				filePath: v.string(),
				encryptedId: v.string(),
			}),
		),
	}),
);

export const ipoStatus = v.union(
	v.literal("Open"),
	v.literal("Closed"),
	v.literal("Nearing"),
);

export const ipoType = v.union(
	v.literal("local"),
	v.literal("ordinary"),
	v.literal("Migrant Workers"),
);
