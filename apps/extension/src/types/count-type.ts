export const CountType = {
	LOGIN_COUNT_MEROSHARE: "meroshare",
	LOGIN_COUNT_TMS: "tms",
	LOGIN_COUNT_NAASAX: "naasax",
} as const;

export const EventToCount = {
	SUMMARY_CACHE_HIT: "summary_cache_hit",
	SUMMARY_CACHE_MISS: "summary_cache_miss",
	SUMMARY_GENERATED: "summary_generated",
	SUGGESTED_QUESTIONS_CACHE_HIT: "suggested_questions_cache_hit",
	SUGGESTED_QUESTIONS_CACHE_MISS: "suggested_questions_cache_miss",
	SUGGESTED_QUESTIONS_GENERATED: "suggested_questions_generated",
	CHAT_QUERIES_MADE: "chat_queries_made",
	CHECK_CONFIG: "check_config",
	AUTOSAVED_ACCOUNT: "autosaved_account",
	NOTIFICATION_SHOWN: "notification_shown",
} as const;

export type CountType = (typeof CountType)[keyof typeof CountType];

export type EventCountType = (typeof EventToCount)[keyof typeof EventToCount];
