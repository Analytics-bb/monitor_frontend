import { MessageSquare } from 'lucide-react'
import { Link } from 'react-router'

import type { AgentUsageRun } from '@/api/usage'
import { StatusBadge } from '@/components/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface UsageRunsTableProps {
  items: AgentUsageRun[]
  onRowClick?: (runId: string) => void
  className?: string
}

const headerCellClassName = 'px-3 py-2 text-center font-medium'

function formatMetric(value: number | null): string {
  return value === null ? '—' : value.toLocaleString('ru-RU')
}

function formatCost(value: number | null): string {
  return value === null ? '—' : value.toFixed(4)
}

function formatGate(gateId: string | null): string {
  return gateId ?? '—'
}

/**
 * Таблица agent usage runs: токены, cost и ссылки на deep case.
 */
export function UsageRunsTable({
  items,
  onRowClick,
  className,
}: UsageRunsTableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table
        className="w-full min-w-[960px] border-collapse text-sm"
        aria-label="Agent usage runs"
        data-testid="usage-runs-table"
      >
        <caption className="sr-only">Agent usage runs</caption>
        <thead className="bg-muted/40 sticky top-0 z-[1]">
          <tr className="border-border border-b">
            <th className={headerCellClassName}>Time</th>
            <th className={headerCellClassName}>Agent</th>
            <th className={headerCellClassName}>Gate</th>
            <th className={headerCellClassName}>Audit</th>
            <th className={headerCellClassName}>Model</th>
            <th className={cn(headerCellClassName, 'text-right')}>Tokens in</th>
            <th className={cn(headerCellClassName, 'text-right')}>
              Tokens out
            </th>
            <th
              className={cn(headerCellClassName, 'text-right')}
              aria-label="Estimated cost USD"
            >
              Cost
            </th>
            <th className={headerCellClassName}>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.run_id}
              className={cn(
                'border-border hover:bg-muted/40 h-9 border-b transition-colors',
                onRowClick && 'cursor-pointer',
              )}
              data-testid="usage-runs-table-row"
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? 'button' : undefined}
              onClick={() => onRowClick?.(item.run_id)}
              onKeyDown={(event) => {
                if (!onRowClick) {
                  return
                }

                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onRowClick(item.run_id)
                }
              }}
            >
              <td className="text-muted-foreground px-3 py-2 font-mono text-xs whitespace-nowrap tabular-nums">
                {item.created_at}
              </td>
              <td className="px-3 py-2 text-center">
                <Badge
                  variant="outline"
                  className="font-mono text-xs uppercase"
                >
                  {item.agent_kind}
                </Badge>
              </td>
              <td className="px-3 py-2 text-center">
                <span className="bg-muted text-foreground inline-flex rounded-full px-2 py-0.5 font-mono text-xs tabular-nums">
                  {formatGate(item.gate_id)}
                </span>
              </td>
              <td className="px-3 py-2 text-center">
                {item.audit_id ? (
                  <Link
                    to={`/deep/${item.audit_id}`}
                    className="text-muted-foreground hover:text-primary inline-flex size-8 items-center justify-center transition-colors"
                    aria-label="Открыть deep chat"
                    data-testid="usage-audit-link"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <MessageSquare aria-hidden className="size-4" />
                  </Link>
                ) : (
                  <span
                    className="text-muted-foreground text-xs"
                    title="backfill pending"
                  >
                    —
                  </span>
                )}
              </td>
              <td className="px-3 py-2 text-center font-mono text-xs">
                {item.model}
              </td>
              <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">
                {formatMetric(item.prompt_tokens)}
              </td>
              <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">
                {formatMetric(item.completion_tokens)}
              </td>
              <td
                className="px-3 py-2 text-right font-mono text-xs tabular-nums"
                aria-label="Estimated cost USD"
              >
                {formatCost(item.estimated_cost_usd)}
              </td>
              <td className="px-3 py-2 text-center">
                <StatusBadge status={item.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
