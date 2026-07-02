import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { auditSummaryFixtureContent, deepAgentSummaryFixtureContent } from '@/api/fixtures/auditSummaryFixture'
import { ChatMessage } from '@/components/deep/ChatMessage'

describe('ChatMessage', () => {
  it('renders user message on the right and assistant on the left', () => {
    const { rerender } = render(
      <ChatMessage role="user" content="Привет" />,
    )

    const userBubble = screen.getByTestId('chat-message-user')
    expect(userBubble.className).toContain('justify-end')

    rerender(<ChatMessage role="assistant" content="Ответ" />)

    const assistantBubble = screen.getByTestId('chat-message-assistant')
    expect(assistantBubble.className).toContain('justify-start')
  })

  it('renders hypothesis output as user bubble on the right', () => {
    render(
      <ChatMessage
        role="user"
        variant="hypothesis"
        content={auditSummaryFixtureContent}
      />,
    )

    expect(screen.getByTestId('chat-message-hypothesis')).toBeInTheDocument()
    expect(screen.getByText(/Детекция/)).toBeVisible()
  })

  it('renders structured assistant summary in card layout', () => {
    render(
      <ChatMessage role="assistant" content={deepAgentSummaryFixtureContent} />,
    )

    expect(screen.getByTestId('chat-message-assistant')).toBeInTheDocument()
    expect(screen.getByTestId('audit-summary')).toBeInTheDocument()
    expect(screen.getByText(/Deep analysis/)).toBeVisible()
  })
})
