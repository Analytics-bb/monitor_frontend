import type { DeepCaseSummary } from '@/api/deep'
import { StatusBadge, type StatusBadgeVariant } from '@/components/StatusBadge'
import { formatDateTimeRuOrDash } from '@/lib/formatDateTime'
import { cn } from '@/lib/utils'

export interface DeepCasesTableProps {
  items: DeepCaseSummary[]
  onRowClick?: (item: DeepCaseSummary) => void
  className?: string
}

function mapChatStateToBadge(
  state: DeepCaseSummary['deep_chat_state'],
): StatusBadgeVariant {
  return state
}

const headerCellClassName = 'px-3 py-2 text-center font-medium'

/**
 * Таблица deep cases: основные поля audit и статус чата.
 */
export function DeepCasesTable({
  items,
  onRowClick,
  className,
}: DeepCasesTableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table
        className="w-full min-w-[720px] border-collapse text-sm"
        aria-label="Deep audits"
        data-testid="deep-cases-table"
      >
        <thead className="bg-muted/40 sticky top-0 z-[1]">
          <tr className="border-border border-b">
            <th className={headerCellClassName}>Time</th>
            <th className={headerCellClassName}>Gate</th>
            <th className={headerCellClassName}>Event</th>
            <th className={headerCellClassName}>Conclusion</th>
            <th className={headerCellClassName}>State</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.audit_id}
              className={cn(
                'border-border hover:bg-muted/40 h-9 border-b transition-colors',
                onRowClick && 'cursor-pointer',
              )}
              data-testid="deep-cases-table-row"
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? 'button' : undefined}
              onClick={() => onRowClick?.(item)}
              onKeyDown={(event) => {
                if (!onRowClick) {
                  return
                }

                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onRowClick(item)
                }
              }}
            >
              <td className="text-muted-foreground px-3 py-2 font-mono text-xs whitespace-nowrap tabular-nums">
                {formatDateTimeRuOrDash(item.created_at)}
              </td>
              <td className="px-3 py-2 text-center">
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
              <td className="px-3 py-2 text-center">
                <StatusBadge
                  status={mapChatStateToBadge(item.deep_chat_state)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
