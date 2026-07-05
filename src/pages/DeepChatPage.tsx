import { ChevronLeft } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router'

import type { ChatSnapshot } from '@/api/fixtures/chatSnapshot'
import { CaseMetaStrip } from '@/components/deep/CaseMetaStrip'
import { ChatComposer } from '@/components/deep/ChatComposer'
import { ChatMessageList } from '@/components/deep/ChatMessageList'
import { ChatStateNotice } from '@/components/deep/ChatStateNotice'
import { ChatWindow } from '@/components/deep/ChatWindow'
import { StatusBadge, type StatusBadgeVariant } from '@/components/StatusBadge'
import { useDeepChat } from '@/hooks/useDeepChat'
import { useGateDisplayName } from '@/hooks/useGateDisplayName'
import { findFixtureDeepCaseConclusion } from '@/lib/deepCaseConclusion'
import { buildDeepChatDisplayMessages } from '@/lib/deepChatDisplay'
import { getAgentThinkingLabel, type AgentThinkingPhase } from '@/lib/deepChatThinking'
import { buildDeepChatUsageHref } from '@/lib/usageNavigation'

const CLOSED_CHAT_STATES = new Set<ChatSnapshot['state']>([
  'completed',
  'cancelled',
])

const TERMINAL_STATES = CLOSED_CHAT_STATES

interface DeepChatLocationState {
  deepListSearch?: string
  /** Conclusion hypothesis-агента из deep list до POST open. */
  hypothesisConclusion?: string
}

function toStatusBadgeVariant(state: ChatSnapshot['state']): StatusBadgeVariant {
  return state
}

function getComposerPlaceholder(
  isAgentThinking: boolean,
  thinkingPhase: AgentThinkingPhase,
): string {
  if (isAgentThinking) {
    return getAgentThinkingLabel(thinkingPhase)
  }
  return 'Напишите агенту…'
}

function createFallbackSnapshot(auditId: string): ChatSnapshot {
  return {
    audit_id: auditId,
    session_id: null,
    state: 'active',
    messages: [],
    pending_action: null,
  }
}

/**
 * Страница `/deep/{audit_id}` — deep chat с LLM-layout.
 *
 * MCP execute на бэкенде автоматический; human-in-the-loop approve/reject не используется.
 */
export function DeepChatPage() {
  const { auditId } = useParams()
  const location = useLocation()
  const locationState = location.state as DeepChatLocationState | null
  const deepListSearch = locationState?.deepListSearch

  const deepListHref = deepListSearch ? `/deep?${deepListSearch}` : '/deep'

  const seedConclusionFromNav =
    locationState?.hypothesisConclusion ??
    (auditId ? findFixtureDeepCaseConclusion(auditId) : null)

  const {
    snapshot,
    clientChatError,
    optimisticUserMessage,
    isAgentThinking,
    agentThinkingPhase,
    isOpening,
    sendMessage,
    refetch,
  } = useDeepChat(auditId ?? '', {
    seedConclusion: seedConclusionFromNav,
  })

  const seedHypothesisConclusion =
    snapshot?.state === 'completed' || snapshot?.state === 'cancelled'
      ? null
      : seedConclusionFromNav

  const displayMessages = useMemo(() => {
    if (snapshot) {
      return buildDeepChatDisplayMessages(snapshot, {
        optimisticUserMessage,
        seedHypothesisConclusion,
        clientError: clientChatError,
      })
    }

    if (clientChatError && auditId) {
      return buildDeepChatDisplayMessages(createFallbackSnapshot(auditId), {
        clientError: clientChatError,
        seedHypothesisConclusion,
      })
    }

    if (seedHypothesisConclusion && auditId) {
      return buildDeepChatDisplayMessages(
        {
          audit_id: auditId,
          session_id: null,
          state: 'not_started',
          messages: [],
          pending_action: null,
        },
        { seedHypothesisConclusion },
      )
    }

    return []
  }, [
    auditId,
    clientChatError,
    optimisticUserMessage,
    seedHypothesisConclusion,
    snapshot,
  ])

  const showAgentThinking =
    isAgentThinking &&
    (Boolean(optimisticUserMessage) ||
      displayMessages.some(
        (message) => message.role === 'user' || message.variant === 'hypothesis',
      ))

  const isTerminal = snapshot ? TERMINAL_STATES.has(snapshot.state) : false
  const isClosedChat = snapshot ? CLOSED_CHAT_STATES.has(snapshot.state) : false

  const gateId = snapshot?.gate_id
  const resolvedGateName = useGateDisplayName(
    snapshot?.gate_name ? undefined : gateId,
  )
  const displayGateName = snapshot?.gate_name ?? resolvedGateName ?? undefined
  const usageHref = buildDeepChatUsageHref()

  const composerDisabled =
    isTerminal || isOpening || isAgentThinking || snapshot?.state === 'not_started'

  const terminalNotice = useMemo(() => {
    if (!snapshot || !isClosedChat) {
      return null
    }

    return (
      <ChatStateNotice
        state={snapshot.state as 'completed' | 'cancelled'}
      />
    )
  }, [isClosedChat, snapshot])

  const chatMessages = useMemo(() => {
    if (displayMessages.length > 0 || showAgentThinking) {
      return (
        <ChatMessageList
          messages={displayMessages}
          isAgentThinking={showAgentThinking}
          agentThinkingPhase={agentThinkingPhase}
        />
      )
    }

    return (
      <p className="text-muted-foreground p-4 text-sm">Сообщений пока нет</p>
    )
  }, [displayMessages, showAgentThinking])

  if (!auditId) {
    return null
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
                  gateId={snapshot.gate_id ?? '—'}
                  gateName={displayGateName}
                  createdAt={snapshot.created_at ?? ''}
                />
              ) : null}
              <Link
                to={usageHref}
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
        messages={chatMessages}
        terminalBanner={terminalNotice ?? undefined}
        composer={
          snapshot && !isTerminal ? (
            <ChatComposer
              disabled={composerDisabled}
              placeholder={getComposerPlaceholder(
                isAgentThinking,
                agentThinkingPhase,
              )}
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
