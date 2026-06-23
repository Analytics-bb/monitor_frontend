import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChatWindow } from '@/components/deep/ChatWindow'

describe('ChatWindow', () => {
  it('renders composer at the bottom below messages area', () => {
    render(
      <ChatWindow
        messages={<div data-testid="messages-content">Messages</div>}
        composer={<div data-testid="composer-content">Composer</div>}
      />,
    )

    const window = screen.getByTestId('chat-window')
    const messages = screen.getByTestId('chat-window-messages')
    const composer = screen.getByTestId('chat-window-composer')

    expect(window.contains(messages)).toBe(true)
    expect(window.contains(composer)).toBe(true)

    const windowChildren = Array.from(window.children)
    const messagesIndex = windowChildren.findIndex((node) =>
      node.contains(messages),
    )
    const composerIndex = windowChildren.findIndex((node) =>
      node.contains(composer),
    )

    expect(messagesIndex).toBeGreaterThanOrEqual(0)
    expect(composerIndex).toBeGreaterThan(messagesIndex)
    expect(screen.getByTestId('messages-content')).toBeVisible()
    expect(screen.getByTestId('composer-content')).toBeVisible()
  })
})
