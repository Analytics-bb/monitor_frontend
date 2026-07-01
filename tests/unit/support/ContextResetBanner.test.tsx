import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ContextResetBanner } from '@/components/support/ContextResetBanner'

describe('ContextResetBanner', () => {
  it('shows banner when visible', () => {
    render(<ContextResetBanner visible onDismiss={() => undefined} />)

    expect(screen.getByTestId('support-context-reset-banner')).toBeInTheDocument()
    expect(screen.getByText(/История очищена/)).toBeInTheDocument()
  })

  it('calls onDismiss', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()

    render(<ContextResetBanner visible onDismiss={onDismiss} />)
    await user.click(screen.getByLabelText('Скрыть уведомление'))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
