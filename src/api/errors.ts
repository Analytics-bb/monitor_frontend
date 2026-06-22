import { toast } from 'sonner'
import { z } from 'zod'

/** Zod-схема error envelope anomaly-api. */
export const apiErrorEnvelopeSchema = z.object({
  error_code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
})

/** Типированная ошибка API `{ error_code, message, details }`. */
export type ApiError = z.infer<typeof apiErrorEnvelopeSchema>

/**
 * Парсит JSON-тело ответа как error envelope.
 *
 * @param response - HTTP-ответ с ошибкой
 * @returns Распарсенный envelope или `null`, если тело не соответствует схеме
 */
export async function parseApiError(
  response: Response,
): Promise<ApiError | null> {
  if (response.ok) {
    return null
  }

  try {
    const json: unknown = await response.json()
    const parsed = apiErrorEnvelopeSchema.safeParse(json)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

/** Транспортная ошибка HTTP-клиента с опциональным API envelope. */
export class ApiClientError extends Error {
  readonly status: number
  readonly apiError: ApiError | null

  constructor(status: number, apiError: ApiError | null, message?: string) {
    super(message ?? apiError?.message ?? `HTTP ${status}`)
    this.name = 'ApiClientError'
    this.status = status
    this.apiError = apiError
  }
}

/**
 * Проверяет, является ли ошибка `ApiClientError` с заданным `error_code`.
 */
export function isApiErrorCode(error: unknown, errorCode: string): boolean {
  return (
    error instanceof ApiClientError && error.apiError?.error_code === errorCode
  )
}

/**
 * Показывает toast с `error_code` для API/транспортных ошибок.
 *
 * Побочный эффект: UI toast через `sonner` (не бросает исключений).
 *
 * @param error - `ApiClientError`, `Error` или произвольная ошибка
 */
export function mapApiError(error: unknown): void {
  if (error instanceof ApiClientError) {
    const code = error.apiError?.error_code ?? `http_${error.status}`
    toast.error(code, {
      description: error.message,
    })
    return
  }

  if (error instanceof Error) {
    toast.error('unknown_error', { description: error.message })
    return
  }

  toast.error('unknown_error')
}
