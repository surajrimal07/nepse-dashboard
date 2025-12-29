import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { indexKeys } from "./utils/types";

export const add = mutation({
	args: {
		stockCharts: v.array(v.string()),
		indexCharts: v.array(indexKeys),
		marketDepth: v.array(v.string()),
		email: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const email = args.email;

		if (!email) {
			return;
		}

		const existing = await ctx.db
			.query("rooms")
			.withIndex("by_email", (q) => q.eq("email", email))
			.unique();

		if (existing) {
			await ctx.db.replace(existing._id, {
				email: email,
				stockCharts: args.stockCharts,
				indexCharts: args.indexCharts,
				marketDepth: args.marketDepth,
			});
		} else {
			await ctx.db.insert("rooms", {
				email: email,
				stockCharts: args.stockCharts,
				indexCharts: args.indexCharts,
				marketDepth: args.marketDepth,
			});
		}
	},
});

export const clearRoom = internalMutation({
	args: {},
	handler: async (ctx) => {
		const rooms = await ctx.db.query("rooms").collect();

		for (const room of rooms) {
			await ctx.db.delete(room._id);
		}

		return true;
	},
});

export const getUniqueItems = query({
	handler: async (ctx) => {
		const data = await ctx.db.query("rooms").collect();

		const stockChartsSet = new Set<string>();
		const indexChartsSet = new Set<string>();
		const marketDepthSet = new Set<string>();

		indexChartsSet.add("NEPSE Index"); // default

		for (const room of data) {
			room.stockCharts?.forEach((item: string) => {
				stockChartsSet.add(item);
			});
			room.indexCharts?.forEach((item: string) => {
				indexChartsSet.add(item);
			});
			room.marketDepth?.forEach((item: string) => {
				marketDepthSet.add(item);
			});
		}

		return {
			stockCharts: Array.from(stockChartsSet),
			indexCharts: Array.from(indexChartsSet),
			marketDepth: Array.from(marketDepthSet),
		};
	},
});

// export const removeUsers = internalMutation({
// 	handler: async (ctx) => {
// 		const users = await getAllActiveUsers(ctx);
// 		//Remove all users from the rooms whose userId is not in the active users list
// 		const rooms = await ctx.db.query("rooms").collect();
// 		const activeUserIds = users.map((user) => user.userId);
// 		for (const room of rooms) {
// 			if (!activeUserIds.includes(room.userId)) {
// 				await ctx.db.delete(room._id);
// 			}
// 		}
// 	},
// });
