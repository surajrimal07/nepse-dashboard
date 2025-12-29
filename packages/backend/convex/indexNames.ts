import { v } from "convex/values";
import { query } from "./_generated/server";
import { indexKeys } from "./utils/types";

export const getAllIndexNames = query({
	handler: async (ctx) => {
		return await ctx.db.query("indexNames").collect();
	},
});

export const searchIndexes = query({
	args: {
		search: v.optional(v.string()),
		exclude: v.optional(v.array(indexKeys)),
	},
	handler: async (ctx, args) => {
		const search = args.search;
		

		if (!search) {
			const data = await ctx.db.query("indexNames").collect();
			return data.filter((doc) => !args.exclude?.includes(doc.index));
		}

		const results = await ctx.db
			.query("indexNames")
			.withSearchIndex("search_index_name", (q) => q.search("index", search))
			.collect();

		return results.filter((doc) => !args.exclude?.includes(doc.index));
	},
});
