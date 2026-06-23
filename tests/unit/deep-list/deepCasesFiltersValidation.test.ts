import { describe, expect, it } from 'vitest'

import type { DeepCasesFilterValues } from '@/components/deep/DeepCasesFilters'
import {
  hasDeepCasesFilterErrors,
  validateDeepCasesFilters,
} from '@/lib/deepCasesFiltersValidation'

const EMPTY: DeepCasesFilterValues = {
  gate_id: '',
  state: '',
  from: '',
  to: '',
}

describe('validateDeepCasesFilters', () => {
  it('accepts empty filters', () => {
    expect(validateDeepCasesFilters(EMPTY)).toEqual({})
    expect(hasDeepCasesFilterErrors(validateDeepCasesFilters(EMPTY))).toBe(
      false,
    )
  })

  it('accepts numeric gate_id', () => {
    expect(validateDeepCasesFilters({ ...EMPTY, gate_id: '42' })).toEqual({})
  })

  it('rejects non-numeric gate_id', () => {
    const errors = validateDeepCasesFilters({ ...EMPTY, gate_id: '42a' })

    expect(errors.gate_id).toBe('Только цифры')
  })

  it('accepts valid yyyy-mm-dd dates', () => {
    expect(
      validateDeepCasesFilters({
        ...EMPTY,
        from: '2025-01-01',
        to: '2025-12-31',
      }),
    ).toEqual({})
  })

  it('rejects invalid date format', () => {
    const errors = validateDeepCasesFilters({ ...EMPTY, from: '01-01-2025' })

    expect(errors.from).toBe('Формат yyyy-mm-dd')
  })

  it('rejects impossible calendar date', () => {
    const errors = validateDeepCasesFilters({ ...EMPTY, to: '2025-02-30' })

    expect(errors.to).toBe('Формат yyyy-mm-dd')
  })

  it('rejects to earlier than from', () => {
    const errors = validateDeepCasesFilters({
      ...EMPTY,
      from: '2025-06-10',
      to: '2025-06-01',
    })

    expect(errors.to).toBe('Дата «до» раньше «от»')
  })
})
