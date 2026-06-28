import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router'

import type { AgentUsageRun } from '@/api/usage'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface UsageRunDetailProps {
  run: AgentUsageRun
  backHref?: string
  className?: string
}

function formatValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  return String(value)
}

function formatNumber(value: number | null): string {
  return value === null ? '—' : value.toLocaleString('ru-RU')
}

function formatCost(value: number | null): string {
  return value === null ? '—' : value.toFixed(4)
}

const metadataLabels: { key: keyof AgentUsageRun; label: string }[] = [
  { key: 'agent_kind', label: 'Agent kind' },
  { key: 'gate_id', label: 'Gate' },
  { key: 'model', label: 'Model' },
  { key: 'prompt_tokens', label: 'Prompt tokens' },
  { key: 'completion_tokens', label: 'Completion tokens' },
  { key: 'total_tokens', label: 'Total tokens' },
  { key: 'estimated_cost_usd', label: 'Cost USD' },
  { key: 'latency_ms', label: 'Latency ms' },
  { key: 'status', label: 'Status' },
  { key: 'error', label: 'Error' },
  { key: 'provider_run_id', label: 'Provider run ID' },
  { key: 'created_at', label: 'Created at' },
]

function renderMetadataValue(run: AgentUsageRun, key: keyof AgentUsageRun) {
  switch (key) {
    case 'prompt_tokens':
    case 'completion_tokens':
    case 'total_tokens':
      return formatNumber(run[key])
    case 'estimated_cost_usd':
      return formatCost(run[key])
    case 'status':
      return <StatusBadge status={run.status} />
    case 'step_breakdown':
      return null
    default:
      return formatValue(run[key] as string | number | null)
  }
}

/**
 * Детальный просмотр usage run: metadata grid и step_breakdown для deep.
 */
export function UsageRunDetail({
  run,
  backHref = '/usage',
  className,
}: UsageRunDetailProps) {
  const showStepBreakdown =
    run.agent_kind === 'deep' && run.step_breakdown.length > 0

  return (
    <div className={cn('space-y-6', className)} data-testid="usage-run-detail">
      <header
        className="border-border bg-card shrink-0 rounded-lg border p-4"
        data-testid="usage-run-detail-header"
      >
        <div className="flex items-center justify-between gap-4">
          <Link
            to={backHref}
            aria-label="Назад"
            className="bg-elevated text-muted-foreground hover:bg-muted hover:text-foreground flex w-fit shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors"
            data-testid="usage-run-back-link"
          >
            <ChevronLeft className="size-5 shrink-0" aria-hidden />
            <span>Назад</span>
          </Link>
          {run.audit_id ? (
            <Button asChild size="sm" className="min-w-28">
              <Link
                to={`/deep/${run.audit_id}`}
                data-testid="usage-run-deep-chat-link"
              >
                Провалиться в чат
              </Link>
            </Button>
          ) : null}
        </div>
      </header>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metadataLabels.map(({ key, label }) => (
          <div
            key={key}
            className="border-border bg-card rounded-md border p-3"
          >
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="mt-1 font-mono text-sm break-all tabular-nums">
              {renderMetadataValue(run, key)}
            </dd>
          </div>
        ))}
      </dl>

      {run.agent_kind === 'deep' ? (
        <section className="space-y-3">
          <h2 className="text-muted-foreground text-center text-lg font-medium">
            Детализация по шагам
          </h2>
          {showStepBreakdown ? (
            <div className="overflow-x-auto">
              <table
                className="w-full min-w-[420px] border-collapse text-sm"
                data-testid="usage-step-breakdown-table"
              >
                <thead className="bg-muted/40">
                  <tr className="border-border border-b">
                    <th className="px-3 py-2 text-left font-medium">
                      Tool name
                    </th>
                    <th className="px-3 py-2 text-right font-medium">
                      Latency ms
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {run.step_breakdown.map((step) => (
                    <tr
                      key={`${step.tool_name}-${step.latency_ms}`}
                      className="border-border border-b"
                    >
                      <td className="px-3 py-2 font-mono text-xs">
                        {step.tool_name}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">
                        {step.latency_ms}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">—</p>
          )}
        </section>
      ) : null}
    </div>
  )
}
