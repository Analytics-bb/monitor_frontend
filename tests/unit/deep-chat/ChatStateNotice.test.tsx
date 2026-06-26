import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChatStateNotice } from '@/components/deep/ChatStateNotice'

describe('ChatStateNotice', () => {
  it('renders completed notice', () => {
    render(<ChatStateNotice state="completed" />)

    expect(screen.getByTestId('chat-state-notice-completed')).toBeVisible()
    expect(screen.getByText(/Анализ завершён/)).toBeVisible()
  })

  it('renders cancelled notice', () => {
    render(<ChatStateNotice state="cancelled" />)

    expect(screen.getByTestId('chat-state-notice-cancelled')).toBeVisible()
    expect(screen.getByText(/Анализ отменён/)).toBeVisible()
  })
})
