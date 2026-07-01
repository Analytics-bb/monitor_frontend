import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { SupportPage } from '@/pages/SupportPage'

const useSupportChatMock = vi.fn()

vi.mock('@/hooks/useSupportChat', () => ({
  useSupportChat: () => useSupportChatMock(),
}))

function makeMessages(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    message_id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    role: index % 2 === 0 ? ('user' as const) : ('assistant' as const),
    content: `message ${index + 1}`,
    created_at: '2025-07-14 10:00:00',
  }))
}

describe('SupportPage', () => {
  it('renders support chat layout', () => {
    useSupportChatMock.mockReturnValue({
      snapshot: {
        chat_id: '11111111-1111-4111-8111-111111111111',
        user_id: 'admin',
        state: 'active',
        messages: [],
        context_generation: 0,
        context_reset: false,
        history_message_limit: 40,
        usage_total: {
          model: 'test',
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
          estimated_cost_usd: 0,
        },
      },
      error: null,
      attachmentLabels: new Map(),
      sendMessage: vi.fn(),
      uploadAttachment: vi.fn(),
      resetChat: vi.fn(),
    })

    render(
      <MemoryRouter>
        <SupportPage />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('support-page')).toBeInTheDocument()
    expect(screen.getByTestId('chat-window')).toBeInTheDocument()
    expect(screen.getByTestId('support-composer')).toBeInTheDocument()
    expect(screen.getByTestId('chat-window-empty')).toHaveTextContent(
      'Задайте ваш вопрос',
    )
  })

  it('blocks composer and shows warning when history limit reached', async () => {
    const user = userEvent.setup()
    const resetChat = vi.fn().mockResolvedValue(undefined)

    useSupportChatMock.mockReturnValue({
      snapshot: {
        chat_id: '11111111-1111-4111-8111-111111111111',
        user_id: 'admin',
        state: 'active',
        messages: makeMessages(40),
        context_generation: 0,
        context_reset: false,
        history_message_limit: 40,
        usage_total: {
          model: 'test',
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
          estimated_cost_usd: 0,
        },
      },
      error: null,
      attachmentLabels: new Map(),
      sendMessage: vi.fn(),
      uploadAttachment: vi.fn(),
      resetChat,
    })

    render(
      <MemoryRouter>
        <SupportPage />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('support-history-limit-banner')).toBeInTheDocument()
    expect(screen.getByLabelText('Сообщение в support')).toBeDisabled()

    await user.click(screen.getByTestId('support-history-limit-decline'))
    expect(screen.getByText(/отправка сообщений недоступна/i)).toBeInTheDocument()

    await user.click(screen.getByTestId('support-history-limit-accept'))
    expect(resetChat).toHaveBeenCalledTimes(1)
  })
})
