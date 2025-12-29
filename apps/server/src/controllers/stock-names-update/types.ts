import z from "@nepse-dashboard/zod";

const CompanyStatusSchema = z.enum(["A", "D", "S"]);

const SectorNameSchema = z.enum([
	"Commercial Banks",
	"Hotels And Tourism",
	"Others",
	"Hydro Power",
	"Tradings",
	"Development Banks",
	"Microfinance",
	"Non Life Insurance",
	"Life Insurance",
	"Manufacturing And Processing",
	"Finance",
	"Investment",
	"Mutual Fund",
]);

const InstrumentTypeSchema = z.enum([
	"Equity",
	"Mutual Funds",
	"Preference Shares",
	"Non-Convertible Debentures",
]);

const CompanySchema = z.object({
	symbol: z.string().min(1),
	securityName: z.string().min(1),
	status: CompanyStatusSchema,
	instrumentType: InstrumentTypeSchema,
});

export const CompanyListSchema = z.array(CompanySchema);
