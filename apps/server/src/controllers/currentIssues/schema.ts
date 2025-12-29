import z from "@nepse-dashboard/zod";

export const ipoStatus = z.union([
	z.literal("Open"),
	z.literal("Closed"),
	z.literal("Nearing"),
]);

export const ipoType = z.union([
	z.literal("local"),
	z.literal("ordinary"),
	z.literal("Migrant Workers"),
]);

// ---------- IPO Item Schema ----------
export const allIssuesSchema = z.object({
	companyName: z.string(),
	shareType: ipoType,
	pricePerUnit: z.string(),
	units: z.string(),
	openingDateAD: z.string(),
	openingDateBS: z.string(),
	closingDateAD: z.string(),
	closingDateBS: z.string(),
	closingDateClosingTime: z.string(),
	status: ipoStatus,
	shareRegistrar: z.string(),
	stockSymbol: z.string(),
});

export const allIssuesArraySchema = z.array(allIssuesSchema);

export type AllIssues = z.infer<typeof allIssuesSchema>;

export const CDSTableRowSchema = z.object({
	companyName: z.string(),
	issueManager: z.string(),
	issuedUnit: z.string(),
	numberOfApplication: z.string(),
	appliedUnit: z.string(),
	amount: z.string(),
	openDate: z.string(),
	closeDate: z.string(),
	lastUpdate: z.string(),
});

export type CDSTableRow = z.infer<typeof CDSTableRowSchema>;
