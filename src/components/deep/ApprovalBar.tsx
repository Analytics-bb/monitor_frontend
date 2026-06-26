import type { PendingAction } from '@/api/fixtures/chatSnapshot'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ApprovalBarProps {
  pendingAction: PendingAction
  onApprove: (actionId: string) => void | Promise<void>
  onReject: (actionId: string) => void | Promise<void>
  hideApprove?: boolean
  className?: string
}

const SECRET_PATTERN =
  /(token|password|secret|api[_-]?key|authorization)\s*[:=]\s*\S+/gi

/**
 * Скрывает потенциальные секреты в summary аргументов tool.
 */
function redactArgsSummary(summary: string): string {
  return summary.replace(SECRET_PATTERN, '$1: [redacted]')
}

/**
 * Sticky approval bar между messages и composer при `pending_action`.
 */
export function ApprovalBar({
  pendingAction,
  onApprove,
  onReject,
  hideApprove = false,
  className,
}: ApprovalBarProps) {
  const summary = redactArgsSummary(pendingAction.args_summary)

  return (
    <div
      className={cn(
        'border-t-status-awaiting-approval bg-status-awaiting-approval/5 border-t-2 px-4 py-3',
        className,
      )}
      data-testid="approval-bar"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 text-sm">
          <p className="font-medium">
            Pending: {pendingAction.tool_name}
          </p>
          <p className="text-muted-foreground truncate">{summary}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {!hideApprove ? (
            <Button
              type="button"
              onClick={() => void onApprove(pendingAction.action_id)}
              aria-label={`Подтвердить действие ${pendingAction.action_id}`}
            >
              Approve
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10"
            onClick={() => void onReject(pendingAction.action_id)}
            aria-label={`Отклонить действие ${pendingAction.action_id}`}
          >
            Reject
          </Button>
        </div>
      </div>
    </div>
  )
}
