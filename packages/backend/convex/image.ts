"use node";

import { createHash } from "node:crypto";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

export const createMD5Hash = (input: string): string => {
	const hash = createHash("md5");
	hash.update(input);
	return hash.digest("hex");
};

export const getProfile = internalAction({
	args: {
		email: v.string(),
	},
	handler: async (ctx, args) => {
		const md5Hash = createMD5Hash(args.email.trim().toLowerCase());

		await ctx.runMutation(internal.users.updateProfilePicture, {
			imageUrl: `https://www.gravatar.com/avatar/${md5Hash}?d=identicon`,
			email: args.email,
		});
	},
});
