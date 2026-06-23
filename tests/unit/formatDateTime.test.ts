import { describe, expect, it } from 'vitest'

import { formatDateTimeRu } from '@/lib/formatDateTime'

describe('formatDateTimeRu', () => {
  it('formats datetime without seconds', () => {
    expect(formatDateTimeRu('2026-06-07T12:05:00')).toBe('07.06.2026, 12:05')
  })

  it('returns null for empty value', () => {
    expect(formatDateTimeRu(null)).toBeNull()
  })
})
