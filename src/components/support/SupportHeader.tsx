import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SupportHeaderProps {
  onReset?: () => void
  className?: string
}

/**
 * Header страницы `/support`: заголовок, подзаголовок, сброс чата.
 */
export function SupportHeader({ onReset, className }: SupportHeaderProps) {
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
          Задайте вопрос support-агенту — текстом или файлом
        </p>
      </div>

      {onReset ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          data-testid="support-reset-button"
        >
          Сбросить чат
        </Button>
      ) : null}
    </header>
  )
}
