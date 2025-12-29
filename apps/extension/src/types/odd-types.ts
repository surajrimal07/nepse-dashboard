import z from "@nepse-dashboard/zod";

export const tabsTypeValues = {
	ALL: "all",
	MY: "my",
} as const;
export const TabsTypeSchema = z.enum([tabsTypeValues.ALL, tabsTypeValues.MY]);
export type TabsType = z.infer<typeof TabsTypeSchema>;

export const OddLotType = {
	ADD: "add",
	MODIFY: "modify",
	ALL: "all",
	MY: "my",
	REQUEST_COMPLETION: "request_completion",
	UPDATE_COMPLETION_STATUS: "update_completion_status",
	GET_COMPLETION: "get_completions",
	NOTIFICATION: "notification",
} as const;

export const OddLotTypeSchema = z.enum(Object.values(OddLotType));
export type OddLotType = z.infer<typeof OddLotTypeSchema>;

export const OddLotOrderSideConst = {
	BUY: "buy",
	SELL: "sell",
} as const;

export const OddLotOrderSideSchema = z.enum(
	Object.values(OddLotOrderSideConst),
);
export type OddLotOrderSide = z.infer<typeof OddLotOrderSideSchema>;

export const OddLotOrderStatusConst = {
	OPEN: "open",
	COMPLETED: "completed",
	DELETED: "deleted",
} as const;
export const OddLotOrderStatusSchema = z.enum(
	Object.values(OddLotOrderStatusConst),
);
export type OddLotOrderStatus = z.infer<typeof OddLotOrderStatusSchema>;

export const OddlotSchema = z.object({
	user_id: z.string(),
	id: z.string(),
	stock_symbol: z.string(),
	quantity: z.number(),
	price: z.number(),
	status: OddLotOrderStatusSchema,
	order_type: OddLotOrderSideSchema,
	created_at: z.string(),
});
export type Oddlot = z.infer<typeof OddlotSchema>;

export const OddlotResponseSchema = z.object({
	type: OddLotTypeSchema,
	data: z.any().optional(),
	success: z.boolean().optional(),
	message: z.string().nullable().optional(),
});
export type OddlotResponse = z.infer<typeof OddlotResponseSchema>;

export const CompletionsStatusConst = {
	PENDING: "pending",
	COMPLETED: "completed",
	REJECTED: "rejected",
	DELETED: "deleted",
} as const;
export const CompletionsStatusSchema = z.enum(
	Object.values(CompletionsStatusConst),
);
export type CompletionsStatus = z.infer<typeof CompletionsStatusSchema>;

export const CompletionsOrdersSchema = z.object({
	id: z.string(),
	order_id: z.string(),
	requester_user_id: z.string(), // User Y
	message: z.string().nullable(),
	order_owner_user_id: z.string(), // OP
	status: CompletionsStatusSchema,
	created_at: z.string(), // As requested
	updated_at: z.string(), // As requested
});
export type CompletionsOrders = z.infer<typeof CompletionsOrdersSchema>;

export const OddLotResponseSchema = z.discriminatedUnion("type", [
	z.object({
		// done
		type: z.literal(OddLotType.ALL),
		success: z.boolean(),
		data: z.array(OddlotSchema).optional().nullable(),
		message: z.string().nullable().optional(),
	}),
	z.object({
		// done
		type: z.literal(OddLotType.MY),
		success: z.boolean(),
		data: z
			.union([OddlotSchema, z.array(OddlotSchema), z.null()])
			.optional()
			.nullable(),
		message: z.string().nullable().optional(),
	}),
	z.object({
		// done
		type: z.literal(OddLotType.ADD),
		success: z.boolean().optional().nullable(),
		data: OddlotSchema.optional().nullable(),
		message: z.string().nullable().optional(),
	}),
	z.object({
		// done
		type: z.literal(OddLotType.MODIFY),
		success: z.boolean(),
		data: OddlotSchema.optional().nullable(),
		message: z.string().nullable().optional(),
	}),
	z.object({
		// done
		type: z.literal(OddLotType.NOTIFICATION),
		success: z.boolean(),
		data: z.string().optional(),
	}),
	z.object({
		// done
		type: z.literal(OddLotType.GET_COMPLETION),
		success: z.boolean(),
		data: z.array(CompletionsOrdersSchema).optional().nullable(),
		message: z.string().nullable().optional(),
	}),
	z.object({
		// done
		type: z.literal(OddLotType.REQUEST_COMPLETION),
		success: z.boolean(), // seems to lack data
		message: z.string().nullable().optional(),
	}),
	z.object({
		// done
		type: z.literal(OddLotType.UPDATE_COMPLETION_STATUS),
		success: z.boolean(),
		data: OddlotSchema.optional().nullable(),
		message: z.string().nullable().optional(),
	}),
]);
export type OddLotResponse = z.infer<typeof OddLotResponseSchema>;

// client side schemas for odd lot requests
export const AddOrderSchema = z.object({
	stock_symbol: z.string().min(1, "Stock symbol is required"),
	quantity: z.number().positive("Quantity must be positive"),
	price: z.number().positive("Price must be positive"),
	order_type: OddLotOrderSideSchema,
});

export const ModifyOrderSchema = z.object({
	order_id: z.string().min(1, "Order ID is required"),
	updates: z.object({
		quantity: z.number().positive("Quantity must be positive").optional(),
		price: z.number().positive("Price must be positive").optional(),
		order_type: OddLotOrderSideSchema.optional(),
		status: OddLotOrderStatusSchema.optional(),
	}),
});

export const GetAllOrdersSchema = z.object({
	limit: z.number().positive("Limit must be positive").optional(),
});

export const RequestCompletionSchema = z.object({
	id: z.string().min(1, "Order ID is required"),
	message: z.string().optional(),
});

export const UpdateCompletionStatusSchema = z.object({
	completion_id: z.string().min(1, "Completion ID is required"),
	order_id: z.string().min(1, "Order ID is required"),
	status: CompletionsStatusSchema,
});

export const OrderRequestSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("add"),
		data: AddOrderSchema,
	}),
	z.object({
		type: z.literal("modify"),
		data: ModifyOrderSchema,
	}),
	z.object({
		type: z.literal("all"),
		data: GetAllOrdersSchema,
	}),
	z.object({
		type: z.literal("my"),
	}),
	z.object({
		type: z.literal("request_completion"),
		data: RequestCompletionSchema,
	}),
	z.object({
		type: z.literal("update_completion_status"),
		data: UpdateCompletionStatusSchema,
	}),
	z.object({
		type: z.literal("get_completions"),
		// data: GetCompletionsSchema, // No specific data needed for this variant
	}),
]);
