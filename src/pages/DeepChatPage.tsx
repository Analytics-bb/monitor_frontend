import { ChevronLeft, MessageCircleOff } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'

import type { ApiError } from '@/api/errors'
import { ApiClientError, isApiErrorCode, mapApiError } from '@/api/errors'
import type { ChatSnapshot } from '@/api/fixtures/chatSnapshot'
import { ApprovalOverlay } from '@/components/deep/ApprovalOverlay'
import { CaseMetaStrip } from '@/components/deep/CaseMetaStrip'
import { ChatComposer } from '@/components/deep/ChatComposer'
import { ChatErrorPanel } from '@/components/deep/ChatErrorPanel'
import { ChatMessageList } from '@/components/deep/ChatMessageList'
import { ChatStateNotice } from '@/components/deep/ChatStateNotice'
import { ChatWindow } from '@/components/deep/ChatWindow'
import { StatusBadge, type StatusBadgeVariant } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { useDeepChat } from '@/hooks/useDeepChat'

const TERMINAL_STATES = new Set<ChatSnapshot['state']>([
  'completed',
  'cancelled',
  'error',
])

const CLOSED_CHAT_STATES = new Set<ChatSnapshot['state']>(['completed', 'cancelled'])

interface DeepChatLocationState {
  deepListSearch?: string
}

function toStatusBadgeVariant(state: ChatSnapshot['state']): StatusBadgeVariant {
  return state
}

function getComposerPlaceholder(
  state: ChatSnapshot['state'],
  customVariantMode: boolean,
): string {
  if (customVariantMode) {
    return 'Опишите свой вариант действия…'
  }
  if (state === 'awaiting_approval') {
    return 'Ожидание подтверждения…'
  }
  return 'Напишите агенту…'
}

function resolveSnapshotError(
  snapshot: ChatSnapshot,
  fetchError: unknown,
): ApiError {
  if (snapshot.last_error) {
    return snapshot.last_error
  }

  if (fetchError instanceof ApiClientError && fetchError.apiError) {
    return fetchError.apiError
  }

  return {
    error_code: 'chat_error',
    message: 'Произошла ошибка при выполнении deep analysis.',
  }
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
    isOpening,
    sendMessage,
    approve,
    reject,
    refetch,
  } = useDeepChat(auditId ?? '')

  const [budgetExceeded, setBudgetExceeded] = useState(false)
  const [customVariantActionId, setCustomVariantActionId] = useState<
    string | null
  >(null)

  const customVariantMode =
    customVariantActionId !== null &&
    customVariantActionId === snapshot?.pending_action?.action_id

  const isErrorState = snapshot?.state === 'error'
  const isTerminal = snapshot ? TERMINAL_STATES.has(snapshot.state) : false
  const isClosedChat = snapshot ? CLOSED_CHAT_STATES.has(snapshot.state) : false
  const isPending = Boolean(snapshot?.pending_action)
  const composerDisabled =
    isTerminal ||
    isOpening ||
    snapshot?.state === 'not_started' ||
    (isPending && !customVariantMode) ||
    (snapshot?.state === 'awaiting_approval' && !customVariantMode)

  const hideApprove = budgetExceeded || isErrorState

  const handleApprove = async (actionId: string) => {
    try {
      await approve(actionId)
      setBudgetExceeded(false)
    } catch (approveError) {
      if (isApiErrorCode(approveError, 'budget_exceeded')) {
        setBudgetExceeded(true)
      }
      mapApiError(approveError)
    }
  }

  const handleReject = async (actionId: string) => {
    try {
      await reject(actionId)
    } catch (rejectError) {
      mapApiError(rejectError)
    }
  }

  const handleCustomVariant = async (actionId: string, content: string) => {
    try {
      await reject(actionId)
      const sent = await sendMessage(content)
      if (!sent) {
        await refetch()
      }
    } catch (variantError) {
      mapApiError(variantError)
    }
  }

  const terminalNotice = useMemo(() => {
    if (!snapshot || !isClosedChat) {
      return null
    }
    return <ChatStateNotice state={snapshot.state as 'completed' | 'cancelled'} />
  }, [isClosedChat, snapshot])

  const chatMessages = useMemo(() => {
    if (!snapshot || isErrorState) {
      return null
    }

    if (snapshot.messages.length > 0) {
      return <ChatMessageList messages={snapshot.messages} />
    }

    if (isOpening) {
      return (
        <p className="text-muted-foreground p-4 text-sm">Загружаем summary…</p>
      )
    }

    return (
      <p className="text-muted-foreground p-4 text-sm">Сообщений пока нет</p>
    )
  }, [isErrorState, isOpening, snapshot])

  if (!auditId) {
    return null
  }

  if (error && !snapshot) {
    return (
      <section
        className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-md flex-col items-center justify-center px-6 text-center"
        data-testid="deep-chat-error"
      >
        <h1 className="text-foreground/80 text-xl font-semibold tracking-tight">
          Не удалось загрузить чат
        </h1>

        <div
          className="bg-muted/60 text-muted-foreground my-8 flex size-20 items-center justify-center rounded-full"
          aria-hidden
        >
          <MessageCircleOff className="size-10 stroke-[1.5]" />
        </div>

        <Button asChild size="lg" className="min-w-44 shadow-sm">
          <Link to={deepListHref}>
            <ChevronLeft className="size-4" aria-hidden />
            К списку
          </Link>
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
          isErrorState && snapshot ? (
            <ChatErrorPanel error={resolveSnapshotError(snapshot, error)} />
          ) : (
            chatMessages
          )
        }
        overlay={
          snapshot?.pending_action && !isErrorState && !customVariantMode ? (
            <ApprovalOverlay
              pendingAction={snapshot.pending_action}
              onApprove={handleApprove}
              onReject={handleReject}
              onUseCustomInput={() =>
                setCustomVariantActionId(
                  snapshot.pending_action?.action_id ?? null,
                )
              }
              hideApprove={hideApprove}
            />
          ) : undefined
        }
        terminalBanner={terminalNotice ?? undefined}
        composer={
          snapshot && !isTerminal ? (
            <ChatComposer
              disabled={composerDisabled}
              placeholder={getComposerPlaceholder(snapshot.state, customVariantMode)}
              onSend={async (content) => {
                if (customVariantMode && snapshot.pending_action) {
                  await handleCustomVariant(
                    snapshot.pending_action.action_id,
                    content,
                  )
                  setCustomVariantActionId(null)
                  return
                }

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
