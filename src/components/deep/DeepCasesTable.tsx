import type { DeepCaseSummary } from '@/api/deep'
import { StatusBadge, type StatusBadgeVariant } from '@/components/StatusBadge'
import { cn } from '@/lib/utils'

export interface DeepCasesTableProps {
  items: DeepCaseSummary[]
  className?: string
}

function shortAuditId(auditId: string): string {
  return auditId.slice(0, 8)
}

function mapChatStateToBadge(state: DeepCaseSummary['deep_chat_state']): StatusBadgeVariant {
  return state
}

/**
 * Таблица deep cases: основные поля audit и статус чата.
 */
export function DeepCasesTable({ items, className }: DeepCasesTableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table
        className="w-full min-w-[960px] border-collapse text-sm"
        aria-label="Deep audits"
        data-testid="deep-cases-table"
      >
        <thead className="bg-muted/40 sticky top-0 z-[1]">
          <tr className="border-border border-b text-left">
            <th className="px-3 py-2 font-medium">Time</th>
            <th className="px-3 py-2 font-medium">Audit</th>
            <th className="px-3 py-2 font-medium">Gate</th>
            <th className="px-3 py-2 font-medium">Event</th>
            <th className="px-3 py-2 font-medium">Conclusion</th>
            <th className="px-3 py-2 font-medium">State</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.audit_id}
              className="border-border hover:bg-muted/40 h-9 border-b transition-colors"
              data-testid="deep-cases-table-row"
            >
              <td className="text-muted-foreground px-3 py-2 font-mono text-xs whitespace-nowrap">
                {item.created_at}
              </td>
              <td className="px-3 py-2 font-mono text-xs">
                <span title={item.audit_id}>{shortAuditId(item.audit_id)}</span>
              </td>
              <td className="px-3 py-2">
                <span className="bg-muted text-foreground inline-flex rounded-full px-2 py-0.5 font-mono text-xs">
                  {item.gate_id}
                </span>
              </td>
              <td className="max-w-[16rem] px-3 py-2">
                <span className="block truncate" title={item.event_summary}>
                  {item.event_summary}
                </span>
              </td>
              <td className="max-w-[20rem] px-3 py-2">
                <span className="block truncate" title={item.conclusion}>
                  {item.conclusion}
                </span>
              </td>
              <td className="px-3 py-2">
                <StatusBadge status={mapChatStateToBadge(item.deep_chat_state)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
