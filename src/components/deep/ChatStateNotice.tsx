import type { ChatSnapshot } from '@/api/fixtures/chatSnapshot'
import { cn } from '@/lib/utils'

export interface ChatStateNoticeProps {
  state: Extract<ChatSnapshot['state'], 'completed' | 'cancelled'>
  className?: string
}

const NOTICE_COPY: Record<ChatStateNoticeProps['state'], string> = {
  completed:
    'Анализ завершён. История доступна только для просмотра — отправить новое сообщение агенту нельзя.',
  cancelled:
    'Анализ отменён. Диалог закрыт — отправить новое сообщение агенту нельзя.',
}

/**
 * Системное уведомление внизу фрейма чата для `completed` и `cancelled`.
 */
export function ChatStateNotice({ state, className }: ChatStateNoticeProps) {
  return (
    <div
      className={cn(
        'border-border bg-muted/50 text-muted-foreground rounded-lg border px-4 py-3 text-center text-sm leading-relaxed',
        className,
      )}
      data-testid={`chat-state-notice-${state}`}
      role="status"
    >
      {NOTICE_COPY[state]}
    </div>
  )
}
