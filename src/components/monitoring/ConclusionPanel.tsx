import type { StatusResponse } from '@/api/monitoring'
import {
  getStatusConclusion,
  getStatusLastTickAt,
  getStatusReportError,
  getStatusReportStatus,
} from '@/api/fixtures/statusResponse'
import { AgentConclusionContent } from '@/components/monitoring/AgentConclusionContent'
import { ConclusionHeader } from '@/components/monitoring/ConclusionHeader'
import { ConclusionScrollArea } from '@/components/monitoring/ConclusionScrollArea'
import { cn } from '@/lib/utils'

export interface ConclusionPanelProps {
  data: StatusResponse | null
  onExpand: () => void
  className?: string
}

/**
 * Превью вывода агента со скроллом и иконкой разворота в modal.
 */
export function ConclusionPanel({
  data,
  onExpand,
  className,
}: ConclusionPanelProps) {
  const hasTick = Boolean(getStatusLastTickAt(data))
  const conclusion = getStatusConclusion(data)?.trim()
  const reportStatus = getStatusReportStatus(data)
  const reportError = getStatusReportError(data)

  return (
    <div className={cn('space-y-3', className)} data-testid="conclusion-panel">
      <ConclusionHeader
        reportStatus={reportStatus}
        action={conclusion ? 'expand' : null}
        onAction={onExpand}
      />

      {!hasTick ? (
        <p className="text-muted-foreground text-sm">Ожидание первого тика</p>
      ) : !conclusion ? (
        <p className="text-muted-foreground text-sm">Нет вывода</p>
      ) : (
        <ConclusionScrollArea variant="panel">
          <AgentConclusionContent content={conclusion} />
        </ConclusionScrollArea>
      )}

      {reportError ? (
        <p className="text-status-error text-sm">{reportError}</p>
      ) : null}
    </div>
  )
}
