import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChatErrorPanel } from '@/components/deep/ChatErrorPanel'

describe('ChatErrorPanel', () => {
  it('renders API error envelope fields', () => {
    render(
      <ChatErrorPanel
        error={{
          error_code: 'budget_exceeded',
          message: 'Превышен лимит токенов.',
          details: { limit_usd: 5 },
        }}
      />,
    )

    expect(screen.getByTestId('chat-error-panel')).toBeInTheDocument()
    expect(screen.getByText('budget_exceeded')).toBeVisible()
    expect(screen.getByText('Превышен лимит токенов.')).toBeVisible()
    expect(screen.getByText(/"limit_usd": 5/)).toBeVisible()
  })
})
