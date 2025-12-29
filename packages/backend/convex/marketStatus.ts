import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { marketStates } from "./utils/types";
import { getDateFromAsOf } from "./utils/utils";

export const get = query({
	handler: async (ctx) => {
		return await ctx.db.query("marketStatus").unique();
	},
});

export const isOpen = query({
	handler: async (ctx) => {
		const marketStatus = await ctx.db.query("marketStatus").unique();
		if (!marketStatus) {
			return false;
		}
		return marketStatus.isOpen;
	},
});

export const lastOpenDate = query({
	handler: async (ctx) => {
		const marketStatus = await ctx.db.query("marketStatus").unique();
		if (marketStatus?.asOf) {
			return getDateFromAsOf(marketStatus.asOf);
		}
		return null;
	},
});

export const lastOpenTime = query({
	handler: async (ctx) => {
		const marketStatus = await ctx.db.query("marketStatus").unique();

		return marketStatus?.asOf;
	},
});

export const update = mutation({
	args: {
		state: marketStates,
		isOpen: v.boolean(),
		version: v.string(),
		asOf: v.string(),
	},
	handler: async (ctx, args) => {
		//get the existing id
		const existing = await ctx.db.query("marketStatus").unique();

		if (!existing) {
			await ctx.db.insert("marketStatus", args);
		} else {
			await ctx.db.patch(existing._id, args);
		}
	},
});
