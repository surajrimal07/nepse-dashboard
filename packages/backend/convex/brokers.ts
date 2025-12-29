import { ConvexError, v } from "convex/values";
import { internalAction, mutation, query } from "./_generated/server";

const baseUrl = process.env.BACKEND_URL;
const authToken = process.env.BACKEND_TOKEN;

//fetch brokers list from https://sebon.gov.np/intermediaries/stock-brokers?skey=&e=1

export const getBrokers = query({
	handler: async (ctx) => {
		return await ctx.db.query("brokers").collect();
	},
});

export const updateBrokersAndDP = internalAction({
	handler: async () => {
		if (!baseUrl || !authToken) {
			throw new ConvexError("BACKEND_URL or BACKEND_TOKEN is not set");
		}
		const url = `${baseUrl}/api/v1/brokers`;

		await fetch(url, {
			method: "GET",
			headers: {
				Authorization: authToken,
			},
		});
	},
});

export const insertBrokers = mutation({
	args: {
		brokers: v.array(
			v.object({
				broker_name: v.string(),
				broker_number: v.number(),
				broker_address: v.string(),
				broker_phone: v.optional(v.string()),
				broker_email: v.optional(v.string()),
				broker_website: v.optional(v.string()),
				tms_link: v.optional(v.string()),
			}),
		),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db.query("brokers").collect();

		for (const broker of args.brokers) {
			const existingBroker = existing.find(
				(e) => e.broker_number === broker.broker_number,
			);

			if (!existingBroker) {
				await ctx.db.insert("brokers", broker);
			} else {
				await ctx.db.patch(existingBroker._id, {
					broker_name: broker.broker_name,
					broker_address: broker.broker_address,
					broker_phone: broker.broker_phone,
					broker_email: broker.broker_email,
					broker_website: broker.broker_website,
					tms_link: broker.tms_link,
				});
			}
		}
	},
});

export const insertDP = mutation({
	args: {
		dps: v.array(
			v.object({
				dpid: v.number(),
				name: v.string(),
				address: v.string(),
				phone: v.union(v.string(), v.array(v.string())),
				email: v.optional(v.union(v.string(), v.array(v.string()))),
			}),
		),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db.query("dp").collect();

		for (const dp of args.dps) {
			const existingDp = existing.find((e) => e.dpid === dp.dpid);

			if (!existingDp) {
				await ctx.db.insert("dp", dp);
			} else {
				await ctx.db.patch(existingDp._id, {
					name: dp.name,
					address: dp.address,
					phone: dp.phone,
					email: dp.email,
				});
			}
		}
	},
});

export const getBrokerByName = query({
	args: {
		name: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("brokers")
			.withIndex("by_broker_name", (q) => q.eq("broker_name", args.name))
			.unique();
	},
});

export const getBrokerById = query({
	args: {
		id: v.number(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("brokers")
			.withIndex("by_broker_number", (q) => q.eq("broker_number", args.id))
			.unique();
	},
});

export const getDP = query({
	handler: async (ctx) => {
		return await ctx.db.query("dp").collect();
	},
});

export const getDPById = query({
	args: {
		id: v.number(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("dp")
			.withIndex("by_dpid", (q) => q.eq("dpid", args.id))
			.unique();
	},
});

export const getDPByName = query({
	args: {
		name: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("dp")
			.withIndex("by_name", (q) => q.eq("name", args.name))
			.unique();
	},
});
