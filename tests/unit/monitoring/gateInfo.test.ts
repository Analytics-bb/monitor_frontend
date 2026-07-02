import { describe, expect, it } from 'vitest'

import { parseGateInfo } from '@/api/fixtures/gateInfo'

describe('parseGateInfo', () => {
  it('parses OpenAPI gate_name field', () => {
    expect(
      parseGateInfo({ gate_id: '1001', gate_name: 'Gate 1001 Test' }),
    ).toEqual({
      gate_id: '1001',
      gate_name: 'Gate 1001 Test',
    })
  })

  it('accepts legacy name field', () => {
    expect(parseGateInfo({ gate_id: '42', name: 'Gate 42' })).toEqual({
      gate_id: '42',
      gate_name: 'Gate 42',
    })
  })

  it('accepts label as gate display name', () => {
    expect(
      parseGateInfo({ gate_id: '1001', label: 'Production gate 1001' }),
    ).toEqual({
      gate_id: '1001',
      gate_name: 'Production gate 1001',
    })
  })

  it('falls back to Gate {id} when name is missing', () => {
    expect(parseGateInfo({ gate_id: '1001' })).toEqual({
      gate_id: '1001',
      gate_name: 'Gate 1001',
    })
  })

  it('uses fallbackGateId for empty POST body shape', () => {
    expect(parseGateInfo({}, { fallbackGateId: '2002' })).toEqual({
      gate_id: '2002',
      gate_name: 'Gate 2002',
    })
  })
})
