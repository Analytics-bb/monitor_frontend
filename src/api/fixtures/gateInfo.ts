import { z } from 'zod'

const gateInfoRawSchema = z.object({
  gate_id: z.string().optional(),
  gate_name: z.string().optional(),
  name: z.string().optional(),
  label: z.string().optional(),
})

export interface ParseGateInfoOptions {
  /** Используется, если в теле ответа нет `gate_id`. */
  fallbackGateId?: string
}

function resolveGateName(
  data: z.infer<typeof gateInfoRawSchema>,
  gateId: string,
): string {
  const gate_name = data.gate_name ?? data.name ?? data.label
  if (gate_name?.trim()) {
    return gate_name.trim()
  }
  return `Gate ${gateId}`
}

/** GateInfo из OpenAPI (`GET /gates/active`, `POST /gates/{id}/activate`). */
export const gateInfoSchema = gateInfoRawSchema.transform((data, ctx) => {
  const gate_id = data.gate_id ?? ''
  if (!gate_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'gate_id is required',
    })
    return z.NEVER
  }
  return {
    gate_id,
    gate_name: resolveGateName(data, gate_id),
  }
})

export type GateInfo = z.infer<typeof gateInfoSchema>

/** @deprecated Используйте {@link GateInfo}. */
export type ActiveGateResponse = GateInfo

/** @deprecated Используйте {@link gateInfoSchema}. */
export const activeGateResponseSchema = gateInfoSchema

/** Fixture списка gates для dev и Vitest. */
export const gatesFixture: GateInfo[] = [
  { gate_id: '42', gate_name: 'Gate 42' },
  { gate_id: '43', gate_name: 'Gate 43' },
]

/** Fixture активного gate (согласован с statusResponseFixture gate 1001). */
export const activeGateFixture: GateInfo = {
  gate_id: '1001',
  gate_name: 'Test Gate 1001 Test Method',
}

export function parseGateInfoList(data: unknown): GateInfo[] {
  return z.array(gateInfoSchema).parse(data)
}

/**
 * Парсит ответ gate endpoint.
 *
 * @param data - сырой JSON
 * @param options - fallback `gate_id`, если в теле его нет (например, пустой POST body)
 * @returns `GateInfo`
 * @throws {import('zod').ZodError} при несоответствии схеме
 */
export function parseGateInfo(
  data: unknown,
  options?: ParseGateInfoOptions,
): GateInfo {
  const payload =
    typeof data === 'object' && data !== null
      ? {
          ...data,
          gate_id:
            'gate_id' in data && typeof data.gate_id === 'string'
              ? data.gate_id
              : options?.fallbackGateId,
        }
      : { gate_id: options?.fallbackGateId }

  return gateInfoSchema.parse(payload)
}

/** @deprecated Используйте {@link parseGateInfo}. */
export function parseActiveGate(data: unknown): GateInfo {
  return parseGateInfo(data)
}
