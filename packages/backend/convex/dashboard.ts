import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getDateFromAsOf, getNepaliDate, getNepaliTime } from "./utils/utils";

export const get = query({
	handler: async (ctx) => {
		return await ctx.db.query("dashboard").order("desc").first();
	},
});

export const getAll = query({
	handler: async (ctx) => {
		const nepalDate = getNepaliDate();

		const isOpen = await ctx.db.query("marketStatus").first();

		const lastOpenDate = isOpen?.asOf
			? getDateFromAsOf(isOpen?.asOf)
			: nepalDate;

		return await ctx.db
			.query("dashboard")
			.withIndex("by_date", (q) => q.eq("date", getDateFromAsOf(lastOpenDate)))
			.order("asc")
			.collect();
	},
});

export const update = mutation({
	args: {
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
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("dashboard")
			.filter((q) => q.eq(q.field("version"), args.version))
			.first();

		if (!existing) {
			await ctx.db.insert("dashboard", {
				...args,
				date: getNepaliDate(),
				time: getNepaliTime(),
			});
		}
	},
});

export const cleanup = internalMutation({
	args: {},
	handler: async (ctx) => {
		const isOpen = await ctx.db.query("marketStatus").first();

		if (!isOpen?.asOf) {
			return "Market status not available";
		}

		const lastOpenDate = getDateFromAsOf(isOpen?.asOf);

		// Use the "by_date" index directly
		const itemsToDelete = await ctx.db
			.query("dashboard")
			.withIndex("by_date", (q) => q.lt("date", lastOpenDate))
			.take(300); //300 is enough data point for a day

		if (itemsToDelete.length === 0) {
			return "No items to delete";
		}

		for (const item of itemsToDelete) {
			await ctx.db.delete(item._id);
		}

		return `Deleted ${itemsToDelete.length} items older than ${lastOpenDate}`;
	},
});
