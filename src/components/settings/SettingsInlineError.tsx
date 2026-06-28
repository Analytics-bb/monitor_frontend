import { cn } from '@/lib/utils'

export interface SettingsInlineErrorProps {
  message: string | null
  className?: string
}

/**
 * Компактный inline-блок ошибки для форм настроек.
 */
export function SettingsInlineError({
  message,
  className,
}: SettingsInlineErrorProps) {
  if (!message) {
    return null
  }

  return (
    <p
      role="alert"
      className={cn(
        'border-destructive/20 bg-destructive/5 text-destructive rounded-md border px-3 py-2 text-xs',
        className,
      )}
      data-testid="settings-inline-error"
    >
      {message}
    </p>
  )
}
