import { z } from 'zod'

/** DECIMAL из API может прийти строкой; нормализуем в `number`. */
const nullableUsdAmountSchema = z
  .union([z.string(), z.number(), z.null()])
  .transform((value) => {
    if (value === null) {
      return null
    }

    return typeof value === 'number' ? value : Number(value)
  })

/**
 * Агрегат токенов и оценки стоимости (`TokenUsage` в OpenAPI).
 */
export const tokenUsageSchema = z.object({
  model: z.string(),
  prompt_tokens: z.number().int().nullable(),
  completion_tokens: z.number().int().nullable(),
  total_tokens: z.number().int().nullable(),
  estimated_cost_usd: nullableUsdAmountSchema,
})

export type TokenUsage = z.infer<typeof tokenUsageSchema>

/**
 * Парсит JSON как TokenUsage.
 *
 * @throws {z.ZodError} При несоответствии OpenAPI
 */
export function parseTokenUsage(data: unknown): TokenUsage {
  return tokenUsageSchema.parse(data)
}
