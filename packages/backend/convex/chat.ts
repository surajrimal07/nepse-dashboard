import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const createChat = mutation({
	args: {
		linkedArticleUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const result = await ctx.db.insert("chats", {
			title: "Unnamed Chat",
			deleted: false,
			updatedAt: Date.now(),
			linkedArticleUrl: args.linkedArticleUrl,
		});
		return result;
	},
});

export const addUserToChat = mutation({
	args: {
		userId: v.string(),
		chatId: v.id("chats"),
	},
	handler: async (ctx, { userId, chatId }) => {
		const chat = await ctx.db.get(chatId);
		if (!chat) throw new Error("Chat not found");

		const user = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", userId))
			.unique();

		if (!user) {
			throw new Error("User not found");
		}

		await ctx.db.patch(chat._id, { userId: user._id });
	},
});

export const renameChat = mutation({
	args: { _id: v.id("chats"), title: v.string() },
	handler: async (ctx, { _id, title }) => {
		const chat = await ctx.db.get(_id);
		if (!chat || chat.deleted) return;

		await ctx.db.patch(chat._id, { title });
	},
});

export const getChats = query({
	args: {
		email: v.optional(v.string()),
	},
	handler: async (ctx, { email }) => {
		if (!email) {
			return [];
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", email))
			.unique();

		if (!user) {
			return [];
		}

		const chats = await ctx.db
			.query("chats")
			.withIndex("by_userId_updated", (q) =>
				q.eq("userId", user._id).eq("deleted", false),
			)
			.order("desc")
			.collect();

		return chats.map((chat) => ({
			_id: chat._id,
			title: chat.title,
			updatedAt: chat.updatedAt,
		}));
	},
});

export const getTitle = query({
	args: { _id: v.id("chats") },
	handler: async (ctx, { _id }) => {
		const chat = await ctx.db.get(_id);
		return chat?.title ?? "Unnamed Chat";
	},
});

export const deleteChat = mutation({
	args: { _id: v.id("chats") },
	handler: async (ctx, { _id }) => {
		const chat = await ctx.db.get(_id);

		if (!chat || chat.deleted) return;

		await ctx.db.patch(chat._id, { deleted: true });
	},
});

// Messages
export const createMessage = mutation({
	args: {
		chatId: v.id("chats"),
		content: v.any(),
	},
	handler: async (ctx, { chatId, content }) => {
		const chat = await ctx.db.get(chatId);

		if (!chat) throw new Error("Chat not found");

		await Promise.all([
			ctx.db.insert("messages", {
				chatId: chat._id,
				content,
				deleted: false,
			}),
			ctx.db.patch(chat._id, { updatedAt: Date.now() }),
		]);
	},
});

export const createCheckpoint = mutation({
	args: {
		chatId: v.id("chats"),
		messageIndex: v.number(),
	},
	handler: async (ctx, { chatId, messageIndex }) => {
		const chat = await ctx.db.get(chatId);

		if (!chat) throw new Error("Chat not found");

		await ctx.db.insert("messagecheckpoints", {
			chatId: chat._id,
			messageIndex,
		});
	},
});

export const restoreCheckpoint = mutation({
	args: {
		chatId: v.id("chats"),
		messageIndex: v.number(),
	},
	handler: async (ctx, { chatId, messageIndex }) => {
		const chat = await ctx.db.get(chatId);

		if (!chat) throw new Error("Chat not found");

		// Get all non-deleted messages for the chat in order
		const messages = await ctx.db
			.query("messages")
			.withIndex("byChatId_deleted", (q) =>
				q.eq("chatId", chat._id).eq("deleted", false),
			)
			.order("asc")
			.collect();

		// Soft delete messages after messageIndex (keep messages from 0 to messageIndex inclusive)
		// messageIndex is 0-based, so if messageIndex is 2, keep messages at indices 0, 1, 2
		for (let i = messageIndex + 1; i < messages.length; i++) {
			await ctx.db.patch(messages[i]._id, { deleted: true });
		}

		// Delete all checkpoints with index greater than OR EQUAL to messageIndex
		// This removes the current checkpoint and all future ones
		const checkpoints = await ctx.db
			.query("messagecheckpoints")
			.withIndex("byChatId", (q) => q.eq("chatId", chat._id))
			.order("asc")
			.collect();

		for (const checkpoint of checkpoints) {
			if (checkpoint.messageIndex >= messageIndex) {
				await ctx.db.delete(checkpoint._id);
			}
		}

		// Update chat's updatedAt timestamp
		await ctx.db.patch(chat._id, { updatedAt: Date.now() });
	},
});

export const getCheckpoint = query({
	args: {
		chatId: v.id("chats"),
	},
	handler: async (ctx, { chatId }) => {
		const chat = await ctx.db.get(chatId);

		if (!chat) throw new Error("Chat not found");

		const checkpoints = await ctx.db
			.query("messagecheckpoints")
			.withIndex("byChatId", (q) => q.eq("chatId", chat._id))
			.order("asc")
			.collect();

		if (!checkpoints) {
			return [];
		}

		return checkpoints;
	},
});

export const removeCheckpoint = mutation({
	args: { _id: v.id("messagecheckpoints") },
	handler: async (ctx, { _id }) => {
		const checkpoint = await ctx.db.get(_id);
		if (!checkpoint) return;
		await ctx.db.delete(checkpoint._id);
	},
});

export const getTotalTokens = query({
	args: { chatId: v.id("chats") },
	handler: async (ctx, { chatId }) => {
		const messages = await ctx.db
			.query("messages")
			.withIndex("byChatId_deleted", (q) =>
				q.eq("chatId", chatId).eq("deleted", false),
			)
			.collect();

		let totalTokens = 0;
		for (const message of messages) {
			if (message.content?.metadata?.totalTokens) {
				totalTokens += message.content.metadata.totalTokens;
			}
		}
		return totalTokens;
	},
});

export const getAllTokens = query({
	args: { email: v.optional(v.string()) },
	handler: async (ctx, { email }) => {
		if (!email) {
			return 0;
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", email))
			.unique();

		if (!user) {
			return 0;
		}

		const chats = await ctx.db
			.query("chats")
			.withIndex("by_userId_updated", (q) =>
				q.eq("userId", user._id).eq("deleted", false),
			)
			.collect();

		if (chats.length === 0) {
			return 0;
		}

		let totalTokens = 0;

		for (const chat of chats) {
			// Include ALL messages (deleted and non-deleted) for accurate token accounting
			const messages = await ctx.db
				.query("messages")
				.withIndex("byChatId", (q) => q.eq("chatId", chat._id))
				.collect();

			for (const message of messages) {
				if (message.content?.metadata?.totalTokens) {
					totalTokens += message.content.metadata.totalTokens;
				}
			}
		}

		return totalTokens;
	},
});

export const loadChat = query({
	args: { _id: v.id("chats"), limit: v.optional(v.number()) },
	handler: async (ctx, { _id, limit }) => {
		const chat = await ctx.db.get(_id);

		if (!chat || chat.deleted) return [];

		const query = ctx.db
			.query("messages")
			.withIndex("byChatId_deleted", (q) =>
				q.eq("chatId", chat._id).eq("deleted", false),
			)
			.order("asc");

		const messages = await (limit ? query.take(limit) : query.collect());

		return messages.map((m) => m.content);
	},
});

//clear all empty chats
export const clearEmptyChats = internalMutation({
	handler: async (ctx) => {
		const chats = await ctx.db.query("chats").collect();
		for (const chat of chats) {
			const messages = await ctx.db
				.query("messages")
				.withIndex("byChatId_deleted", (q) =>
					q.eq("chatId", chat._id).eq("deleted", false),
				)
				.collect();
			if (messages.length === 0) {
				await ctx.db.delete(chat._id);
			}
		}
	},
});
