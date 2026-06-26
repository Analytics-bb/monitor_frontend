import { useState } from 'react'

import type { PendingAction } from '@/api/fixtures/chatSnapshot'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ApprovalOverlayProps {
  pendingAction: PendingAction
  onApprove: (actionId: string) => void | Promise<void>
  onReject: (actionId: string) => void | Promise<void>
  onCustomVariant: (actionId: string, content: string) => void | Promise<void>
  hideApprove?: boolean
  className?: string
}

const SECRET_PATTERN =
  /(token|password|secret|api[_-]?key|authorization)\s*[:=]\s*\S+/gi

function redactArgsSummary(summary: string): string {
  return summary.replace(SECRET_PATTERN, '$1: [redacted]')
}

/**
 * Всплывающая панель подтверждения над чатом при `awaiting_approval`.
 *
 * Да — approve; Нет — reject; «Свой вариант» — reject + сообщение агенту.
 */
export function ApprovalOverlay({
  pendingAction,
  onApprove,
  onReject,
  onCustomVariant,
  hideApprove = false,
  className,
}: ApprovalOverlayProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customDraft, setCustomDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const summary = redactArgsSummary(pendingAction.args_summary)

  const handleCustomSubmit = async () => {
    const trimmed = customDraft.trim()
    if (!trimmed || submitting) {
      return
    }

    setSubmitting(true)
    try {
      await onCustomVariant(pendingAction.action_id, trimmed)
      setCustomDraft('')
      setShowCustom(false)
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
        <div className="space-y-1">
          <p className="text-foreground text-sm font-semibold">
            Требуется подтверждение
          </p>
          <p className="text-foreground text-sm font-medium">
            {pendingAction.tool_name}
          </p>
          <p className="text-muted-foreground text-sm">{summary}</p>
        </div>

        {showCustom ? (
          <div className="space-y-2">
            <label
              htmlFor="approval-custom-variant"
              className="text-muted-foreground text-xs font-medium"
            >
              Свой вариант
            </label>
            <textarea
              id="approval-custom-variant"
              value={customDraft}
              onChange={(event) => setCustomDraft(event.target.value)}
              disabled={submitting}
              rows={3}
              placeholder="Опишите альтернативное действие…"
              className="border-input bg-background placeholder:text-muted-foreground w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={!customDraft.trim() || submitting}
                onClick={() => void handleCustomSubmit()}
              >
                Отправить вариант
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={submitting}
                onClick={() => setShowCustom(false)}
              >
                Назад
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {!hideApprove ? (
              <Button
                type="button"
                disabled={submitting}
                onClick={() => void onApprove(pendingAction.action_id)}
                aria-label={`Подтвердить действие ${pendingAction.action_id}`}
              >
                Да
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => void onReject(pendingAction.action_id)}
              aria-label={`Отклонить действие ${pendingAction.action_id}`}
            >
              Нет
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={submitting}
              onClick={() => setShowCustom(true)}
            >
              Свой вариант
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
