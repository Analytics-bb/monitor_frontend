import { useState } from 'react'

import { cn } from '@/lib/utils'

export interface CaseMetaStripProps {
  gateId: string
  createdAt: string
  conclusion?: string
  className?: string
}

/**
 * Компактная meta-строка под breadcrumb: gate и время события (MSK as-is).
 *
 * Optional collapsible excerpt заключения (read-only, max 2 строки).
 */
export function CaseMetaStrip({
  gateId,
  createdAt,
  conclusion,
  className,
}: CaseMetaStripProps) {
  const [expanded, setExpanded] = useState(false)
  const hasConclusion = Boolean(conclusion?.trim())

  return (
    <div className={cn('text-muted-foreground text-xs', className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>
          gate: <span className="text-foreground font-medium">{gateId}</span>
        </span>
        <span className="font-mono">{createdAt} MSK</span>
        {hasConclusion ? (
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            {expanded ? 'Скрыть заключение' : 'Заключение'}
          </button>
        ) : null}
      </div>
      {hasConclusion && expanded ? (
        <p className="text-foreground mt-2 line-clamp-2 text-sm">{conclusion}</p>
      ) : null}
    </div>
  )
}
