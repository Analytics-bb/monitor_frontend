import { describe, expect, it } from 'vitest'

import {
  formatDateTimeRu,
  formatDateTimeRuOrDash,
  parseBackendDateTime,
} from '@/lib/formatDateTime'

describe('formatDateTimeRu', () => {
  it('formats ISO datetime without seconds', () => {
    expect(formatDateTimeRu('2026-06-07T12:05:00')).toBe('07.06.2026, 12:05')
  })

  it('formats SQL datetime with space separator', () => {
    expect(formatDateTimeRu('2025-07-14 12:30:00')).toBe('14.07.2025, 12:30')
  })

  it('formats datetime with microseconds', () => {
    expect(formatDateTimeRu('2026-06-30T11:57:25.020300')).toBe(
      '30.06.2026, 11:57',
    )
  })

  it('returns null for empty value', () => {
    expect(formatDateTimeRu(null)).toBeNull()
  })

  it('returns dash helper for empty value', () => {
    expect(formatDateTimeRuOrDash(null)).toBe('—')
  })
})

describe('parseBackendDateTime', () => {
  it('parses backend datetime variants', () => {
    expect(parseBackendDateTime('2026-06-30 11:54:40.989092')?.getMinutes()).toBe(
      54,
    )
    expect(parseBackendDateTime('2026-06-30T11:40:00')?.getHours()).toBe(11)
  })
})
