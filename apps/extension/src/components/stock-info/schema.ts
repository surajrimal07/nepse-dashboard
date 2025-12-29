import z from "@nepse-dashboard/zod";

export const companyDetailsSearchSchema = z.object({
	symbol: z.string().min(1),
});
