import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { isDataSender } from "./users";
import { indexKeys } from "./utils/types";

export const getNepseChange = query({
	handler: async (ctx) => {
		const data = await ctx.db
			.query("index")
			.withIndex("by_index", (q) => q.eq("index", "NEPSE Index"))
			.unique();

		return data?.change ?? 0;
	},
});

export const get = query({
	args: {
		index: indexKeys,
	},
	handler: async (ctx, args) => {
		const index = args.index;

		return await ctx.db
			.query("index")
			.withIndex("by_index", (q) => q.eq("index", index))
			.unique();
	},
});

export const getAll = query({
	handler: async (ctx) => {
		return await ctx.db.query("index").collect();
	},
});

export const getNepseIndexData = query({
	handler: async (ctx) => {
		return await ctx.db
			.query("index")
			.withIndex("by_index", (q) => q.eq("index", "NEPSE Index"))
			.unique();
	},
});

export const updateNepseIndexData = mutation({
	args: {
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
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("index")
			.withIndex("by_index", (q) => q.eq("index", args.index))
			.first();

		if (existing) {
			await ctx.db.patch(existing._id, {
				...args,
			});
			return existing;
		}

		//insert new index data
		const newIndexData = await ctx.db.insert("index", {
			...args,
		});

		return await ctx.db.get(newIndexData);
	},
});

export const patchNepseIndexData = mutation({
	args: {
		time: v.string(),
		totalTransactions: v.number(),
		totalScripsTraded: v.number(),
		totalCapitalization: v.string(),
		totalTradedShared: v.number(),
		fiftyTwoWeekHigh: v.number(),
		fiftyTwoWeekLow: v.number(),
		version: v.string(),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("index")
			.withIndex("by_index", (q) => q.eq("index", "NEPSE Index"))
			.unique();

		if (existing) {
			await ctx.db.patch(existing._id, {
				...args,
			});
			return existing;
		}
	},
});

export const patchOtherIndexData = mutation({
	args: {
		data: v.array(
			v.object({
				index: indexKeys,
				turnover: v.string(), //amount
				close: v.number(),
				high: v.number(),
				low: v.number(),
				percentageChange: v.number(),
				change: v.number(),
				open: v.number(),
				time: v.string(),
				previousClose: v.number(),
				totalTradedShared: v.number(), //volume
				color: v.string(), //computed
				version: v.string(),
				adLine: v.object({
					advance: v.number(),
					decline: v.number(),
					neutral: v.number(),
				}),
			}),
		),
	},
	handler: async (ctx, args) => {
		if (!args.data) {
			throw new ConvexError("Index is required");
		}

		const results = [];

		for (const indexData of args.data) {
			const existing = await ctx.db
				.query("index")
				.withIndex("by_index", (q) => q.eq("index", indexData.index))
				.unique();

			if (existing) {
				await ctx.db.patch(existing._id, {
					...indexData,
				});
				results.push(existing);
			} else {
				//insert new index data
				const newIndexData = await ctx.db.insert("index", {
					...indexData,
				});
				const inserted = await ctx.db.get(newIndexData);
				results.push(inserted);
			}
		}

		return results;
	},
});

export const consumeNepseIndexData = mutation({
	args: {
		close: v.number(),
		change: v.number(),
		percentageChange: v.number(),
		totalTradedShared: v.number(),
		turnover: v.string(),
		randomId: v.string(),
	},
	handler: async (ctx, args) => {

		console.log("incoming data", args);

		const isSender = await isDataSender(ctx, { randomId: args.randomId });
		if (!isSender) {
			return;
		}

		const existing = await ctx.db
			.query("index")
			.withIndex("by_index", (q) => q.eq("index", "NEPSE Index"))
			.unique();

		if (existing) {
			await ctx.db.patch(existing._id, {
				...args,
			});
		}
	},
});
