import { Maximize2 } from 'lucide-react'

import type { StatusResponse } from '@/api/monitoring'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ConclusionPanelProps {
  data: Pick<
    StatusResponse,
    'conclusion' | 'last_status' | 'report_error' | 'audit_id' | 'last_tick_at'
  > | null
  onExpand: () => void
  className?: string
}

/**
 * Inline-превью conclusion с truncate.
 */
export function ConclusionPanel({ data, onExpand, className }: ConclusionPanelProps) {
  const hasTick = Boolean(data?.last_tick_at)
  const conclusion = data?.conclusion?.trim()

  return (
    <div className={cn('space-y-3', className)} data-testid="conclusion-panel">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold">Conclusion</h2>
        {data?.last_status ? <StatusBadge status={data.last_status} /> : null}
      </div>

      {!hasTick ? (
        <p className="text-muted-foreground text-sm">Ожидание первого тика</p>
      ) : !conclusion ? (
        <p className="text-muted-foreground text-sm">Нет вывода</p>
      ) : (
        <p className="line-clamp-6 text-sm leading-relaxed">{conclusion}</p>
      )}

      {data?.report_error ? (
        <p className="text-status-error text-sm">{data.report_error}</p>
      ) : null}

      {conclusion ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExpand}
          aria-label="Развернуть conclusion"
        >
          <Maximize2 className="size-4" />
          Развернуть
        </Button>
      ) : null}
    </div>
  )
}
