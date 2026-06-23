import { Maximize2, Minimize2 } from 'lucide-react'

import type { StatusBadgeVariant } from '@/components/StatusBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'

export interface ConclusionHeaderProps {
  titleId?: string
  reportStatus: StatusBadgeVariant | null
  action?: 'expand' | 'collapse' | null
  onAction?: () => void
}

/**
 * Заголовок блока вывода агента: название, статус и иконка expand/collapse.
 */
export function ConclusionHeader({
  titleId,
  reportStatus,
  action,
  onAction,
}: ConclusionHeaderProps) {
  const actionLabel =
    action === 'collapse' ? 'Свернуть вывод агента' : 'Развернуть вывод агента'

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <h2 id={titleId} className="text-sm font-semibold">
          Вывод агента
        </h2>
        {reportStatus ? <StatusBadge status={reportStatus} /> : null}
      </div>

      {action && onAction ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 focus-visible:ring-ring/25 size-8 shrink-0 border-transparent shadow-none focus-visible:border-transparent focus-visible:ring-1"
          onClick={onAction}
          aria-label={actionLabel}
        >
          {action === 'collapse' ? (
            <Minimize2 className="size-4" />
          ) : (
            <Maximize2 className="size-4" />
          )}
        </Button>
      ) : null}
    </div>
  )
}
