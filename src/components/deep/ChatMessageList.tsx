import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { AgentThinkingIndicator } from '@/components/deep/AgentThinkingIndicator'
import { ChatMessage } from '@/components/deep/ChatMessage'
import type { DeepChatDisplayMessage } from '@/lib/deepChatDisplay'
import { cn } from '@/lib/utils'

export interface ChatMessageListProps {
  messages: DeepChatDisplayMessage[]
  isAgentThinking?: boolean
  className?: string
}

/**
 * Список сообщений с auto scroll-to-bottom при «у низа», chip «N новых» и индикатором thinking.
 */
export function ChatMessageList({
  messages,
  isAgentThinking = false,
  className,
}: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const prevLengthRef = useRef(messages.length)

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current
    if (!container) {
      return
    }
    container.scrollTop = container.scrollHeight
    setUnreadCount(0)
    setIsAtBottom(true)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return undefined
    }

    const handleScroll = () => {
      const distance =
        container.scrollHeight - container.scrollTop - container.clientHeight
      const atBottom = distance < 48
      setIsAtBottom(atBottom)
      if (atBottom) {
        setUnreadCount(0)
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const prevLength = prevLengthRef.current
    prevLengthRef.current = messages.length

    if (messages.length <= prevLength) {
      return
    }

    if (isAtBottom) {
      scrollToBottom()
      return
    }

    setUnreadCount((count) => count + (messages.length - prevLength))
  }, [messages, isAtBottom, scrollToBottom])

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom()
    }
  }, [messages, isAgentThinking, isAtBottom, scrollToBottom])

  let content: ReactNode = (
    <p className="text-muted-foreground text-sm">Сообщений пока нет</p>
  )

  if (messages.length > 0 || isAgentThinking) {
    content = (
      <>
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            variant={message.variant}
          />
        ))}
        {isAgentThinking ? <AgentThinkingIndicator /> : null}
      </>
    )
  }

  return (
    <div className={cn('relative h-full', className)}>
      <div
        ref={containerRef}
        className="chat-message-scroll h-full overflow-y-auto p-4"
        aria-live="polite"
        data-testid="chat-message-list"
      >
        {content}
      </div>
      {unreadCount > 0 ? (
        <button
          type="button"
          className="bg-primary text-primary-foreground absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs shadow"
          onClick={scrollToBottom}
        >
          {unreadCount} новых
        </button>
      ) : null}
    </div>
  )
}
