import { ConvexError, v } from "convex/values";
import {
	internalAction,
	internalMutation,
	mutation,
	query,
} from "./_generated/server";
import { ipoStatus, ipoType } from "./utils/types";
import { STATUS_RANK } from "./utils/utils";

const baseUrl = process.env.BACKEND_URL;
const authToken = process.env.BACKEND_TOKEN;

export const fetchIPOs = internalAction({
	args: {},
	handler: async (_): Promise<void> => {
		if (!baseUrl || !authToken) {
			throw new ConvexError("BACKEND_URL or BACKEND_TOKEN is not set");
		}

		const url = `${baseUrl}/api/v1/fetch-ipos`;

		await fetch(url, {
			method: "GET",
			headers: {
				Authorization: authToken,
			},
		});
	},
});

export const addAllIPOs = mutation({
	args: {
		data: v.array(
			v.object({
				companyName: v.string(),
				shareType: ipoType,
				pricePerUnit: v.string(),
				units: v.string(),
				openingDateAD: v.string(),
				openingDateBS: v.string(),
				closingDateAD: v.string(),
				closingDateBS: v.string(),
				closingDateClosingTime: v.string(),
				status: ipoStatus,
				shareRegistrar: v.string(),
				stockSymbol: v.string(),
			}),
		),
	},
	handler: async (ctx, { data }) => {
		const now = Date.now();

		for (const ipo of data) {
			const statusRank = STATUS_RANK[ipo.status];

			const existing = await ctx.db
				.query("allIssues")
				.withIndex("by_symbol_type", (q) =>
					q.eq("stockSymbol", ipo.stockSymbol).eq("shareType", ipo.shareType),
				)
				.unique();

			if (existing) {
				await ctx.db.patch(existing._id, {
					...ipo,
					updatedAt: now,
					statusRank,
				});
			} else {
				await ctx.db.insert("allIssues", {
					...ipo,
					updatedAt: now,
					statusRank,
				});
			}
		}
	},
});

export const addCurrentIPOs = mutation({
	args: {
		data: v.array(
			v.object({
				companyName: v.string(),
				issueManager: v.string(),
				issuedUnit: v.string(),
				numberOfApplication: v.string(),
				appliedUnit: v.string(),
				amount: v.string(),
				openDate: v.string(),
				closeDate: v.string(),
				lastUpdate: v.string(),
			}),
		),
	},
	handler: async (ctx, { data }) => {
		for (const curr of data) {
			const existing = await ctx.db
				.query("currentIssues")
				.withIndex("by_companyName", (q) =>
					q.eq("companyName", curr.companyName),
				)
				.unique();

			if (existing) {
				await ctx.db.patch(existing._id, curr);
			} else {
				await ctx.db.insert("currentIssues", curr);
			}
		}
	},
});

export const getIPOs = query({
	handler: async (ctx) => {
		return await ctx.db
			.query("allIssues")
			.withIndex("by_rank_updatedAt")
			.order("asc") // rank: Open → Nearing → Closed
			.collect();
	},
});

export const getCurrentIssues = query({
	handler: async (ctx) => {
		return await ctx.db.query("currentIssues").order("asc").collect();
	},
});

export const clearOldIPOs = internalMutation({
	args: {},
	handler: async (ctx) => {
		// I don't need allIssues list after 50th item
		const allIPOs = await ctx.db.query("allIssues").order("asc").collect();

		if (allIPOs.length <= 50) {
			return;
		}
		const iposToDelete = allIPOs.slice(0, allIPOs.length - 50);

		for (const allIssues of iposToDelete) {
			await ctx.db.delete(allIssues._id);
		}
	},
});
