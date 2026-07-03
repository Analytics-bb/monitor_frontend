import { describe, expect, it } from 'vitest'

import { ApiClientError } from '@/api/errors'
import {
  buildDeepChatErrorAssistantContent,
  isErrorCoveredByAssistantMessage,
  toApiErrorFromUnknown,
} from '@/lib/deepChatErrorMessage'

describe('deepChatErrorMessage', () => {
  it('builds structured assistant markdown for API error', () => {
    const content = buildDeepChatErrorAssistantContent({
      error_code: 'budget_exceeded',
      message: 'Превышен лимит',
      details: { limit_usd: 5 },
    })

    expect(content).toContain('budget_exceeded')
    expect(content).toContain('Превышен лимит')
    expect(content).toContain('limit_usd')
  })

  it('maps ApiClientError to API envelope', () => {
    expect(
      toApiErrorFromUnknown(
        new ApiClientError(404, {
          error_code: 'audit_not_found',
          message: 'Audit not found',
        }),
      ),
    ).toEqual({
      error_code: 'audit_not_found',
      message: 'Audit not found',
    })
  })

  it('maps AbortError to request_timeout', () => {
    const abortError = new Error('Fetch is aborted')
    abortError.name = 'AbortError'
    expect(toApiErrorFromUnknown(abortError)).toEqual({
      error_code: 'request_timeout',
      message: expect.stringContaining('Превышено время ожидания'),
    })
  })

  it('detects duplicate error assistant message', () => {
    const error = {
      error_code: 'pipeline_error',
      message: 'LLM недоступен',
    }

    expect(
      isErrorCoveredByAssistantMessage(
        buildDeepChatErrorAssistantContent(error),
        error,
      ),
    ).toBe(true)
  })
})
