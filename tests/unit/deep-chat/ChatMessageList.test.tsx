import { render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { describe, expect, it } from 'vitest'

import { ChatMessageList } from '@/components/deep/ChatMessageList'
import type { DeepChatDisplayMessage } from '@/lib/deepChatDisplay'

const messages: DeepChatDisplayMessage[] = [
  { id: 'user-1', role: 'user', content: 'Привет' },
  { id: 'asst-1', role: 'assistant', content: 'Ответ' },
]

function TallChatList(props: {
  isAgentThinking?: boolean
  extraMessages?: DeepChatDisplayMessage[]
}) {
  useEffect(() => {
    const container = screen.getByTestId('chat-message-list')
    Object.defineProperty(container, 'clientHeight', {
      configurable: true,
      value: 120,
    })
    Object.defineProperty(container, 'scrollHeight', {
      configurable: true,
      value: 480,
    })
    container.scrollTop = 0
    container.dispatchEvent(new Event('scroll'))
  }, [props.isAgentThinking, props.extraMessages?.length])

  return (
    <div className="h-[120px]">
      <ChatMessageList
        messages={[...messages, ...(props.extraMessages ?? [])]}
        isAgentThinking={props.isAgentThinking}
      />
    </div>
  )
}

describe('ChatMessageList', () => {
  it('does not force scroll to bottom while thinking if user scrolled up', () => {
    const { rerender } = render(<TallChatList isAgentThinking={false} />)

    const container = screen.getByTestId('chat-message-list')
    container.scrollTop = 0
    container.dispatchEvent(new Event('scroll'))

    rerender(
      <TallChatList
        isAgentThinking
        extraMessages={[
          { id: 'user-2', role: 'user', content: 'Ещё вопрос' },
        ]}
      />,
    )

    expect(container.scrollTop).toBe(0)
    expect(screen.getByTestId('agent-thinking')).toBeInTheDocument()
  })
})
