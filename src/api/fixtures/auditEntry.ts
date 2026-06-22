import { z } from 'zod'

export const auditReportSchema = z.object({
  status: z.enum(['success', 'error', 'skipped']),
  conclusion: z.string().nullable(),
  error: z.string().nullable().optional(),
})

export const auditEntrySchema = z.object({
  audit_id: z.string().uuid(),
  gate_id: z.string(),
  created_at: z.string(),
  report: auditReportSchema,
})

export type AuditEntry = z.infer<typeof auditEntrySchema>

/** Fixture AuditEntry для dev и Vitest. */
export const auditEntryFixture: AuditEntry = {
  audit_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  gate_id: '42',
  created_at: '2025-07-14 12:30:00',
  report: {
    status: 'success',
    conclusion: 'Аномалий не обнаружено за последний интервал.',
    error: null,
  },
}

export function parseAuditEntry(data: unknown): AuditEntry {
  return auditEntrySchema.parse(data)
}
