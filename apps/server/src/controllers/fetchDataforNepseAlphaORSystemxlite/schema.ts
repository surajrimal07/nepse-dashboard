import z from "@nepse-dashboard/zod";

export const ohlcApiSchema = z.object({
	s: z.string(), // status, e.g. "ok"
	t: z.array(z.number()).min(1), // timestamps (at least 1)
	c: z.array(z.number()).min(1), // closes (at least 1)
	o: z.array(z.number()).min(1), // opens (at least 1)
	h: z.array(z.number()).min(1), // highs (at least 1)
	l: z.array(z.number()).min(1), // lows (at least 1)
	v: z.array(z.number()).min(1), // volumes (at least 1)
});

export type response = {
	success: boolean;
	message: string;
};
