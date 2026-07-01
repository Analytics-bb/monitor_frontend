import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ContextResetBannerProps {
  visible: boolean
  onDismiss: () => void
  className?: string
}

/**
 * Баннер ротации истории support-чата (`context_reset=true`).
 */
export function ContextResetBanner({
  visible,
  onDismiss,
  className,
}: ContextResetBannerProps) {
  if (!visible) {
    return null
  }

  return (
    <div
      className={cn(
        'border-accent-warn/40 bg-accent-warn/10 text-foreground flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm',
        className,
      )}
      data-testid="support-context-reset-banner"
      role="status"
    >
      <span>История очищена (лимит контекста)</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        aria-label="Скрыть уведомление"
        onClick={onDismiss}
      >
        <X className="size-4" aria-hidden />
      </Button>
    </div>
  )
}
