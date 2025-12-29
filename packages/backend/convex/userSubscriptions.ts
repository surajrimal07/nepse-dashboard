// import { v } from "convex/values";
// import { internalMutation, mutation, query } from "./_generated/server";

// export const get = query({
// 	handler: async (ctx) => {
// 		//do auth check later
// 		return await ctx.db.query("userSubscriptions").collect();
// 	},
// });

// // export const add = internalMutation({
// // 	args: {
// // 		user_id: v.id("users"),
// // 		pricing_option_id: v.id("pricingOptions"),
// // 		tier: v.id("subscriptionPlans"),
// // 	},
// // 	handler: async (ctx, args) => {
// // 		const now = Date.now();
// // 		const duration = await ctx.db.get(args.tier);
// // 		const expiresAt = duration + now;

// // 		const subscriptionId = await ctx.db.insert("userSubscriptions", {
// // 			...args,
// // 			created_at: Date.now(),
// // 			updated_at: Date.now(),
// // 			expires_at: null,
// // 		});
// // 		return await ctx.db.get(subscriptionId);
// // 	},
// // });

// export const update = mutation({
// 	args: {
// 		id: v.id("userSubscriptions"),
// 		is_active: v.boolean(),
// 		expires_at: v.number(),
// 		created_at: v.number(),
// 		updated_at: v.number(),
// 		pricing_option_id: v.id("pricingOptions"),
// 		tier: v.id("subscriptionPlans"),
// 	},
// 	handler: async (ctx, args) => {
// 		await ctx.db.patch(args.id, args);
// 		return await ctx.db.get(args.id);
// 	},
// });
