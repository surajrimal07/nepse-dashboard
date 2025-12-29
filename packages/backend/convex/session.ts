// import type { Id } from "./_generated/dataModel";
// import { query } from "./_generated/server";
// import { betterAuthComponent } from "./auth";
// import { createAuth } from "./createAuth";

// // Example: using the getSession method in a Convex query

// // const getUserId = async (ctx: GenericCtx) => {
// // 	const identity = await ctx.auth.getUserIdentity();
// // 	if (!identity) {
// // 		return null;
// // 	}
// // 	return identity.subject as Id<"users">;
// // };

// export const islogged = query({
// 	args: {},
// 	handler: async (ctx) => {
// 		const identity = await ctx.auth.getUserIdentity();

// 		console.log(identity);

// 		if (!identity) {
// 			return null;
// 		}
// 		return identity.subject as Id<"users">;
// 	},
// });

// export const getSession = query({
// 	args: {},
// 	handler: async (ctx) => {
// 		const auth = createAuth(ctx);

// 		// For auth.api methods that require a session (such as
// 		// getSession()), you can use the getHeaders method to
// 		// get a headers object
// 		const headers = await betterAuthComponent.getHeaders(ctx);

// 		console.log(headers);

// 		const session = await auth.api.getSession({
// 			headers,
// 		});
// 		if (!session) {
// 			return null;
// 		}
// 		// Do something with the session
// 		return session;
// 	},
// });
