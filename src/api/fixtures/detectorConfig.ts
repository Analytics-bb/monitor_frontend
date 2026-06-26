import { z } from 'zod'

export const detectorModeSchema = z.enum(['anomaly', 'full'])

export const detectorConfigSchema = z.object({
  gate_id: z.string().nullable(),
  slice_minutes: z.number().int().positive(),
  window_slices: z.number().int().positive(),
  quantile_low: z.number(),
  quantile_high: z.number(),
  persistence: z.number().int().positive(),
  mode: detectorModeSchema,
  created_at: z.string(),
  updated_at: z.string(),
})

export type DetectorConfig = z.infer<typeof detectorConfigSchema>

export const detectorConfigPatchSchema = z.object({
  slice_minutes: z.number().int().positive().nullable().optional(),
  window_slices: z.number().int().positive().nullable().optional(),
  quantile_low: z.number().nullable().optional(),
  quantile_high: z.number().nullable().optional(),
  persistence: z.number().int().positive().nullable().optional(),
  mode: detectorModeSchema.nullable().optional(),
})

export type DetectorConfigPatch = z.infer<typeof detectorConfigPatchSchema>

/** Global detector config fixture. */
export const detectorConfigGlobalFixture: DetectorConfig = {
  gate_id: null,
  slice_minutes: 5,
  window_slices: 12,
  quantile_low: 0.05,
  quantile_high: 0.95,
  persistence: 3,
  mode: 'anomaly',
  created_at: '2025-07-10 10:00:00',
  updated_at: '2025-07-14 08:00:00',
}

export const detectorConfigsListFixture: DetectorConfig[] = [
  detectorConfigGlobalFixture,
  {
    gate_id: '42',
    slice_minutes: 5,
    window_slices: 24,
    quantile_low: 0.1,
    quantile_high: 0.9,
    persistence: 2,
    mode: 'full',
    created_at: '2025-07-11 10:00:00',
    updated_at: '2025-07-12 12:00:00',
  },
]

export function parseDetectorConfig(data: unknown): DetectorConfig {
  return detectorConfigSchema.parse(data)
}

export function parseDetectorConfigList(data: unknown): DetectorConfig[] {
  return z.array(detectorConfigSchema).parse(data)
}
