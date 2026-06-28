import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { auditSummaryFixtureContent } from '@/api/fixtures/auditSummaryFixture'
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

  it('renders structured audit summary for assistant fixture', () => {
    render(<ChatMessage role="assistant" content={auditSummaryFixtureContent} />)

    expect(screen.getByTestId('audit-summary')).toBeInTheDocument()
    expect(screen.getByText(/Детекция/)).toBeVisible()
    expect(screen.getByText(/gate_id: 42/)).toBeVisible()
  })
})
