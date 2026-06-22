import { describe, expect, it } from 'vitest'
import { parseApiError } from '@/api/errors'

function jsonResponse(body: unknown, status = 400): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('parseApiError', () => {
  it('parses valid error envelope', async () => {
    const response = jsonResponse({
      error_code: 'gate_not_found',
      message: 'Gate not found',
      details: { gate_id: '42' },
    })

    const error = await parseApiError(response)

    expect(error).toEqual({
      error_code: 'gate_not_found',
      message: 'Gate not found',
      details: { gate_id: '42' },
    })
  })

  it('returns null for invalid JSON envelope', async () => {
    const response = jsonResponse({ message: 'missing error_code' })

    const error = await parseApiError(response)

    expect(error).toBeNull()
  })

  it('returns null for ok response', async () => {
    const response = new Response(null, { status: 200 })

    const error = await parseApiError(response)

    expect(error).toBeNull()
  })

  it('returns null for non-json body', async () => {
    const response = new Response('not json', { status: 500 })

    const error = await parseApiError(response)

    expect(error).toBeNull()
  })
})
