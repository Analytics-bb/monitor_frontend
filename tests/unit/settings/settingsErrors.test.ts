import { describe, expect, it } from 'vitest'

import { ApiClientError } from '@/api/errors'
import { instructionConflict409 } from '@/api/fixtures/conflictEnvelope'
import { resolveSettingsError } from '@/components/settings/settingsErrors'

describe('resolveSettingsError', () => {
  it('maps instruction_conflict to name field message', () => {
    expect(resolveSettingsError(instructionConflict409)).toEqual({
      message: 'Инструкция с таким именем уже существует',
      field: 'name',
    })
  })

  it('prefers api message for request_validation_failed', () => {
    const error = new ApiClientError(422, {
      error_code: 'request_validation_failed',
      message: 'name: invalid format',
    })

    expect(resolveSettingsError(error)).toEqual({
      message: 'name: invalid format',
    })
  })

  it('falls back to generic message', () => {
    expect(resolveSettingsError(new Error('network'))).toEqual({
      message: 'network',
    })
  })
})
