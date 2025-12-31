import z from '@nepse-dashboard/zod'

export const ValidationError = z.object({
  type: z.literal('VALIDATION_ERROR'),
  error: z.object({
    message: z.string(),
    originalError: z.string().optional().nullable(),
    details: z.array(z.any()).optional(),
  }),
})

export type ValidationErrorType = z.infer<typeof ValidationError>
