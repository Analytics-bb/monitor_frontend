import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { SupportPage } from '@/pages/SupportPage'

vi.mock('@/hooks/useSupportChat', () => ({
  useSupportChat: () => ({
    snapshot: {
      chat_id: '11111111-1111-4111-8111-111111111111',
      user_id: 'admin',
      state: 'active',
      messages: [],
      context_generation: 0,
      context_reset: false,
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
  }),
}))

describe('SupportPage', () => {
  it('renders support chat layout', () => {
    render(
      <MemoryRouter>
        <SupportPage />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('support-page')).toBeInTheDocument()
    expect(screen.getByTestId('chat-window')).toBeInTheDocument()
    expect(screen.getByTestId('support-composer')).toBeInTheDocument()
    expect(screen.queryByText('Саппорт — скоро')).not.toBeInTheDocument()
  })
})
