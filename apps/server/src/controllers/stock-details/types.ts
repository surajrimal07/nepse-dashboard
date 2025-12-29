import z from '@nepse-dashboard/zod';

export const SingleCompanySchema = z.object({
  symbol: z.string(),
  totalTrades: z.number().transform((val) => val ?? 0),
  totalTradeQuantity: z.number().transform((val) => val ?? 0),
  lastTradedPrice: z
    .number()
    .nullable()
    .transform((val) => val ?? 0),
  fiftyTwoWeekHigh: z
    .number()
    .nullable()
    .transform((val) => val ?? 0),
  fiftyTwoWeekLow: z
    .number()
    .nullable()
    .transform((val) => val ?? 0),
  lastUpdatedDateTime: z.string().transform((val) => val || 'N/A'),
  listingDate: z.string().transform((val) => val || 'N/A'),
  companyName: z.string().transform((val) => val || 'N/A'),
  email: z.string().transform((val) => val || 'N/A'),
  companyWebsite: z
    .string()
    .nullable()
    .transform((val) => val || 'N/A'),
  companyContactPerson: z.string().transform((val) => val || 'N/A'),
  stockListedShares: z
    .string()
    .nullable()
    .transform((val) => val ?? 'N/A'),
  paidUpCapital: z
    .string()
    .nullable()
    .transform((val) => val ?? 'N/A'),
  issuedCapital: z
    .string()
    .nullable()
    .transform((val) => val ?? 'N/A'),
  marketCapitalization: z
    .string()
    .nullable()
    .transform((val) => val ?? 'N/A'),
  publicShares: z
    .string()
    .nullable()
    .transform((val) => val ?? 'N/A'),
  publicPercentage: z
    .number()
    .nullable()
    .transform((val) => val ?? 0),
  promoterShares: z
    .string()
    .nullable()
    .transform((val) => val ?? 'N/A'),
  promoterPercentage: z
    .number()
    .nullable()
    .transform((val) => val ?? 0),
  faceValue: z
    .number()
    .nullable()
    .transform((val) => val ?? 0),
  tradingStartDate: z
    .string()
    .nullable()
    .transform((val) => val || 'N/A'),
});

export type CompanyData = z.infer<typeof SingleCompanySchema>;
