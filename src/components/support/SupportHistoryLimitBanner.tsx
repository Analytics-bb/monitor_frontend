import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SupportHistoryLimitBannerProps {
  visible: boolean
  declined: boolean
  onAcceptReset: () => void
  onDecline: () => void
  className?: string
}

/**
 * Предупреждение при исчерпании лимита истории: сброс или блокировка ввода.
 */
export function SupportHistoryLimitBanner({
  visible,
  declined,
  onAcceptReset,
  onDecline,
  className,
}: SupportHistoryLimitBannerProps) {
  if (!visible) {
    return null
  }

  return (
    <div
      className={cn(
        'border-destructive/40 bg-destructive/10 text-foreground flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-3 text-sm',
        className,
      )}
      data-testid="support-history-limit-banner"
      role="alert"
    >
      <div className="space-y-1">
        <p className="font-medium">Лимит истории исчерпан</p>
        <p className="text-muted-foreground">
          {declined
            ? 'Вы отказались очистить историю — отправка сообщений недоступна. Сохраните важную информацию и нажмите «Очистить историю», чтобы продолжить.'
            : 'История чата будет удалена при продолжении. Сохраните важную информацию перед очисткой.'}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={onAcceptReset}
          data-testid="support-history-limit-accept"
        >
          Очистить историю
        </Button>
        {!declined ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hover:bg-muted/60 min-w-28"
            onClick={onDecline}
            data-testid="support-history-limit-decline"
          >
            Отмена
          </Button>
        ) : null}
      </div>
    </div>
  )
}
