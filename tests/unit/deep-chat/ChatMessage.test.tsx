import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { auditSummaryFixtureContent, deepAgentSummaryFixtureContent } from '@/api/fixtures/auditSummaryFixture'
import { ChatMessage } from '@/components/deep/ChatMessage'

describe('ChatMessage', () => {
  it('renders assistant on the left without card chrome', () => {
    render(<ChatMessage role="assistant" content="Ответ" />)

    const assistant = screen.getByTestId('chat-message-assistant')
    expect(assistant.className).not.toMatch(/border|shadow|bg-card/)
    expect(assistant.closest('[data-testid="chat-message-assistant-wrapper"]')).toHaveClass(
      'justify-start',
    )
  })

  it('renders structured assistant summary without borders', () => {
    render(
      <ChatMessage role="assistant" content={deepAgentSummaryFixtureContent} />,
    )

    expect(screen.getByTestId('chat-message-assistant')).toBeInTheDocument()
    expect(screen.getByTestId('audit-summary')).toBeInTheDocument()
    expect(screen.getByText(/Deep analysis/)).toBeVisible()
    expect(screen.getByTestId('chat-message-assistant').className).not.toMatch(
      /border|shadow|bg-card/,
    )
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

  it('renders user message on the right', () => {
    render(<ChatMessage role="user" content="Привет" />)

    expect(screen.getByTestId('chat-message-user').className).toContain(
      'justify-end',
    )
  })
})
