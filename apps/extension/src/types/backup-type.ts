import z from '@nepse-dashboard/zod'
import { AISettingsSchema, LLMConfigSchema } from '@/types/ai-types'
import { AccountSchema, accountType } from './account-types'

export const BackupDataSchema = z.object({
  // ===== ACCOUNT STATE =====
  accounts: z.array(AccountSchema),
  dashboardState: z.any(),
  sidepanelRoute: z.any(),
  generalState: z.any(),

  // ===== THEME / UI STATE =====
  theme: z.string(),
  stockScrolling: z.boolean(),
  stockScrollingInSidepanel: z.boolean(),
  notification: z.boolean(),
  //
  searchMode: z.string(),
  aiMode: z.boolean(),

  // ===== AI CONFIG =====
  aiSettings: AISettingsSchema,
  aiConfig: LLMConfigSchema,

  // ===== STOCK LISTS / URLs =====
  tmsUrl: z.string().nullable(),
  chartConfig: z.object({
    customUrl: z.string().optional(),
    chartSite: z.string(),
  }),

  // ===== SOCKET CONFIG =====
  subscribeConfig: z.object({
    indexCharts: z.array(z.string()),
    stockCharts: z.array(z.string()),
    marketDepth: z.array(z.string()),
  }),

  // ===== CONTENT STATE =====
  autofills: z.record(accountType, z.boolean()),
  autoSaveNewAccount: z.boolean(),
  syncPortfolio: z.boolean(),
})
export type BackupData = z.infer<typeof BackupDataSchema>
