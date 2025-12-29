// import { v } from "convex/values";
// import { internalQuery, query } from "@/_generated/server";
// import { counter } from "@/index";

// export const getSuggestions = query({
// 	args: {},
// 	handler: async (ctx) => {
// 		return await ctx.db
// 			.query("suggestedQuestions")
// 			.withIndex("by_active", (q) => q.eq("is_active", true))
// 			.order("desc")
// 			.take(10);
// 	},
// });

// export const getTodaysSuggestions = internalQuery({
// 	args: {
// 		numResults: v.optional(v.number()),
// 	},
// 	handler: async (ctx, args) => {
// 		// get all suggestions generated today
// 		const now = new Date();
// 		const startOfDay = new Date(
// 			now.getFullYear(),
// 			now.getMonth(),
// 			now.getDate(),
// 		).getTime();
// 		const suggestions = await ctx.db
// 			.query("suggestedQuestions")
// 			.withIndex("by_active", (q) => q.eq("is_active", true))
// 			.order("desc")
// 			.collect();

// 		// filter out the older suggestions
// 		const filtered = suggestions.filter((s) => s.created_at >= startOfDay);

// 		// count how many times each suggestion has been clicked
// 		const counts = await Promise.all(
// 			filtered.map(async (suggestion) => {
// 				const count = await counter.count(ctx, suggestion._id);
// 				return {
// 					...suggestion,
// 					count,
// 				};
// 			}),
// 		);
// 		// sort by count and return the top clicked results
// 		return counts
// 			.sort((a, b) => b.count - a.count)
// 			.slice(0, args.numResults ?? counts.length);
// 	},
// });
