import { v } from "convex/values";
import { internalAction, mutation, query } from "./_generated/server";
import { ohlcTimeframe } from "./utils/types";

const baseUrl = process.env.BACKEND_URL;
const authToken = process.env.BACKEND_TOKEN;

export const existingStockOHLC = query({
	args: {
		timeframe: ohlcTimeframe,
	},
	handler: async (ctx, { timeframe }) => {
		const allStocks = await ctx.db.query("stockNames").collect();

		const missingSymbols: string[] = [];

		for (const stock of allStocks) {
			const exists = await ctx.db
				.query("ohlc")
				.withIndex("by_symbol_timeframe", (q) =>
					q.eq("symbol", stock.symbol).eq("timeframe", timeframe),
				)
				.first(); // only need 1 document

			// Treat as missing if not exists, or c is not an array, or c.length < 10
			if (!exists || !Array.isArray(exists.c) || exists.c.length < 10) {
				missingSymbols.push(stock.symbol);
			}
		}

		return missingSymbols;
	},
});

export const existingIndexOHLC = query({
	args: {
		timeframe: ohlcTimeframe,
	},
	handler: async (ctx, { timeframe }) => {
		const allStocks = await ctx.db.query("indexNames").collect();

		const missingSymbols: string[] = [];

		for (const stock of allStocks) {
			const exists = await ctx.db
				.query("ohlc")
				.withIndex("by_symbol_timeframe", (q) =>
					q.eq("symbol", stock.index).eq("timeframe", timeframe),
				)
				.first(); // only need 1 document

			// Treat as missing if not exists, or c is not an array, or c.length < 10
			if (!exists || !Array.isArray(exists.c) || exists.c.length < 10) {
				missingSymbols.push(stock.index);
			}
		}

		return missingSymbols;
	},
});

export const fetchMissingOHLCData = internalAction({
	args: {
		timeframe: ohlcTimeframe,
		type: v.union(v.literal("index"), v.literal("stock")),
	},
	handler: async (
		_ctx,
		{ timeframe, type },
	): Promise<{ success: boolean; message: string }> => {
		const url = `${baseUrl}/api/v1/patch-missing-ohlc?timeframe=${timeframe}&type=${type}`;

		if (!baseUrl || !authToken) {
			return { success: false, message: "Configuration error" };
		}

		const message = await fetch(url, {
			method: "GET",
			headers: {
				Authorization: authToken,
			},
		});

		return { success: true, message: await message.text() };
	},
});

export const fetchOHLCData = internalAction({
	args: {
		type: v.union(v.literal("index"), v.literal("stock")),
		symbol: v.string(),
		timeframe: ohlcTimeframe,
	},
	handler: async (
		_ctx,
		{ timeframe, symbol, type },
	): Promise<{ success: boolean; message: string }> => {
		const upperSymbol = type === "stock" ? symbol.toUpperCase() : symbol;
		const url = `${baseUrl}/api/v1/update-ohlc?timeframe=${timeframe}&symbol=${upperSymbol}`;

		if (!baseUrl || !authToken) {
			return { success: false, message: "Configuration error" };
		}

		const message = await fetch(url, {
			method: "GET",
			headers: {
				Authorization: authToken,
			},
		});

		return { success: true, message: await message.text() };
	},
});

export const get = query({
	args: {
		symbol: v.string(),
		timeframe: ohlcTimeframe,
	},
	handler: async (ctx, { symbol, timeframe }) => {
		const data = await ctx.db
			.query("ohlc")
			.withIndex("by_symbol_timeframe", (q) =>
				q.eq("symbol", symbol).eq("timeframe", timeframe),
			)
			.order("desc")
			.collect();

		if (!data) {
			return {
				symbol,
				timeframe,
				t: [],
				c: [],
				o: [],
				h: [],
				l: [],
				v: [],
				lastFinalizedTime: 0,
			};
		}

		return data;
	},
});

export const getFinalizedTime = query({
	args: {
		symbol: v.string(),
		timeframe: ohlcTimeframe,
	},
	handler: async (ctx, { symbol, timeframe }) => {
		const data = await ctx.db
			.query("ohlc")
			.withIndex("by_symbol_timeframe", (q) =>
				q.eq("symbol", symbol).eq("timeframe", timeframe),
			)
			.order("desc")
			.first();
		if (!data) {
			return 0;
		}
		return data.lastFinalizedTime || 0;
	},
});

export const upsertOHLCData = mutation({
	args: {
		symbol: v.string(),
		timeframe: ohlcTimeframe,
		data: v.array(
			v.object({
				t: v.number(),
				c: v.number(),
				o: v.number(),
				h: v.number(),
				l: v.number(),
				v: v.number(),
				s: v.optional(v.string()), //sometime some apis return status // just ignore it
			}),
		),
		lastFinalizedTime: v.number(),
	},
	handler: async (ctx, args) => {
		console.log(
			`Upserting OHLC data for ${args.symbol} in timeframe ${args.timeframe} with ${args.data.length} data points.`,
		);

		// Check if OHLC data already exists for this symbol and timeframe
		const existing = await ctx.db
			.query("ohlc")
			.withIndex("by_symbol_timeframe", (q) =>
				q.eq("symbol", args.symbol).eq("timeframe", args.timeframe),
			)
			.first();

		const newT = args.data.map((d) => d.t);
		const newC = args.data.map((d) => d.c);
		const newO = args.data.map((d) => d.o);
		const newH = args.data.map((d) => d.h);
		const newL = args.data.map((d) => d.l);
		const newV = args.data.map((d) => d.v);

		if (existing) {
			// Append new data to existing arrays using concat() for better performance
			await ctx.db.patch(existing._id, {
				t: existing.t.concat(newT),
				c: (existing.c || []).concat(newC),
				o: (existing.o || []).concat(newO),
				h: (existing.h || []).concat(newH),
				l: (existing.l || []).concat(newL),
				v: (existing.v || []).concat(newV),
				lastFinalizedTime: args.lastFinalizedTime,
			});
		} else {
			// Insert new record
			await ctx.db.insert("ohlc", {
				symbol: args.symbol,
				timeframe: args.timeframe,
				t: newT,
				c: newC,
				o: newO,
				h: newH,
				l: newL,
				v: newV,
				lastFinalizedTime: args.lastFinalizedTime,
			});
		}
	},
});
