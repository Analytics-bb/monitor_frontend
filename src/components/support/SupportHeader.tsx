import { Link } from 'react-router'

import type { SupportChatSnapshot } from '@/api/fixtures/supportChatSnapshot'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SupportHeaderProps {
  snapshot: SupportChatSnapshot | null
  onReset?: () => void
  className?: string
}

function supportStateLabel(state: SupportChatSnapshot['state']): string | undefined {
  if (state === 'processing') {
    return 'Обработка…'
  }
  return undefined
}

/**
 * Header страницы `/support`: заголовок, статус, ссылка на usage, сброс чата.
 */
export function SupportHeader({
  snapshot,
  onReset,
  className,
}: SupportHeaderProps) {
  const state = snapshot?.state ?? 'active'
  const badgeStatus = state === 'error' ? 'error' : 'active'

  return (
    <header
      className={cn(
        'border-border flex flex-wrap items-center justify-between gap-3 border-b pb-3',
        className,
      )}
      data-testid="support-header"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold tracking-tight">Саппорт</h1>
        <StatusBadge
          status={badgeStatus}
          label={supportStateLabel(state)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="link" className="h-auto px-0" asChild>
          <Link to="/usage?agent_kind=support">Расход токенов</Link>
        </Button>
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
      </div>
    </header>
  )
}
