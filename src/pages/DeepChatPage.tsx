import { ChevronLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'

import { isApiErrorCode, mapApiError } from '@/api/errors'
import type { ChatSnapshot } from '@/api/fixtures/chatSnapshot'
import { ApprovalBar } from '@/components/deep/ApprovalBar'
import { CaseMetaStrip } from '@/components/deep/CaseMetaStrip'
import { ChatComposer } from '@/components/deep/ChatComposer'
import { ChatMessageList } from '@/components/deep/ChatMessageList'
import { ChatWindow } from '@/components/deep/ChatWindow'
import { StatusBadge, type StatusBadgeVariant } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { useDeepChat } from '@/hooks/useDeepChat'

const TERMINAL_STATES = new Set<ChatSnapshot['state']>([
  'completed',
  'cancelled',
  'error',
])

interface DeepChatLocationState {
  deepListSearch?: string
}

function toStatusBadgeVariant(state: ChatSnapshot['state']): StatusBadgeVariant {
  return state
}

function getComposerPlaceholder(state: ChatSnapshot['state']): string {
  if (state === 'awaiting_approval') {
    return 'Ожидание подтверждения…'
  }
  return 'Напишите агенту…'
}

/**
 * Страница `/deep/{audit_id}` — deep chat с LLM-layout.
 */
export function DeepChatPage() {
  const { auditId } = useParams()
  const location = useLocation()
  const deepListSearch = (location.state as DeepChatLocationState | null)
    ?.deepListSearch
  const deepListHref = deepListSearch ? `/deep?${deepListSearch}` : '/deep'

  const {
    snapshot,
    error,
    openSession,
    sendMessage,
    approve,
    reject,
    refetch,
  } = useDeepChat(auditId ?? '')

  const [opening, setOpening] = useState(false)
  const [budgetExceeded, setBudgetExceeded] = useState(false)

  const isTerminal = snapshot ? TERMINAL_STATES.has(snapshot.state) : false
  const isPending = Boolean(snapshot?.pending_action)
  const composerDisabled =
    isPending || isTerminal || snapshot?.state === 'awaiting_approval'

  const hideApprove = budgetExceeded || snapshot?.state === 'error'

  const handleOpen = async () => {
    setOpening(true)
    try {
      await openSession()
    } catch (openError) {
      mapApiError(openError)
    } finally {
      setOpening(false)
    }
  }

  const handleApprove = async (actionId: string) => {
    try {
      await approve(actionId)
      setBudgetExceeded(false)
    } catch (approveError) {
      if (isApiErrorCode(approveError, 'budget_exceeded')) {
        setBudgetExceeded(true)
        mapApiError(approveError)
      } else {
        mapApiError(approveError)
      }
    }
  }

  const handleReject = async (actionId: string) => {
    try {
      await reject(actionId)
    } catch (rejectError) {
      mapApiError(rejectError)
    }
  }

  const terminalBanner = useMemo(() => {
    if (!isTerminal) {
      return null
    }
    return (
      <div className="bg-muted/60 text-muted-foreground border-border border-t px-4 py-2 text-center text-sm">
        Диалог завершён
      </div>
    )
  }, [isTerminal])

  if (!auditId) {
    return null
  }

  if (error && !snapshot) {
    return (
      <section
        className="mx-auto flex max-w-lg flex-col gap-4 p-6"
        data-testid="deep-chat-error"
      >
        <h1 className="text-lg font-semibold">Не удалось загрузить чат</h1>
        <p className="text-muted-foreground text-sm">
          Проверьте audit_id или вернитесь к списку.
        </p>
        <Button asChild variant="outline">
          <Link to={deepListHref}>К списку</Link>
        </Button>
      </section>
    )
  }

  return (
    <div
      className="mx-auto flex h-[calc(100svh-3rem)] w-full max-w-[1440px] flex-col gap-3 overflow-hidden"
      data-testid="deep-chat-page"
    >
      <header className="border-border bg-card shrink-0 rounded-lg border p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <Link
              to={deepListHref}
              aria-label="Go back"
              className="bg-elevated text-muted-foreground hover:bg-muted hover:text-foreground flex w-fit shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors"
            >
              <ChevronLeft className="size-5 shrink-0" aria-hidden />
              <span>Назад</span>
            </Link>
            <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
              {snapshot ? (
                <CaseMetaStrip
                  gateId={snapshot.gate_id}
                  gateName={snapshot.gate_name}
                  createdAt={snapshot.created_at}
                />
              ) : null}
              <Link
                to={`/usage?audit_id=${encodeURIComponent(auditId)}`}
                className="text-muted-foreground hover:text-primary shrink-0 text-sm transition-colors duration-200"
              >
                Расход токенов
              </Link>
            </div>
          </div>
          {snapshot ? (
            <StatusBadge status={toStatusBadgeVariant(snapshot.state)} />
          ) : (
            <StatusBadge status="not_started" />
          )}
        </div>
      </header>

      <ChatWindow
        messages={
          snapshot && snapshot.state !== 'not_started' ? (
            <ChatMessageList messages={snapshot.messages} />
          ) : (
            <p className="text-muted-foreground text-sm">Сообщений пока нет</p>
          )
        }
        emptyState={
          snapshot?.state === 'not_started' ? (
            <Button
              type="button"
              onClick={() => void handleOpen()}
              disabled={opening}
              data-testid="deep-chat-open-cta"
            >
              {opening ? 'Открываем…' : 'Открыть анализ'}
            </Button>
          ) : undefined
        }
        approval={
          snapshot?.pending_action ? (
            <ApprovalBar
              pendingAction={snapshot.pending_action}
              onApprove={handleApprove}
              onReject={handleReject}
              hideApprove={hideApprove}
            />
          ) : undefined
        }
        terminalBanner={terminalBanner ?? undefined}
        composer={
          snapshot && !isTerminal ? (
            <ChatComposer
              disabled={composerDisabled}
              placeholder={getComposerPlaceholder(snapshot.state)}
              onSend={async (content) => {
                const sent = await sendMessage(content)
                if (!sent) {
                  await refetch()
                }
              }}
            />
          ) : undefined
        }
      />
    </div>
  )
}
