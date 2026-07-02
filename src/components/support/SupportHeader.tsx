import { SupportHistoryMeter } from '@/components/support/SupportHistoryMeter'
import { cn } from '@/lib/utils'

export interface SupportHeaderProps {
  historyMessageCount: number
  historyMessageLimit: number
  className?: string
}

/**
 * Header страницы `/support`: заголовок, подзаголовок, шкала истории.
 */
export function SupportHeader({
  historyMessageCount,
  historyMessageLimit,
  className,
}: SupportHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-wrap items-start justify-between gap-3',
        className,
      )}
      data-testid="support-header"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Саппорт</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Агент-саппорт: запросы к базе, аналитика Telegram-чатов и Google Таблиц
        </p>
      </div>

      <SupportHistoryMeter
        messageCount={historyMessageCount}
        limit={historyMessageLimit}
      />
    </header>
  )
}
