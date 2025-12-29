/** biome-ignore-all lint/style/noNonNullAssertion: <expected> */
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { resend } from "./email";

const http = httpRouter();

http.route({
	path: "/resend-webhook",
	method: "POST",
	handler: httpAction(async (ctx, req) => {
		return await resend.handleResendEventWebhook(ctx, req);
	}),
});

http.route({
	path: "/status",
	method: "GET",
	handler: httpAction(async (ctx, req) => {
		return new Response("Hello, world!", { status: 200 });
	}),
});

export default http;
