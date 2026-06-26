import { ApiClientError } from '@/api/errors'

export type SettingsErrorField = 'name' | 'form'

export interface ResolvedSettingsError {
  message: string
  field?: SettingsErrorField
}

const SETTINGS_ERROR_MESSAGES: Record<string, string> = {
  instruction_conflict: 'Инструкция с таким именем уже существует',
  instruction_not_found: 'Инструкция не найдена',
  instruction_corrupted: 'Не удалось прочитать данные инструкции',
  request_validation_failed: 'Проверьте введённые данные',
  config_conflict: 'Конфиг изменён в другой сессии — обновите и повторите',
  config_not_found: 'Конфиг не найден',
  config_validation_failed: 'Некорректные значения конфига',
  config_corrupted: 'Не удалось прочитать данные конфига',
  context_not_found: 'Контекст не найден',
  context_store_unavailable: 'Хранилище контекстов временно недоступно',
}

function isInstructionConflict(error: ApiClientError): boolean {
  return error.apiError?.error_code === 'instruction_conflict'
}

/**
 * Преобразует API-ошибку настроек в короткое сообщение для inline UI.
 */
export function resolveSettingsError(error: unknown): ResolvedSettingsError {
  if (error instanceof ApiClientError) {
    const code = error.apiError?.error_code
    const apiMessage = error.apiError?.message?.trim()

    if (isInstructionConflict(error)) {
      return {
        message: SETTINGS_ERROR_MESSAGES.instruction_conflict,
        field: 'name',
      }
    }

    if (code === 'request_validation_failed') {
      return {
        message: apiMessage || SETTINGS_ERROR_MESSAGES.request_validation_failed,
      }
    }

    if (code && SETTINGS_ERROR_MESSAGES[code]) {
      return { message: SETTINGS_ERROR_MESSAGES[code] }
    }

    if (apiMessage) {
      return { message: apiMessage }
    }

    return { message: `Ошибка запроса (${error.status})` }
  }

  if (error instanceof Error && error.message.trim()) {
    return { message: error.message }
  }

  return { message: 'Не удалось выполнить операцию' }
}
