import z from "@nepse-dashboard/zod";

export enum MarketStates {
	OPEN = "Open",
	CLOSE = "Close",
	PRE_OPEN = "Pre Open",
	PRE_CLOSE = "Pre Close",
}

export const MarketStatesSchema = z.object({
	state: z.enum(MarketStates),
	isOpen: z.boolean(),
	version: z.number(),
});

export type MarketStatus = z.infer<typeof MarketStatesSchema>;
