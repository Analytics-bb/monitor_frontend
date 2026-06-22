import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/** Варианты статуса monitoring report и deep chat. */
export type StatusBadgeVariant =
  | 'success'
  | 'error'
  | 'skipped'
  | 'active'
  | 'awaiting_approval'
  | 'completed'
  | 'not_started'
  | 'cancelled'

export interface StatusBadgeProps {
  /** Семантический статус. */
  status: StatusBadgeVariant
  /** Переопределение текстовой метки; по умолчанию — label по status. */
  label?: string
  className?: string
}

const DEFAULT_LABELS: Record<StatusBadgeVariant, string> = {
  success: 'Успех',
  error: 'Ошибка',
  skipped: 'Пропущен',
  active: 'Активен',
  awaiting_approval: 'Ожидает подтверждения',
  completed: 'Завершён',
  not_started: 'Не начат',
  cancelled: 'Отменён',
}

const STATUS_CLASS: Record<StatusBadgeVariant, string> = {
  success:
    'border-status-success/30 bg-status-success/10 text-status-success',
  error: 'border-status-error/30 bg-status-error/10 text-status-error',
  skipped:
    'border-status-skipped/30 bg-status-skipped/10 text-status-skipped',
  active: 'border-status-active/30 bg-status-active/10 text-status-active',
  awaiting_approval:
    'border-status-awaiting-approval/30 bg-status-awaiting-approval/10 text-status-awaiting-approval',
  completed:
    'border-status-completed/30 bg-status-completed/10 text-status-completed',
  not_started:
    'border-status-not-started/30 bg-status-not-started/10 text-status-not-started',
  cancelled:
    'border-status-cancelled/30 bg-status-cancelled/10 text-status-cancelled',
}

/**
 * Единый badge статуса для monitoring и deep chat.
 * Цвет + текстовая метка (цвет не единственный индикатор).
 */
export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const text = label ?? DEFAULT_LABELS[status]

  return (
    <Badge
      variant="outline"
      className={cn(STATUS_CLASS[status], className)}
      aria-label={`Статус: ${text}`}
    >
      {text}
    </Badge>
  )
}
