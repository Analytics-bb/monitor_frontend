import { useState } from 'react'

import type { PendingAction } from '@/api/fixtures/chatSnapshot'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ApprovalOverlayProps {
  pendingAction: PendingAction
  onApprove: (actionId: string) => void | Promise<void>
  onReject: (actionId: string) => void | Promise<void>
  /** Переход к вводу своего варианта в обычном composer. */
  onUseCustomInput: () => void
  hideApprove?: boolean
  className?: string
}

/**
 * Всплывающая панель подтверждения MCP-шага над чатом при `awaiting_approval`.
 *
 * Да — approve; Нет — reject; «Свой вариант» — фокус на composer.
 */
export function ApprovalOverlay({
  pendingAction,
  onApprove,
  onReject,
  onUseCustomInput,
  hideApprove = false,
  className,
}: ApprovalOverlayProps) {
  const [submitting, setSubmitting] = useState(false)

  const run = async (action: () => void | Promise<void>) => {
    setSubmitting(true)
    try {
      await action()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center p-4',
        className,
      )}
      data-testid="approval-overlay"
    >
      <div className="approval-overlay-enter border-status-awaiting-approval bg-card pointer-events-auto w-full max-w-xl space-y-4 rounded-xl border p-4 shadow-lg">
        <p className="text-foreground text-sm font-semibold">
          Подтвердить действия агента?
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {!hideApprove ? (
            <Button
              type="button"
              disabled={submitting}
              className="transition-colors duration-200 hover:bg-primary/85"
              onClick={() => void run(() => onApprove(pendingAction.action_id))}
              aria-label={`Подтвердить действие ${pendingAction.action_id}`}
            >
              Да
            </Button>
          ) : null}
          <Button
            type="button"
            variant="destructive"
            disabled={submitting}
            className="transition-colors duration-200 hover:bg-destructive/85"
            onClick={() => void run(() => onReject(pendingAction.action_id))}
            aria-label={`Отклонить действие ${pendingAction.action_id}`}
          >
            Нет
          </Button>
          <button
            type="button"
            disabled={submitting}
            onClick={onUseCustomInput}
            className="text-muted-foreground hover:text-foreground px-2 py-1 text-sm transition-colors duration-200"
          >
            Свой вариант
          </button>
        </div>
      </div>
    </div>
  )
}
