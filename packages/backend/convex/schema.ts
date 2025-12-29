import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
	aiProviders,
	indexKeys,
	instrumentType,
	internalSector,
	ipoStatus,
	ipoType,
	ModelUsagePurpose,
	marketStates,
	modelTypes,
	newsLanguages,
	newsSentiment,
	notificationVariant,
	ohlcTimeframe,
	predictions,
	securityStatus,
} from "./utils/types";

export default defineSchema({
	users: defineTable({
		randomId: v.string(),
		name: v.optional(v.string()),
		image: v.optional(v.string()), // get from gravatar later // triggers action to fetch gravatar on signup
		email: v.string(),

		// //custom fields
		// fcmId: v.optional(v.string()),
		dataSender: v.optional(v.boolean()),
		lastDataSentAt: v.optional(v.number()),
		//later add fields like notification preferences,
		//cookies preferences etc, can also be used to sync client data
		//like theme, language, subscribed index, stocks, etc.
		authorized: v.boolean(), //default false ,, only true when user verifies email
		createdAt: v.number(),
		lastActive: v.number(),
		updatedAt: v.number(),
	})
		.index("by_email", ["email"])
		.index("by_randomId", ["randomId"])
		.index("by_dataSender", ["dataSender"]),

	emailOtps: defineTable({
		email: v.string(),
		otp: v.number(),
		randomId: v.string(),
		createdAt: v.number(),
	})
		.index("by_email", ["email"])
		.index("by_randomId", ["randomId"])
		.index("by_otp", ["otp"]),

	loginCount: defineTable({
		randomId: v.string(),
		meroshare: v.optional(v.number()),
		tms: v.optional(v.number()),
		naasax: v.optional(v.number()),
	}).index("by_randomId", ["randomId"]),

	activateCount: defineTable({
		randomId: v.string(),
		count: v.number(),
	}).index("by_randomId", ["randomId"]),

	//Market Status
	marketStatus: defineTable({
		state: marketStates,
		isOpen: v.boolean(),
		asOf: v.string(), // ISO date string
		version: v.string(),
	}),

	versions: defineTable({
		version: v.string(),
		changelogs: v.array(v.string()),
	}).index("by_version", ["version"]),

	userLatency: defineTable({
		location: v.string(),
		latency: v.number(),
		randomId: v.string(),
	}).index("by_randomId", ["randomId"]),

	userLatencyStats: defineTable({
		randomId: v.string(),
		sum: v.number(), // running total
		count: v.number(), // number of samples
	}).index("by_randomId", ["randomId"]),

	indexNames: defineTable({
		index: indexKeys,
		created_at: v.number(),
		updated_at: v.number(),
	})
		.index("by_index", ["index"])
		.searchIndex("search_index_name", {
			searchField: "index",
			filterFields: ["index"],
		}),

	stockNames: defineTable({
		securityName: v.string(),
		symbol: v.string(),
		status: securityStatus,
		instrumentType: instrumentType,
		created_at: v.number(),
		updated_at: v.number(),
	})
		.index("by_symbol", ["symbol"])
		.index("by_status", ["status"])
		.index("by_instrumentType", ["instrumentType"])
		.index("by_status_instrumentType", ["status", "instrumentType"])
		.searchIndex("search_companies_name", {
			searchField: "securityName",
			filterFields: ["status", "instrumentType"],
		})
		.searchIndex("search_companies_symbol", {
			searchField: "symbol",
			filterFields: ["status", "instrumentType"],
		}),

	company: defineTable({
		time: v.string(),
		symbol: v.string(),
		openPrice: v.number(),
		highPrice: v.number(),
		lowPrice: v.number(),
		closePrice: v.number(),
		turnover: v.number(),
		previousClose: v.number(),
		change: v.number(),
		percentageChange: v.number(),
		totalTradedShared: v.number(),
		securityName: v.string(),
		sectorName: v.string(),
		internalSector: internalSector,
		color: v.string(),
		totalTrades: v.optional(v.number()),
		totalTradeQuantity: v.optional(v.number()),
		lastTradedPrice: v.optional(v.number()),
		fiftyTwoWeekHigh: v.optional(v.number()),
		fiftyTwoWeekLow: v.optional(v.number()),
		lastUpdatedDateTime: v.optional(v.string()),
		listingDate: v.optional(v.string()),
		companyName: v.optional(v.string()),
		email: v.optional(v.string()),
		companyWebsite: v.optional(v.string()),
		companyContactPerson: v.optional(v.string()),
		stockListedShares: v.optional(v.string()),
		paidUpCapital: v.optional(v.string()),
		issuedCapital: v.optional(v.string()),
		marketCapitalization: v.optional(v.string()),
		publicShares: v.optional(v.string()),
		publicPercentage: v.optional(v.number()),
		promoterShares: v.optional(v.string()),
		promoterPercentage: v.optional(v.number()),
		faceValue: v.optional(v.number()),
		tradingStartDate: v.optional(v.string()),
		version: v.optional(v.string()),
		percentage_change_monthly: v.optional(v.number()),
		point_change_monthly: v.optional(v.number()),
	})
		.index("by_symbol", ["symbol"])
		.index("by_sectorName", ["sectorName"])
		.index("by_internalSector", ["internalSector"])
		.index("by_securityName", ["securityName"])
		.searchIndex("search_companies_name", {
			searchField: "securityName",
		})
		.searchIndex("search_companies_symbol", {
			searchField: "symbol",
		})
		.searchIndex("search_companies_by_sector", {
			searchField: "internalSector",
		}),

	highcaps: defineTable({
		symbol: v.string(),
		core_capital: v.number(),
		public_shares: v.number(),
		float_cap: v.number(),
		close: v.number(),
		date: v.string(),
		volume: v.number(),
	}).index("by_symbol", ["symbol"]),

	companyCharts: defineTable({
		symbol: v.string(),
		data: v.array(v.array(v.number())),
		version: v.string(),
		timeframe: v.union(v.literal("1m"), v.literal("1d")),
	})
		.index("by_symbol_timeframe", ["symbol", "timeframe"])
		.index("by_symbol", ["symbol"])
		.index("by_version", ["version"]),

	ohlc: defineTable({
		symbol: v.string(),
		timeframe: ohlcTimeframe,
		t: v.array(v.number()),
		c: v.optional(v.array(v.number())),
		o: v.optional(v.array(v.number())),
		h: v.optional(v.array(v.number())),
		l: v.optional(v.array(v.number())),
		v: v.optional(v.array(v.number())),
		lastFinalizedTime: v.number(),
	})
		.index("by_symbol", ["symbol"])
		.index("by_symbol_timeframe", ["symbol", "timeframe"]),

	index: defineTable({
		index: indexKeys,
		time: v.string(),
		open: v.number(),
		high: v.number(),
		low: v.number(),
		close: v.number(),
		change: v.number(),
		previousClose: v.number(),
		totalTradedShared: v.number(),
		totalTransactions: v.optional(v.number()),
		totalScripsTraded: v.optional(v.number()),
		turnover: v.string(),
		totalCapitalization: v.optional(v.string()),
		percentageChange: v.number(),
		fiftyTwoWeekHigh: v.optional(v.number()),
		fiftyTwoWeekLow: v.optional(v.number()),
		color: v.string(),
		version: v.string(),
		adLine: v.object({
			advance: v.number(),
			decline: v.number(),
			neutral: v.number(),
		}),
	}).index("by_index", ["index"]),

	indexCharts: defineTable({
		index: indexKeys,
		data: v.array(v.array(v.number())),
		version: v.string(),
		timeframe: v.union(v.literal("1m"), v.literal("1d")),
	})
		.index("by_index", ["index"])
		.index("by_index_timeframe", ["index", "timeframe"]),

	rooms: defineTable({
		email: v.string(),
		stockCharts: v.array(v.string()),
		indexCharts: v.optional(v.array(v.string())),
		marketDepth: v.optional(v.array(v.string())),
	})
		.index("by_email", ["email"])
		.index("by_stockCharts", ["stockCharts"])
		.index("by_indexCharts", ["indexCharts"])
		.index("by_marketDepth", ["marketDepth"]),

	marketDepth: defineTable({
		symbol: v.string(),
		totalBuyQty: v.number(),
		totalSellQty: v.number(),
		timeStamp: v.number(),
		version: v.string(),
		marketDepth: v.object({
			buyMarketDepthList: v.array(
				v.object({
					stockId: v.number(),
					orderBookOrderPrice: v.number(),
					quantity: v.number(),
					orderCount: v.number(),
					isBuy: v.union(v.literal(1), v.literal(2)),
					buy: v.boolean(),
					sell: v.boolean(),
				}),
			),
			sellMarketDepthList: v.array(
				v.object({
					stockId: v.number(),
					orderBookOrderPrice: v.number(),
					quantity: v.number(),
					orderCount: v.number(),
					isBuy: v.union(v.literal(1), v.literal(2)),
					buy: v.boolean(),
					sell: v.boolean(),
				}),
			),
		}),
	})
		.index("by_symbol", ["symbol"])
		.index("by_timeStamp", ["timeStamp"])
		.index("by_symbol_version", ["symbol", "version"]),

	screenshot: defineTable({
		imageUrl: v.string(),
		randId: v.string(),
	}).index("by_randId", ["randId"]),

	brokers: defineTable({
		broker_name: v.string(),
		broker_number: v.number(),
		broker_address: v.string(),
		broker_phone: v.optional(v.string()),
		broker_email: v.optional(v.string()),
		broker_website: v.optional(v.string()),
		tms_link: v.optional(v.string()),
	})
		.index("by_broker_name", ["broker_name"])
		.index("by_broker_number", ["broker_number"])
		.index("by_tms_link", ["tms_link"])
		.searchIndex("search_broker_name", {
			searchField: "broker_name",
		})
		.searchIndex("search_broker_number", {
			searchField: "broker_number",
		}),

	dp: defineTable({
		dpid: v.number(),
		name: v.string(),
		address: v.string(),
		phone: v.union(v.string(), v.array(v.string())),
		email: v.optional(v.union(v.string(), v.array(v.string()))),
	})
		.index("by_dpid", ["dpid"])
		.index("by_name", ["name"])
		.searchIndex("search_dp_name", {
			searchField: "name",
		})
		.searchIndex("search_dp_number", {
			searchField: "dpid",
		}),

	supplyDemand: defineTable({
		highestQuantityperOrder: v.array(
			v.object({
				symbol: v.string(),
				totalBuyOrder: v.optional(v.number()),
				totalBuyQuantity: v.optional(v.number()),
				totalSellOrder: v.optional(v.number()),
				totalSellQuantity: v.optional(v.number()),
				buyQuantityPerOrder: v.optional(v.number()),
				sellQuantityPerOrder: v.optional(v.number()),
				buyToSellOrderRatio: v.optional(v.number()),
				buyToSellQuantityRatio: v.optional(v.number()),
			}),
		),

		highestSupply: v.array(
			v.object({
				symbol: v.string(),
				totalOrder: v.number(),
				totalQuantity: v.number(),
				quantityPerOrder: v.optional(v.number()),
				orderSide: v.optional(v.string()),
			}),
		),

		highestDemand: v.array(
			v.object({
				symbol: v.string(),
				totalOrder: v.number(),
				totalQuantity: v.number(),
				quantityPerOrder: v.optional(v.number()),
				orderSide: v.optional(v.string()),
			}),
		),

		version: v.string(),
		time: v.string(), // ISO date string
		date: v.string(), // ISO date string
	}),

	nepsePredictions: defineTable({
		prediction: predictions,
		strength: v.number(),
		version: v.string(),
		updatedAt: v.number(),
		topCompanies: v.array(
			v.object({
				ticker: v.string(),
				name: v.string(),
				impact: v.number(),
				ltp: v.union(v.number(), v.null()),
				pointchange: v.union(v.number(), v.null()),
				percentchange: v.union(v.number(), v.null()),
				volume: v.optional(v.union(v.number(), v.null())),
			}),
		),
	}),

	notification: defineTable({
		userId: v.optional(v.string()), //if present, targeted to specific user
		title: v.string(),
		body: v.string(),
		variant: notificationVariant,
		icon: v.optional(v.string()),
		expiresAt: v.optional(v.number()),
	}).index("by_userId", ["userId"]),

	dashboard: defineTable({
		gainers: v.array(
			v.object({
				symbol: v.string(),
				name: v.string(),
				ltp: v.number(),
				pointchange: v.number(),
				percentchange: v.number(),
			}),
		),
		losers: v.array(
			v.object({
				symbol: v.string(),
				name: v.string(),
				ltp: v.number(),
				pointchange: v.number(),
				percentchange: v.number(),
			}),
		),
		transactions: v.array(
			v.object({
				symbol: v.string(),
				name: v.string(),
				ltp: v.number(),
				transactions: v.number(),
			}),
		),
		turnovers: v.array(
			v.object({
				symbol: v.string(),
				name: v.string(),
				ltp: v.number(),
				turnover: v.string(),
			}),
		),
		traded: v.array(
			v.object({
				symbol: v.string(),
				name: v.string(),
				ltp: v.number(),
				shareTraded: v.number(),
			}),
		),
		version: v.string(),
		date: v.string(), // ISO date string
		time: v.string(), // Time in HH:MM format
	})
		.index("by_date", ["date"])
		.index("by_gainers", ["gainers"])
		.index("by_losers", ["losers"])
		.index("by_transactions", ["transactions"])
		.index("by_turnovers", ["turnovers"])
		.index("by_traded", ["traded"]),

	models: defineTable({
		id: v.string(),
		provider: aiProviders,
		is_active: v.boolean(),
		apiKey: v.string(),
		createdAt: v.number(),
		updated_at: v.number(),
		inputCostPerMillionTokens: v.number(),
		outputCostPerMillionTokens: v.number(),
		task_type: modelTypes,
		is_default_for_task: v.boolean(),
	})
		.index("by_model_id", ["id"])
		.index("by_provider", ["provider"])
		.index("by_is_active", ["is_active"])
		.index("by_createdAt", ["createdAt"])
		.index("by_updatedAt", ["updated_at"])
		.index("by_task_type", ["task_type"]) // Add index for task_type for efficient queries
		.index("by_task_type_default", ["task_type", "is_default_for_task"]), // Query default by task

	modelUsageLogs: defineTable({
		inputTokens: v.number(),
		outputTokens: v.number(),
		purpose: ModelUsagePurpose,
		created_at: v.number(),
		model_id: v.id("models"),
		userId: v.id("users"),
		news: v.id("news"),
	}).index("by_model_id", ["model_id"]),

	//not yet
	tokenUsage: defineTable({
		modelId: v.id("models"),
		inputTokenCost: v.number(),
		outputTokenCost: v.number(),
		totalCost: v.number(),
		inputTokens: v.number(),
		outputTokens: v.number(),
		updated_at: v.number(),
		created_at: v.number(),
	}).index("by_model_id", ["modelId"]),

	user_tokens_uses: defineTable({
		userId: v.id("users"),
		tokens_used: v.number(),
		updated_at: v.number(),
		created_at: v.number(),
	}).index("by_userId", ["userId"]),

	articleSummaries: defineTable({
		url: v.string(),
		summary: v.string(), //summarized content
		content: v.string(),
		title: v.string(),
		generated_model: v.optional(v.string()), //model id
		generated_provider: v.optional(aiProviders),
		userId: v.id("users"), //user who generated this summary
	}).index("by_url", ["url"]),

	news: defineTable({
		userId: v.union(v.id("users"), v.string()), //orginal user who generated summary of this news
		model: v.union(v.id("models"), v.string()), //model used to generate this summary
		title: v.object({
			nepali: v.string(),
			english: v.string(),
		}),
		url: v.string(), //unique
		summary: v.object({
			nepali: v.string(),
			english: v.string(),
		}),
		themes: v.array(v.string()),
		bias: v.object({
			sentiment: newsSentiment,
			score: v.number(),
		}),
		originalLanguage: newsLanguages,
		createdAt: v.number(), // ISO date string
		readCount: v.number(), // Number of times the news has been read
		positiveCount: v.number(), // Thumbs up count
		negativeCount: v.number(), // Thumbs down count
	})
		.index("by_userId", ["userId"])
		.index("by_url", ["url"])
		.index("by_model", ["model"])
		.index("by_createdAt", ["createdAt"]),

	newsSummaryErrors: defineTable({
		model: v.union(v.id("models"), v.string()),
		url: v.string(),
		error: v.string(),
	})
		.index("by_model", ["model"])
		.index("by_url", ["url"]),

	newsSiteRequested: defineTable({
		siteName: v.string(),
		requestCount: v.number(),
		lastRequestedAt: v.number(),
	}).index("by_siteName", ["siteName"]),

	newsFeedback: defineTable({
		newsId: v.id("news"), // Reference to the news summary
		emailId: v.string(), // User who submitted feedback
		value: v.union(v.literal(-1), v.literal(0), v.literal(1)), // true for thumbs up, false for thumbs down
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_newsId", ["newsId"])
		.index("by_emailId", ["emailId"])
		.index("by_newsId_emailId", ["newsId", "emailId"]), // One feedback per user per summary

	chats: defineTable({
		title: v.optional(v.string()), // Chat title
		userId: v.optional(v.id("users")), // Reference to the user who owns the chat
		deleted: v.boolean(), // Soft delete flag
		updatedAt: v.number(), // Last updated timestamp
		linkedArticleUrl: v.optional(v.string()), // URL of the linked article
	})
		.index("by_userId_updated", ["userId", "deleted", "updatedAt"])
		.index("by_linkedArticleUrl", [
			"userId",
			"deleted",
			"updatedAt",
			"linkedArticleUrl",
		]),

	webSuggestions: defineTable({
		userId: v.string(),
		url: v.string(),
		suggestions: v.array(v.string()),
		createdAt: v.number(),
	})
		.index("by_userId", ["userId"])
		.index("by_url", ["url"]),

	exchangeMessages: defineTable({
		id: v.number(),
		messageTitle: v.string(),
		messageBody: v.string(), // plain text
		encryptedId: v.union(v.string(), v.null()),
		filePath: v.union(v.string(), v.null()),
		addedDate: v.union(v.string(), v.null()),
		modifiedDate: v.union(v.string(), v.null()),
	}),

	bannerInfoMessages: defineTable({
		id: v.number(),
		messageTitle: v.string(),
		messageBody: v.string(), // plain text
		messageType: v.union(
			v.literal("info"),
			v.literal("warning"),
			v.literal("error"),
		),
		link: v.optional(v.string()),
		isActive: v.boolean(),
	}).index("by_isActive", ["isActive"]),

	companyNews: defineTable({
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

	messages: defineTable({
		chatId: v.id("chats"),
		content: v.any(),
		deleted: v.boolean(),
		feedback: v.optional(
			v.object({
				liked: v.optional(v.boolean()),
				disliked: v.optional(v.boolean()),
				timestamp: v.optional(v.number()),
			}),
		),
	})
		.index("byChatId", ["chatId"])
		.index("byChatId_deleted", ["chatId", "deleted"]),

	messagecheckpoints: defineTable({
		chatId: v.id("chats"),
		messageIndex: v.number(),
	}).index("byChatId", ["chatId"]),

	allIssues: defineTable({
		companyName: v.string(),
		shareType: ipoType,
		pricePerUnit: v.string(),
		units: v.string(),
		openingDateAD: v.string(),
		openingDateBS: v.string(),
		closingDateAD: v.string(),
		closingDateBS: v.string(),
		closingDateClosingTime: v.string(),
		updatedAt: v.number(),
		statusRank: v.number(),
		status: ipoStatus,
		shareRegistrar: v.string(),
		stockSymbol: v.string(),
	})
		.index("by_rank_updatedAt", ["statusRank", "updatedAt"])
		.index("by_symbol_type", ["stockSymbol", "shareType"]),

	currentIssues: defineTable({
		companyName: v.string(),
		issueManager: v.string(),
		issuedUnit: v.string(),
		numberOfApplication: v.string(),
		appliedUnit: v.string(),
		amount: v.string(),
		openDate: v.string(),
		closeDate: v.string(),
		lastUpdate: v.string(),
	}).index("by_companyName", ["companyName"]),

	push_subscriptions: defineTable({
		userId: v.string(), // email or randomId?
		endpoint: v.string(),

		keys: v.object({
			p256dh: v.string(),
			auth: v.string(),
		}),

		// optional metadata
		userAgent: v.optional(v.string()),
		updatedAt: v.number(),
	})
		.index("by_userId", ["userId"])
		.index("by_endpoint", ["endpoint"]),
});
