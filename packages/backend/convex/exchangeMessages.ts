import { v } from "convex/values";
import { internalAction, mutation, query } from "./_generated/server";
import { createNotification } from "./notification";

const baseUrl = process.env.BACKEND_URL;
const authToken = process.env.BACKEND_TOKEN;

export const getAll = query({
	handler: async (ctx) => {
		return await ctx.db
			.query("exchangeMessages")
			.withIndex("by_id")
			.order("desc")
			.collect();
	},
});

export const fetchDisclosure = internalAction({
	args: {},
	handler: async (_): Promise<{ success: boolean; message: string }> => {
		if (!baseUrl || !authToken) {
			return { success: false, message: "Configuration error" };
		}

		const url = `${baseUrl}/api/v1/disclosure`;

		const message = await fetch(url, {
			method: "GET",
			headers: {
				Authorization: authToken,
			},
		});

		return { success: true, message: await message.text() };
	},
});

export const addExchangeMessages = mutation({
	args: {
		items: v.array(
			v.object({
				id: v.number(),
				messageTitle: v.string(),
				messageBody: v.string(), // plain text
				encryptedId: v.union(v.string(), v.null()),
				filePath: v.union(v.string(), v.null()),
				addedDate: v.union(v.string(), v.null()),
				modifiedDate: v.union(v.string(), v.null()),
			}),
		),
	},
	handler: async (ctx, args) => {
		for (const exchangeMessages of args.items) {
			// no check, just insert, check is done by the backend already
			await ctx.db.insert("exchangeMessages", exchangeMessages);

			await createNotification(ctx, {
				title: "New Exchange Message",
				body: exchangeMessages.messageTitle,
				variant: "info",
			});
		}
	},
});
