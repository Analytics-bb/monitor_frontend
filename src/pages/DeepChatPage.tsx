import { Link, useLocation, useParams } from 'react-router'

import { StatusBadge } from '@/components/StatusBadge'

/**
 * Короткий префикс UUID для breadcrumb.
 */
function shortAuditId(auditId: string): string {
  return auditId.slice(0, 8)
}

interface DeepChatLocationState {
  deepListSearch?: string
}

/**
 * Страница `/deep/{audit_id}` — shell с header и placeholder чата.
 *
 * Breadcrumb «Deep» восстанавливает query списка через `location.state.deepListSearch` (M2).
 */
export function DeepChatPage() {
  const { auditId } = useParams()
  const location = useLocation()
  const deepListSearch = (location.state as DeepChatLocationState | null)
    ?.deepListSearch
  const deepListHref = deepListSearch ? `/deep?${deepListSearch}` : '/deep'

  if (!auditId) {
    return null
  }

  return (
    <div
      className="mx-auto flex h-[calc(100svh-3rem)] w-full max-w-[1440px] flex-col gap-3 overflow-hidden"
      data-testid="deep-chat-page"
    >
      <header className="shrink-0 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm"
          >
            <Link
              to={deepListHref}
              className="text-muted-foreground hover:text-foreground"
            >
              Deep
            </Link>
            <span className="text-muted-foreground" aria-hidden>
              /
            </span>
            <span className="font-mono">{shortAuditId(auditId)}</span>
          </nav>
          <div className="flex items-center gap-3">
            <StatusBadge status="not_started" />
          </div>
        </div>
        <div
          data-testid="case-meta-strip-slot"
          className="text-muted-foreground min-h-4 text-xs"
          aria-hidden
        />
      </header>

      <div
        className="border-border bg-card flex min-h-0 flex-1 flex-col rounded-lg border"
        data-testid="chat-window-placeholder"
      >
        <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
          Чат
        </div>
      </div>
    </div>
  )
}
