// import z from "@nepse-dashboard/zod";

// import { indexKeySchema } from "./indexes-type";
// import { OrderRequestSchema } from "./odd-types";
// import { RateLimitSchema } from "./rate-limit-types";
// import { SOCKET_ROOMS_ENUM } from "./socket-type";

// export const SocketMessage = z.object({
// 	event: SOCKET_ROOMS_ENUM,
// 	data: z.any().optional().nullable(), // any here since we don't know the structure of the data
// 	requestId: z.string().optional().nullable(),
// 	rateLimit: RateLimitSchema.optional().nullable(),
// });

// export type SocketMessage = z.infer<typeof SocketMessage>;

// export const SocketRequestTypeConst = {
// 	sendData: "sendData", // send data to client
// 	requestData: "requestData", // request data from server
// 	isConsumeAvailable: "isConsumeAvailable", // check if consume is available
// 	subscribe: "subscribe", // subscribe to a room
// 	unsubscribe: "unsubscribe", // unsubscribe from a room
// 	ping: "ping", // ping the server
// 	oddLot: "oddLot", // added oddLot request type
// } as const;

// export const SocketRequestTypeEnum = z.enum(
// 	Object.values(SocketRequestTypeConst),
// );

// export type SocketRequestType = z.infer<typeof SocketRequestTypeEnum>;

// export const newsContentSchema = z.object({
// 	site: z.string().optional(), // News site name
// 	title: z.string().optional(), // News title
// 	content: z.string().optional(), // News content
// 	url: z.string().optional(), // URL of the news article
// 	lang: z.string().optional(), // Language of the news article
// });

// export const SocketRequestSchema = z.object({
// 	requestId: z.string().optional(),
// 	type: SocketRequestTypeEnum,
// 	room: z.array(SOCKET_ROOMS_ENUM).optional(),
// 	indexCharts: z.array(indexKeySchema).optional(),
// 	stockCharts: z.array(z.string()).optional(),
// 	marketDepthStocks: z.array(z.string()).optional(),
// 	stockInfo: z.string().optional(),
// 	screenshot: z.string().optional(),
// 	userToken: z.string().optional(),
// 	data: z.any().optional(), // any here since we don't know the structure of the data
// 	oddLot: OrderRequestSchema.optional(),
// 	gcmId: z.string().optional(), // GCM ID for push notifications
// 	newsContent: newsContentSchema.optional(), // News content for parsing
// });

// export type SocketRequest = z.infer<typeof SocketRequestSchema>;

// export const SocketResponse = z.object({
// 	event: SOCKET_ROOMS_ENUM,
// 	data: z.any(),
// 	timestamp: z.number(),
// 	requestId: z.string().optional(),
// });

// export type SocketResponse = z.infer<typeof SocketResponse>;
