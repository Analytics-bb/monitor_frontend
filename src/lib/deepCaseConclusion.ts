import { deepCasesListFixture } from '@/api/fixtures/deepCaseSummary'

/**
 * Conclusion hypothesis-агента из fixture deep list (dev / Vitest без API).
 */
export function findFixtureDeepCaseConclusion(auditId: string): string | null {
  return (
    deepCasesListFixture.find((item) => item.audit_id === auditId)?.conclusion ??
    null
  )
}
