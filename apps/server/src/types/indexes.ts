import z from "@nepse-dashboard/zod";

export const nepseIndexes = [
	"Banking SubIndex",
	"Development Bank Ind.",
	"Finance Index",
	"Hotels And Tourism",
	"HydroPower Index",
	"Investment",
	"Life Insurance",
	"Manufacturing And Pr.",
	"Microfinance Index",
	"Mutual Fund",
	"NEPSE Index",
	"Non Life Insurance",
	"Others Index",
	"Trading Index",
] as const;

export const indexKeySchema = z.enum([
	"Banking SubIndex",
	"Development Bank Ind.",
	"Finance Index",
	"Hotels And Tourism",
	"HydroPower Index",
	"Investment",
	"Life Insurance",
	"Manufacturing And Pr.",
	"Microfinance Index",
	"Mutual Fund",
	"NEPSE Index",
	"Non Life Insurance",
	"Others Index",
	"Trading Index",
]);

export type IndexKey = z.infer<typeof indexKeySchema>;

// export const indexKeySchemaWithoutNEPSE = z.enum(
// 	indexKeySchema.options.filter((key) => key !== "NEPSE Index") as [
// 		string,
// 		...string[],
// 	],
// );

// export type IndexKeyWithoutNEPSE = z.infer<typeof indexKeySchemaWithoutNEPSE>;
