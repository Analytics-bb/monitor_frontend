import { z } from 'zod'

export const gateInfoSchema = z.object({
  gate_id: z.string(),
  name: z.string(),
  label: z.string().optional(),
})

export type GateInfo = z.infer<typeof gateInfoSchema>

export const activeGateResponseSchema = z.object({
  gate_id: z.string(),
  name: z.string(),
  label: z.string().optional(),
})

export type ActiveGateResponse = z.infer<typeof activeGateResponseSchema>

/** Fixture списка gates для dev и Vitest. */
export const gatesFixture: GateInfo[] = [
  { gate_id: '42', name: 'Gate 42', label: 'Production gate 42' },
  { gate_id: '43', name: 'Gate 43', label: 'Staging gate 43' },
]

/** Fixture активного gate. */
export const activeGateFixture: ActiveGateResponse = gatesFixture[0]!

export function parseGateInfoList(data: unknown): GateInfo[] {
  return z.array(gateInfoSchema).parse(data)
}

export function parseActiveGate(data: unknown): ActiveGateResponse {
  return activeGateResponseSchema.parse(data)
}
