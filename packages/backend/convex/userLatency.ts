import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";

export const get = mutation({
	args: { time: v.number(), location: v.string(), randomId: v.string() },
	handler: async (ctx, args) => {
		const now = Date.now();
		const newLatency = now - args.time;
		const userId = args.randomId;

		// ----------------------------
		// 1. Update stats (O(1) read + write)
		// ----------------------------
		const stats = await ctx.db
			.query("userLatencyStats")
			.withIndex("by_randomId", (q) => q.eq("randomId", userId))
			.unique();

		if (stats) {
			await ctx.db.patch(stats._id, {
				sum: stats.sum + newLatency,
				count: stats.count + 1,
			});
		} else {
			await ctx.db.insert("userLatencyStats", {
				randomId: userId,
				sum: newLatency,
				count: 1,
			});
		}

		// ----------------------------
		// 2. Insert raw sample (fast)
		// ----------------------------
		await ctx.db.insert("userLatency", {
			location: args.location,
			latency: newLatency,
			randomId: userId,
		});

		// ----------------------------
		// 3. Trim old samples (keep newest 200)
		// ----------------------------
		const samples = await ctx.db
			.query("userLatency")
			.withIndex("by_randomId", (q) => q.eq("randomId", userId))
			.order("desc")
			.collect();

		if (samples.length > 100) {
			const toDelete = samples.slice(100); // oldest ones
			for (const entry of toDelete) {
				await ctx.db.delete(entry._id);
			}
		}

		// ----------------------------
		// 4. Return data
		// ----------------------------
		return {
			latency: stats ? Math.trunc(stats.sum / stats.count) : newLatency,
		};
	},
});

export const save = internalMutation({
	args: {
		latency: v.number(),
		location: v.string(),
		randomId: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("userLatency", {
			location: args.location,
			latency: args.latency,
			randomId: args.randomId,
		});
	},
});
